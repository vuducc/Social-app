import json
import logging
from datetime import datetime, timezone

from fastapi.background import BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.follow import Follow
from app.services.notification_service import NotificationService
from app.utils.constants import NotificationTypes

logger = logging.getLogger(__name__)


class PostNotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.notification_service = NotificationService(db)

    async def notify_new_post(
        self,
        post_id: str,
        author_id: str,
        author_name: str,
    ):
        """Thông báo cho followers khi có bài viết mới"""
        try:
            followers = await self._get_user_followers(author_id)
            if not followers:
                return

            follower_ids = [follower.user_id for follower in followers]

            notification = {
                "type": NotificationTypes.NEW_POST,
                "title": "Bài viết mới",
                "body": f"{author_name} vừa đăng một bài viết mới",
                "data": json.dumps(
                    {
                        "post_id": post_id,
                        "author_id": author_id,
                        "action": "new_post",
                    }
                ),
            }

            await self.notification_service.create_bulk_notification(
                notification,
                recipient_ids=follower_ids,
                sender_id=author_id,
            )
            logger.info(f"Queued bulk notification for {len(follower_ids)} followers")

        except Exception as e:
            logger.error(f"Error in notify_new_post: {str(e)}")
            raise

    async def notify_post_like(
        self,
        post_id: str,
        post_author_id: str,
        liker_id: str,
        liker_name: str,
    ):
        """Thông báo khi có người like bài viết"""
        if liker_id != post_author_id:
            try:
                # Tìm thông báo like gần nhất của bài viết này (trong khoảng 5 phút)
                recent_notification = (
                    await self.notification_service.find_recent_notification(
                        notification_type=NotificationTypes.POST_LIKE,
                        reference_id=post_id,
                        recipient_id=post_author_id,
                        minutes=5,
                    )
                )

                if recent_notification:
                    # Cập nhật thông báo gom nhóm
                    await self.notification_service.update_grouped_notification(
                        notification_id=recent_notification.notification_id,
                        new_sender_id=liker_id,
                        new_sender_name=liker_name,
                    )
                    logger.info(f"Updated grouped like notification for post {post_id}")
                else:
                    # Tạo thông báo mới
                    notification = {
                        "type": NotificationTypes.POST_LIKE,
                        "title": "Lượt thích mới",
                        "body": f"{liker_name} đã thích bài viết của bạn",
                        "recipient_id": post_author_id,
                        "data": json.dumps(
                            {
                                "post_id": post_id,
                                "action": "post_like",
                                "sender_ids": [liker_id],
                                "sender_names": [liker_name],
                                "created_at": datetime.now(timezone.utc).isoformat(),
                            }
                        ),
                    }
                    await self.notification_service.create_notification(
                        notification,
                        sender_id=liker_id,
                    )
                    logger.info(f"Created new like notification for post {post_id}")

            except Exception as e:
                logger.error(f"Error in notify_post_like: {str(e)}")
                raise

    async def notify_post_comment(
        self,
        post_id: str,
        post_author_id: str,
        commenter_id: str,
        commenter_name: str,
        comment_id: str,
    ):
        """Thông báo khi có người comment bài viết"""
        if commenter_id != post_author_id:
            notification = {
                "type": NotificationTypes.POST_COMMENT,
                "title": "Bình luận mới",
                "body": f"{commenter_name} đã bình luận bài viết của bạn",
                "recipient_id": post_author_id,
                "data": json.dumps(
                    {
                        "post_id": post_id,
                        "comment_id": comment_id,
                        "commenter_id": commenter_id,
                        "action": "post_comment",
                    }
                ),
            }
            await self.notification_service.create_notification(
                notification,
                sender_id=commenter_id,
            )

    async def notify_comment_reply(
        self,
        post_id: str,
        comment_id: str,
        parent_comment_id: str,
        parent_commenter_id: str,
        replier_id: str,
        replier_name: str,
    ):
        """Thông báo khi có người reply comment"""
        if replier_id != parent_commenter_id:
            notification = {
                "type": NotificationTypes.COMMENT_REPLY,
                "title": "Trả lời bình luận",
                "body": f"{replier_name} đã trả lời bình luận của bạn",
                "recipient_id": parent_commenter_id,
                "data": json.dumps(
                    {
                        "post_id": post_id,
                        "comment_id": comment_id,
                        "parent_comment_id": parent_comment_id,
                        "replier_id": replier_id,
                        "action": "comment_reply",
                    }
                ),
            }
            await self.notification_service.create_notification(
                notification,
                sender_id=replier_id,
            )

    async def notify_comment_like(
        self,
        post_id: str,
        comment_id: str,
        comment_author_id: str,
        liker_id: str,
        liker_name: str,
    ):
        """Thông báo khi có người like comment"""
        if liker_id != comment_author_id:
            notification = {
                "type": NotificationTypes.COMMENT_LIKE,
                "title": "Lượt thích mới",
                "body": f"{liker_name} đã thích bình luận của bạn",
                "recipient_id": comment_author_id,
                "data": json.dumps(
                    {
                        "post_id": post_id,
                        "comment_id": comment_id,
                        "liker_id": liker_id,
                        "action": "comment_like",
                    }
                ),
            }
            await self.notification_service.create_notification(
                notification,
                sender_id=liker_id,
            )

    async def notify_post_mention(
        self,
        post_id: str,
        author_id: str,
        author_name: str,
        mentioned_user_ids: list[str],
    ):
        """Thông báo khi được tag trong bài viết"""
        for user_id in mentioned_user_ids:
            if user_id != author_id:
                notification = {
                    "type": NotificationTypes.POST_MENTION,
                    "title": "Được nhắc đến",
                    "body": f"{author_name} đã nhắc đến bạn trong một bài viết",
                    "recipient_id": user_id,
                    "data": json.dumps(
                        {
                            "post_id": post_id,
                            "author_id": author_id,
                            "action": "post_mention",
                        }
                    ),
                }
                await self.notification_service.create_notification(
                    notification,
                    sender_id=author_id,
                )

    async def notify_comment_mention(
        self,
        post_id: str,
        comment_id: str,
        commenter_id: str,
        commenter_name: str,
        mentioned_user_ids: list[str],
    ):
        """Thông báo khi được tag trong comment"""
        for user_id in mentioned_user_ids:
            if user_id != commenter_id:
                notification = {
                    "type": NotificationTypes.COMMENT_MENTION,
                    "title": "Được nhắc đến trong bình luận",
                    "body": f"{commenter_name} đã nhắc đến bạn trong một bình luận",
                    "recipient_id": user_id,
                    "data": json.dumps(
                        {
                            "post_id": post_id,
                            "comment_id": comment_id,
                            "commenter_id": commenter_id,
                            "action": "comment_mention",
                        }
                    ),
                }
                await self.notification_service.create_notification(
                    notification,
                    sender_id=commenter_id,
                )

    async def _get_user_followers(self, user_id: str):
        """Lấy danh sách followers của user"""
        result = await self.db.execute(
            select(Follow).where(Follow.following_id == user_id)
        )
        return result.scalars().all()

    async def notify_new_comment(
        self,
        post_id: str,
        post_author_id: str,
        commenter_id: str,
        commenter_name: str,
        comment_content: str,
    ):
        """Thông báo khi có comment mới"""
        if commenter_id != post_author_id:
            try:
                # Tìm thông báo comment gần nhất của bài viết này (trong khoảng 5 phút)
                recent_notification = (
                    await self.notification_service.find_recent_notification(
                        notification_type=NotificationTypes.NEW_COMMENT,
                        reference_id=post_id,
                        recipient_id=post_author_id,
                        minutes=5,
                    )
                )

                if recent_notification:
                    # Cập nhật thông báo gom nhóm
                    await self.notification_service.update_grouped_notification(
                        notification_id=recent_notification.notification_id,
                        new_sender_id=commenter_id,
                        new_sender_name=commenter_name,
                    )
                    logger.info(
                        f"Updated grouped comment notification for post {post_id}"
                    )
                else:
                    # Tạo thông báo mới
                    notification = {
                        "type": NotificationTypes.NEW_COMMENT,
                        "title": "Bình luận mới",
                        "body": f"{commenter_name} đã bình luận về bài viết của bạn",
                        "recipient_id": post_author_id,
                        "data": json.dumps(
                            {
                                "post_id": post_id,
                                "action": "new_comment",
                                "sender_ids": [commenter_id],
                                "sender_names": [commenter_name],
                                "comment_content": (
                                    comment_content[:100] + "..."
                                    if len(comment_content) > 100
                                    else comment_content
                                ),
                                "created_at": datetime.utcnow().isoformat(),
                            }
                        ),
                    }
                    await self.notification_service.create_notification(
                        notification,
                        sender_id=commenter_id,
                    )
                    logger.info(f"Created new comment notification for post {post_id}")

            except Exception as e:
                logger.error(f"Error in notify_new_comment: {str(e)}")
                raise
