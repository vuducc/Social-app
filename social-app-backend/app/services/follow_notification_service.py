import json

from app.services.notification_service import NotificationService
from app.utils.constants import NotificationTypes


class FollowNotificationService:
    def __init__(self, db):
        self.db = db
        self.notification_service = NotificationService(db)

    async def notify_follow_request(
        self,
        follower_id: str,
        follower_name: str,
        target_user_id: str,
    ):
        """Thông báo khi có yêu cầu follow"""
        notification = {
            "type": NotificationTypes.FOLLOW_REQUEST,
            "title": "Yêu cầu theo dõi mới",
            "body": f"{follower_name} muốn theo dõi bạn",
            "recipient_id": target_user_id,
            "data": json.dumps(
                {"follower_id": follower_id, "action": "follow_request"}
            ),
        }
        await self.notification_service.create_notification(
            notification,
            sender_id=follower_id,
        )

    async def notify_follow_accept(
        self,
        follower_id: str,
        target_user_id: str,
        target_user_name: str,
    ):
        """Thông báo khi yêu cầu follow được chấp nhận"""
        notification = {
            "type": NotificationTypes.FOLLOW,
            "title": "Yêu cầu theo dõi được chấp nhận",
            "body": f"{target_user_name} đã chấp nhận yêu cầu theo dõi của bạn",
            "recipient_id": follower_id,
            "data": json.dumps({"user_id": target_user_id, "action": "follow_accept"}),
        }
        await self.notification_service.create_notification(
            notification,
            sender_id=target_user_id,
        )

    async def notify_new_follower(
        self,
        follower_id: str,
        follower_name: str,
        target_user_id: str,
    ):
        """Thông báo khi có người mới follow mình"""
        notification = {
            "type": NotificationTypes.FOLLOW,
            "title": "Người theo dõi mới",
            "body": f"{follower_name} đã bắt đầu theo dõi bạn",
            "recipient_id": target_user_id,
            "data": json.dumps({"follower_id": follower_id, "action": "new_follow"}),
        }
        await self.notification_service.create_notification(
            notification,
            sender_id=follower_id,
        )
