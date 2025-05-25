from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Like


class LikeService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def toggle_like(self, user_id: str, post_id: str) -> tuple[bool, int]:
        # Check if like exists
        stmt = select(Like).where(
            and_(Like.user_id == user_id, Like.post_id == post_id)
        )
        result = await self.db.execute(stmt)
        existing_like = result.scalar_one_or_none()

        if existing_like:
            # Unlike
            await self.db.delete(existing_like)
            is_liked = False
        else:
            # Like
            new_like = Like(user_id=user_id, post_id=post_id)
            self.db.add(new_like)
            is_liked = True

        await self.db.commit()

        # Get updated likes count
        likes_count = await self.db.scalar(
            select(func.count(Like.like_id)).where(Like.post_id == post_id)
        )

        return is_liked, likes_count
