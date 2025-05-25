import asyncio
import json
import logging
from typing import Optional

from sqlalchemy import select

from app.celery_app import celery_app
from app.core.database import SessionLocal
from app.core.firebase import send_push_notification
from app.models.device_token import DeviceToken
from app.models.notification import Notification
from app.models.notification_recipient import NotificationRecipient

logger = logging.getLogger(__name__)


def run_async(coroutine):
    """Helper function để chạy coroutine trong sync context"""
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(coroutine)


@celery_app.task(name="app.tasks.notification_tasks.create_bulk_notification")
def create_bulk_notification_task(
    notification_data: dict, recipient_ids: list[str], sender_id: Optional[str] = None
):
    """Celery task để tạo notification cho nhiều người"""
    try:
        db = SessionLocal()

        # Tạo notification
        notification = Notification(
            type=notification_data["type"],
            title=notification_data["title"],
            body=notification_data["body"],
            data=notification_data["data"],
            sender_id=sender_id,
        )
        db.add(notification)
        run_async(db.commit())
        run_async(db.refresh(notification))

        # Tạo notification recipients
        recipients = [
            NotificationRecipient(
                notification_id=notification.notification_id,
                recipient_id=recipient_id,
            )
            for recipient_id in recipient_ids
        ]
        db.add_all(recipients)
        run_async(db.commit())

        # Gửi push notifications
        for recipient_id in recipient_ids:
            # Lấy device tokens của user
            result = run_async(
                db.execute(
                    select(DeviceToken).where(DeviceToken.user_id == recipient_id)
                )
            )
            device_tokens = result.scalars().all()

            # Gửi notification đến tất cả devices của user
            for device in device_tokens:
                send_push_notification_task.delay(
                    token=device.token,  # Sử dụng FCM token thay vì user_id
                    title=notification_data["title"],
                    body=notification_data["body"],
                    data={
                        "notification_id": notification.notification_id,
                        "type": notification_data["type"],
                        **json.loads(notification_data["data"]),
                    },
                )

        logger.info(f"Created bulk notification for {len(recipient_ids)} recipients")

    except Exception as e:
        logger.error(f"Error creating bulk notification: {str(e)}")
        raise
    finally:
        run_async(db.close())


@celery_app.task(name="app.tasks.notification_tasks.create_notification")
def create_notification_task(notification_data: dict, sender_id: Optional[str] = None):
    """Celery task để tạo notification"""
    try:
        db = SessionLocal()

        # Tạo notification trong DB
        notification = Notification(
            type=notification_data["type"],
            title=notification_data["title"],
            body=notification_data["body"],
            data=notification_data["data"],
            sender_id=sender_id,
        )
        db.add(notification)
        run_async(db.commit())
        run_async(db.refresh(notification))

        # Tạo notification recipient
        recipient = NotificationRecipient(
            notification_id=notification.notification_id,
            recipient_id=notification_data["recipient_id"],
        )
        db.add(recipient)
        run_async(db.commit())

        # Parse data để chuẩn bị cho FCM
        fcm_data = json.loads(notification_data["data"])
        # Chuyển đổi tất cả giá trị thành string
        string_data = {
            k: str(v) if not isinstance(v, list) else json.dumps(v)
            for k, v in fcm_data.items()
        }

        # Gửi push notification với data đã được chuẩn hóa
        result = run_async(
            db.execute(
                select(DeviceToken).where(
                    DeviceToken.user_id == notification_data["recipient_id"]
                )
            )
        )
        device_tokens = result.scalars().all()

        for device in device_tokens:
            send_push_notification_task.delay(
                token=device.token,
                title=notification_data["title"],
                body=notification_data["body"],
                data=string_data,
            )

        logger.info(f"Created notification: {notification.notification_id}")

    except Exception as e:
        logger.error(f"Error creating notification: {str(e)}")
        raise
    finally:
        run_async(db.close())


@celery_app.task(name="app.tasks.notification_tasks.send_push_notification")
def send_push_notification_task(token: str, title: str, body: str, data: dict = None):
    """Celery task để gửi push notification"""
    try:
        success = run_async(
            send_push_notification(token=token, title=title, body=body, data=data)
        )
        if not success:
            logger.error(f"Failed to send push notification to token: {token}")
    except Exception as e:
        logger.error(f"Error in push notification task: {str(e)}")
