from datetime import datetime, timedelta
from typing import Dict, List

from sqlalchemy import and_, distinct, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.comment import Comment
from app.models.conversation import Conversation
from app.models.like import Like
from app.models.message import Message
from app.models.notification import Notification
from app.models.post import Post
from app.models.user import User
from app.models.user_session import UserSession


class StatisticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_growth_stats(self, days: int = 30) -> List[Dict]:
        """Get user growth statistics over time"""
        start_date = datetime.utcnow() - timedelta(days=days)

        query = text(
            """
            WITH RECURSIVE dates AS (
                SELECT date_trunc('day', now()) as date
                UNION ALL
                SELECT date - interval '1 day'
                FROM dates
                WHERE date > :start_date
            ),
            daily_stats AS (
                SELECT 
                    date_trunc('day', created_at) as date,
                    COUNT(DISTINCT user_id) as new_users_count,
                    SUM(COUNT(DISTINCT user_id)) OVER (
                        ORDER BY date_trunc('day', created_at)
                    ) as total_users
                FROM users
                WHERE created_at >= :start_date
                GROUP BY date_trunc('day', created_at)
            )
            SELECT 
                d.date,
                COALESCE(ds.new_users_count, 0) as new_users_count,
                COALESCE(ds.total_users, 0) as total_users
            FROM dates d
            LEFT JOIN daily_stats ds ON d.date = ds.date
            WHERE d.date >= :start_date
            ORDER BY d.date
            LIMIT :days
        """
        )

        result = await self.db.execute(query, {"start_date": start_date, "days": days})
        return result.mappings().all()

    async def get_post_activity_stats(self, days: int = 30) -> List[Dict]:
        """Get post activity statistics"""
        start_date = datetime.utcnow() - timedelta(days=days)

        query = text(
            """
            WITH RECURSIVE dates AS (
                SELECT date_trunc('day', now()) as date
                UNION ALL
                SELECT date - interval '1 day'
                FROM dates
                WHERE date > :start_date
            ),
            daily_stats AS (
                SELECT 
                    date_trunc('day', p.created_at) as date,
                    COUNT(DISTINCT p.post_id) as total_posts,
                    COUNT(DISTINCT c.comment_id) as total_comments,
                    COUNT(DISTINCT l.like_id) as total_likes
                FROM posts p
                LEFT JOIN comments c ON p.post_id = c.post_id 
                    AND c.created_at >= :start_date
                    AND c.created_at < date_trunc('day', now()) + interval '1 day'
                LEFT JOIN likes l ON p.post_id = l.post_id
                    AND l.created_at >= :start_date
                    AND l.created_at < date_trunc('day', now()) + interval '1 day'
                WHERE p.created_at >= :start_date
                GROUP BY date_trunc('day', p.created_at)
            )
            SELECT 
                d.date,
                COALESCE(ds.total_posts, 0) as total_posts,
                COALESCE(ds.total_comments, 0) as total_comments,
                COALESCE(ds.total_likes, 0) as total_likes
            FROM dates d
            LEFT JOIN daily_stats ds ON d.date = ds.date
            WHERE d.date >= :start_date
            ORDER BY d.date
            LIMIT :days
        """
        )

        result = await self.db.execute(query, {"start_date": start_date, "days": days})
        return result.mappings().all()

    async def get_interaction_stats(self, days: int = 30) -> List[Dict]:
        """Get interaction statistics
        - total_messages: Số tin nhắn được gửi trong ngày
        - active_conversations: Số cuộc hội thoại có tin nhắn trong ngày
        - total_notifications: Số thông báo được tạo trong ngày
        """
        start_date = datetime.utcnow() - timedelta(days=days)

        query = text(
            """
            WITH RECURSIVE dates AS (
                SELECT date_trunc('day', now()) as date
                UNION ALL
                SELECT date - interval '1 day'
                FROM dates
                WHERE date > :start_date
            ),
            daily_messages AS (
                SELECT 
                    date_trunc('day', m.created_at) as date,
                    COUNT(DISTINCT m.message_id) as total_messages,
                    COUNT(DISTINCT m.conversation_id) as active_conversations
                FROM messages m
                WHERE m.created_at >= :start_date
                GROUP BY date_trunc('day', m.created_at)
            ),
            daily_notifications AS (
                SELECT 
                    date_trunc('day', n.created_at) as date,
                    COUNT(DISTINCT n.notification_id) as total_notifications
                FROM notifications n
                WHERE n.created_at >= :start_date
                GROUP BY date_trunc('day', n.created_at)
            )
            SELECT 
                d.date,
                COALESCE(dm.total_messages, 0) as total_messages,
                COALESCE(dm.active_conversations, 0) as active_conversations,
                COALESCE(dn.total_notifications, 0) as total_notifications
            FROM dates d
            LEFT JOIN daily_messages dm ON d.date = dm.date
            LEFT JOIN daily_notifications dn ON d.date = dn.date
            WHERE d.date >= :start_date
            ORDER BY d.date
            LIMIT :days
        """
        )

        result = await self.db.execute(query, {"start_date": start_date, "days": days})
        return result.mappings().all()

    async def get_user_engagement_stats(self) -> Dict:
        """Get user engagement statistics"""
        # Tính toán tổng số lượng
        total_users = await self.db.scalar(select(func.count(User.user_id)))
        total_posts = await self.db.scalar(select(func.count(Post.post_id)))
        total_comments = await self.db.scalar(select(func.count(Comment.comment_id)))
        total_likes = await self.db.scalar(select(func.count(Like.like_id)))

        return {
            "avg_posts_per_user": total_posts / total_users if total_users > 0 else 0,
            "avg_comments_per_post": (
                total_comments / total_posts if total_posts > 0 else 0
            ),
            "avg_likes_per_post": total_likes / total_posts if total_posts > 0 else 0,
            "date": datetime.utcnow(),
        }

    async def get_active_users_count(self, days: int = 7) -> int:
        """Get count of users active in the last X days"""
        start_date = datetime.utcnow() - timedelta(days=days)

        query = select(func.count(distinct(UserSession.user_id))).where(
            UserSession.created_at >= start_date
        )

        return await self.db.scalar(query)

    async def get_user_detail_stats(self) -> Dict:
        """Get detailed user statistics"""
        start_date = datetime.utcnow() - timedelta(days=7)

        query = text(
            """
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (
                    SELECT COUNT(DISTINCT user_id) 
                    FROM user_sessions 
                    WHERE created_at >= :start_date
                ) as total_active_users,
                (SELECT COUNT(*) FROM posts) as total_posts,
                (SELECT COUNT(*) FROM follows) as total_followers
        """
        )

        result = await self.db.execute(query, {"start_date": start_date})
        return result.mappings().one()

    async def get_post_detail_stats(self) -> Dict:
        """Get detailed post statistics"""
        query = text(
            """
            SELECT 
                COUNT(DISTINCT p.post_id) as total_posts,
                COUNT(DISTINCT c.comment_id) as total_comments,
                COUNT(DISTINCT l.like_id) as total_likes,
                CAST(COUNT(DISTINCT c.comment_id) AS FLOAT) / 
                    NULLIF(COUNT(DISTINCT p.post_id), 0) as avg_comments_per_post,
                CAST(COUNT(DISTINCT l.like_id) AS FLOAT) / 
                    NULLIF(COUNT(DISTINCT p.post_id), 0) as avg_likes_per_post
            FROM posts p
            LEFT JOIN comments c ON p.post_id = c.post_id
            LEFT JOIN likes l ON p.post_id = l.post_id
        """
        )

        result = await self.db.execute(query)
        return result.mappings().one()

    async def get_message_detail_stats(self) -> Dict:
        """Get detailed message statistics"""
        query = text(
            """
            SELECT 
                COUNT(DISTINCT c.conversation_id) as total_conversations,
                COUNT(DISTINCT m.message_id) as total_messages,
                COUNT(DISTINCT p.participant_id) as total_participants,
                COALESCE(
                    CAST(COUNT(DISTINCT m.message_id) AS FLOAT) / 
                    NULLIF(COUNT(DISTINCT c.conversation_id), 0),
                    0.0
                ) as avg_messages_per_conversation
            FROM conversations c
            LEFT JOIN messages m ON c.conversation_id = m.conversation_id
            LEFT JOIN participants p ON c.conversation_id = p.conversation_id
            WHERE c.deleted_at IS NULL
        """
        )

        result = await self.db.execute(query)
        return result.mappings().one()
