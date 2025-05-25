import json
import logging
from datetime import datetime
from math import ceil
from typing import List, Optional

from sqlalchemy import and_, func, select, text, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.device_token import DeviceToken
from app.models.notification import Notification
from app.models.notification_recipient import NotificationRecipient
from app.models.user import User
from app.tasks.notification_tasks import (
    create_bulk_notification_task,
    create_notification_task,
    send_push_notification_task,
)

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_notification(
        self,
        notification_data: dict,
        sender_id: Optional[str] = None,
    ) -> None:
        """Tạo notification bằng celery task"""
        try:
            # Gọi celery task để tạo notification
            create_notification_task.delay(
                notification_data=notification_data, sender_id=sender_id
            )
            logger.info(f"Queued notification creation task: {notification_data}")

        except Exception as e:
            logger.error(f"Error queuing notification task: {str(e)}")
            raise

    async def send_push_notification(
        self,
        user_id: str,
        title: str,
        body: str,
        data: dict = None,
    ):
        """Gửi push notification qua celery task"""
        try:
            device_tokens = await self.get_user_devices(user_id)
            for device in device_tokens:
                send_push_notification_task.delay(
                    token=device.token, title=title, body=body, data=data
                )
        except Exception as e:
            logger.error(f"Error queuing push notification: {str(e)}")

    async def get_user_devices(self, user_id: str) -> List[DeviceToken]:
        """Lấy danh sách thiết bị active của user"""
        result = await self.db.execute(
            select(DeviceToken).where(
                and_(DeviceToken.user_id == user_id, DeviceToken.is_active == True)
            )
        )
        return result.scalars().all()

    async def deactivate_device_token(self, token_id: str):
        """Đánh dấu device token không còn active"""
        try:
            query = (
                update(DeviceToken)
                .where(DeviceToken.id == token_id)
                .values(is_active=False)
            )
            await self.db.execute(query)
            await self.db.commit()
        except Exception as e:
            logger.error(f"Error deactivating device token: {str(e)}")
            raise

    async def get_notifications(
        self, user_id: str, page: int = 1, size: int = 20, is_report: bool = None
    ) -> dict:
        """Lấy danh sách thông báo của user với phân trang"""
        try:
            # Base query
            base_query = select(NotificationRecipient).where(
                NotificationRecipient.recipient_id == user_id
            )

            # Add report filter if specified
            if is_report is not None:
                if is_report:
                    base_query = base_query.join(Notification).where(
                        Notification.type == "REPORT"
                    )
                else:
                    base_query = base_query.join(Notification).where(
                        Notification.type != "REPORT"
                    )

            # Get total count
            total = await self.db.scalar(
                select(func.count()).select_from(base_query.subquery())
            )

            offset = (page - 1) * size
            total_pages = ceil(total / size)

            # Get notifications with sender info
            query = (
                select(
                    Notification,
                    NotificationRecipient.is_read,
                    NotificationRecipient.read_at,
                    User.profile_picture_url,
                )
                .select_from(NotificationRecipient)
                .join(
                    Notification,
                    Notification.notification_id
                    == NotificationRecipient.notification_id,
                )
                .outerjoin(User, User.user_id == Notification.sender_id)
                .where(NotificationRecipient.recipient_id == user_id)
            )

            # Add report filter if specified
            if is_report is not None:
                if is_report:
                    query = query.where(Notification.type == "REPORT")
                else:
                    query = query.where(Notification.type != "REPORT")

            # Add ordering and pagination
            query = (
                query.order_by(Notification.created_at.desc())
                .offset(offset)
                .limit(size)
            )

            result = await self.db.execute(query)
            notifications = result.all()

            items = [
                {
                    "notification_id": notif.notification_id,
                    "type": notif.type,
                    "title": notif.title,
                    "body": notif.body,
                    "data": notif.data,
                    "sender_id": notif.sender_id,
                    "sender_profile_picture": profile_picture_url,
                    "created_at": notif.created_at,
                    "is_read": is_read,
                    "read_at": read_at,
                }
                for notif, is_read, read_at, profile_picture_url in notifications
            ]

            return {
                "items": items,
                "total": total,
                "page": page,
                "size": size,
                "pages": total_pages,
            }
        except Exception as e:
            logger.error(f"Error getting notifications: {str(e)}")
            raise

    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """Đánh dấu thông báo đã đọc"""
        query = (
            update(NotificationRecipient)
            .where(
                and_(
                    NotificationRecipient.notification_id == notification_id,
                    NotificationRecipient.recipient_id == user_id,
                    NotificationRecipient.is_read == False,
                )
            )
            .values(is_read=True, read_at=func.now())
        )
        result = await self.db.execute(query)
        await self.db.commit()
        return result.rowcount > 0

    async def get_unread_count(self, user_id: str) -> int:
        """Lấy số lượng thông báo chưa đọc"""
        return await self.db.scalar(
            select(func.count(NotificationRecipient.id)).where(
                and_(
                    NotificationRecipient.recipient_id == user_id,
                    NotificationRecipient.is_read == False,
                )
            )
        )

    async def create_grouped_notification(
        self,
        notification_type: str,
        recipient_id: str,
        sender_ids: list[str],
        reference_id: str,
        action: str,
    ) -> None:
        """Tạo thông báo được gom nhóm"""
        # Get sender names
        sender_names = await self._get_user_names(sender_ids)

        if len(sender_ids) == 1:
            title = "Thông báo mới"
            body = f"{sender_names[0]} {self._get_action_text(action)}"
        elif len(sender_ids) == 2:
            title = "Thông báo mới"
            body = f"{sender_names[0]} và {sender_names[1]} {self._get_action_text(action)}"
        else:
            others_count = len(sender_ids) - 2
            title = f"{len(sender_ids)} thông báo mới"
            body = f"{sender_names[0]}, {sender_names[1]} và {others_count} người khác {self._get_action_text(action)}"

        notification = {
            "type": notification_type,
            "title": title,
            "body": body,
            "recipient_id": recipient_id,
            "data": json.dumps(
                {
                    "reference_id": reference_id,
                    "sender_ids": sender_ids,
                    "action": action,
                }
            ),
        }

        await self.create_notification(notification)

    def _get_action_text(self, action: str) -> str:
        """Get text description for notification action"""
        action_texts = {
            "post_like": "đã thích bài viết của bạn",
            "post_comment": "đã bình luận bài viết của bạn",
            "comment_like": "đã thích bình luận của bạn",
            "comment_reply": "đã trả lời bình luận của bạn",
        }
        return action_texts.get(action, "")

    async def create_bulk_notification(
        self,
        notification_data: dict,
        recipient_ids: list[str],
        sender_id: Optional[str] = None,
    ) -> None:
        """Tạo notification cho nhiều người nhận bằng celery task"""
        try:
            # Gọi celery task để tạo bulk notification
            create_bulk_notification_task.delay(
                notification_data=notification_data,
                recipient_ids=recipient_ids,
                sender_id=sender_id,
            )
            logger.info(
                f"Queued bulk notification task for {len(recipient_ids)} recipients"
            )

        except Exception as e:
            logger.error(f"Error queuing bulk notification task: {str(e)}")
            raise

    async def find_recent_notification(
        self,
        notification_type: str,
        reference_id: str,
        recipient_id: str,
        minutes: int = 5,
    ) -> Optional[Notification]:
        """Tìm thông báo gần nhất của cùng loại"""
        try:
            query = (
                select(Notification)
                .join(NotificationRecipient)
                .where(
                    and_(
                        Notification.type == notification_type,
                        NotificationRecipient.recipient_id == recipient_id,
                        Notification.data.like(f'%"post_id": "{reference_id}"%'),
                        Notification.created_at
                        >= func.now() - text(f"interval '{minutes} minutes'"),
                    )
                )
                .order_by(Notification.created_at.desc())
            )
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error finding recent notification: {str(e)}")
            raise

    async def update_grouped_notification(
        self,
        notification_id: str,
        new_sender_id: str,
        new_sender_name: str,
        max_senders: int = 3,
    ) -> None:
        """Cập nhật thông báo gom nhóm"""
        try:
            notification = await self.db.get(Notification, notification_id)
            if not notification:
                return

            data = json.loads(notification.data)
            sender_ids = data.get("sender_ids", [])
            sender_names = data.get("sender_names", [])

            # Kiểm tra nếu người like đã tồn tại
            if new_sender_id in sender_ids:
                return

            # Thêm người gửi mới vào đầu danh sách
            sender_ids.insert(0, new_sender_id)
            sender_names.insert(0, new_sender_name)

            # Giới hạn số lượng người gửi hiển thị
            sender_ids = sender_ids[:max_senders]
            sender_names = sender_names[:max_senders]

            # Tính tổng số người like
            total_likes = len(sender_ids)

            # Cập nhật nội dung thông báo
            if total_likes == 1:
                body = f"{sender_names[0]} đã thích bài viết của bạn"
            elif total_likes == 2:
                body = (
                    f"{sender_names[0]} và {sender_names[1]} đã thích bài viết của bạn"
                )
            else:
                others_count = total_likes - 1
                body = f"{sender_names[0]} và {others_count} người khác đã thích bài viết của bạn"

            # Cập nhật notification
            notification.body = body
            data.update(
                {
                    "sender_ids": sender_ids,
                    "sender_names": sender_names,
                    "total_likes": total_likes,
                    "updated_at": datetime.utcnow().isoformat(),
                }
            )
            notification.data = json.dumps(data)

            await self.db.commit()
            logger.info(
                f"Updated grouped notification {notification_id} with new sender {new_sender_name}"
            )

        except Exception as e:
            logger.error(f"Error updating grouped notification: {str(e)}")
            await self.db.rollback()
            raise

    async def register_device(
        self,
        user_id: str,
        token: str,
        device_type: str,
        device_id: str,
    ) -> DeviceToken:
        """Đăng ký hoặc cập nhật device token cho push notification"""
        try:
            # Tìm device token hiện tại cho thiết bị này
            existing_device = await self.db.execute(
                select(DeviceToken).where(DeviceToken.device_id == device_id)
            )
            device = existing_device.scalar_one_or_none()

            if device:
                # Nếu device đã tồn tại
                if device.user_id != user_id:
                    # Nếu device được đăng ký bởi user khác, cập nhật user_id mới
                    device.user_id = user_id

                # Cập nhật token và trạng thái
                device.token = token
                device.is_active = True
                logger.info(f"Updated device token for device: {device_id}")
            else:
                # Tạo mới nếu device chưa tồn tại
                device = DeviceToken(
                    user_id=user_id,
                    token=token,
                    device_type=device_type,
                    device_id=device_id,
                    is_active=True,
                )
                self.db.add(device)
                logger.info(f"Registered new device token for user: {user_id}")

            await self.db.commit()
            await self.db.refresh(device)
            return device

        except Exception as e:
            logger.error(f"Error registering device token: {str(e)}")
            await self.db.rollback()
            raise

    async def delete_device(self, user_id: str, device_id: str) -> bool:
        """Xóa thiết bị khỏi danh sách đăng ký"""
        try:
            result = await self.db.execute(
                update(DeviceToken)
                .where(
                    and_(
                        DeviceToken.device_id == device_id,
                        DeviceToken.user_id == user_id,
                        DeviceToken.is_active == True,
                    )
                )
                .values(is_active=False)
            )
            await self.db.commit()
            return result.rowcount > 0
        except Exception as e:
            logger.error(f"Error deleting device: {str(e)}")
            await self.db.rollback()
            raise

    async def get_notification_counts(self, user_id: str) -> dict:
        """Lấy số lượng thông báo và số chưa đọc"""
        try:
            total = await self.db.scalar(
                select(func.count(NotificationRecipient.id)).where(
                    NotificationRecipient.recipient_id == user_id
                )
            )

            unread = await self.get_unread_count(user_id)

            return {"total": total, "unread": unread}
        except Exception as e:
            logger.error(f"Error getting notification counts: {str(e)}")
            raise
