from typing import List

from fastapi import HTTPException, status
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.core.security import get_password_hash
from app.models.comment import Comment
from app.models.follow import Follow
from app.models.notification import Notification
from app.models.notification_recipient import NotificationRecipient
from app.models.post import Post
from app.models.user import User


class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def delete_user(self, user_id: str):
        """Delete a user and all associated data"""
        try:
            # Get user
            user = await self.db.get(User, user_id)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
                )

            # Delete notification recipients
            await self.db.execute(
                delete(NotificationRecipient).where(
                    NotificationRecipient.recipient_id == user_id
                )
            )

            # Delete notifications where user is sender
            await self.db.execute(
                delete(Notification).where(Notification.sender_id == user_id)
            )

            # Delete the user (this will cascade delete other related records)
            await self.db.delete(user)
            await self.db.commit()

        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting user: {str(e)}",
            )

    async def delete_post(self, post_id: str):
        """Delete any post regardless of owner"""
        post = await self.db.get(Post, post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
            )

        await self.db.delete(post)
        await self.db.commit()

    async def delete_comment(self, comment_id: str):
        """Delete any comment regardless of owner"""
        comment = await self.db.get(Comment, comment_id)
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
            )

        await self.db.delete(comment)
        await self.db.commit()

    async def get_all_users(
        self, admin_id: str, skip: int = 0, limit: int = 100
    ) -> List[User]:
        """Get all users except current admin"""
        query = (
            select(User)
            .where(User.user_id != admin_id)  # Exclude current admin
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return result.scalars().all()

    async def ban_user(self, user_id: str):
        """Ban a user"""
        user = await self.db.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        user.is_banned = True
        await self.db.commit()
        await self.db.refresh(user)

    async def unban_user(self, user_id: str):
        """Unban a user"""
        user = await self.db.get(User, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        user.is_banned = False
        await self.db.commit()
        await self.db.refresh(user)

    async def create_user(self, user_data: dict):
        """Create a new user without OTP verification"""
        # Check if email exists
        existing_user = await self.db.scalar(
            select(User).where(User.email == user_data["email"])
        )
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        # Create new user
        new_user = User(
            username=user_data["username"],
            email=user_data["email"],
            password=get_password_hash(user_data["password"]),
            full_name=user_data.get("full_name", ""),
            is_admin=user_data.get("is_admin", False),
        )

        self.db.add(new_user)
        await self.db.commit()
        await self.db.refresh(new_user)
        return new_user
