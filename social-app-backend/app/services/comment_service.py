from typing import List, Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.comment import Comment
from app.models.post import Post
from app.schemas.comment import CommentCreate


class CommentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_comment(
        self, user_id: str, comment_data: CommentCreate
    ) -> Comment:
        # Verify post exists
        post = await self.db.get(Post, comment_data.post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
            )

        # If parent_id is provided, verify parent comment exists
        if comment_data.parent_id:
            reply_to = await self.db.get(Comment, comment_data.parent_id)
            if not reply_to:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parent comment not found",
                )
            if reply_to.post_id != comment_data.post_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Parent comment does not belong to the same post",
                )

            # If replying to a reply, use its parent_id instead
            if reply_to.parent_id:
                comment_data.parent_id = reply_to.parent_id

        # Create comment
        comment = Comment(
            user_id=user_id,
            post_id=comment_data.post_id,
            content=comment_data.content,
            parent_id=comment_data.parent_id,
        )
        self.db.add(comment)
        await self.db.commit()
        await self.db.refresh(comment)
        return comment

    async def get_post_comments(
        self, post_id: str, page: int = 1, limit: int = 20
    ) -> Tuple[List[dict], int]:
        # Get only top-level comments (no parent_id)
        offset = (page - 1) * limit

        # Get total count
        total_count = await self.db.scalar(
            select(func.count(Comment.comment_id))
            .where(Comment.post_id == post_id)
            .where(Comment.parent_id.is_(None))
        )

        # Get comments with user info and replies
        stmt = (
            select(Comment)
            .options(joinedload(Comment.user), joinedload(Comment.replies))
            .where(Comment.post_id == post_id)
            .where(Comment.parent_id.is_(None))
            .order_by(Comment.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        result = await self.db.execute(stmt)
        comments = result.unique().scalars().all()

        # Format comments
        formatted_comments = [self._format_comment(comment) for comment in comments]

        return formatted_comments, total_count

    async def get_comment_replies(
        self, comment_id: str, page: int = 1, limit: int = 20
    ) -> Tuple[List[dict], int]:
        offset = (page - 1) * limit

        # Get total count of replies
        total_count = await self.db.scalar(
            select(func.count(Comment.comment_id)).where(
                Comment.parent_id == comment_id
            )
        )

        # Get replies with user info and parent info
        stmt = (
            select(Comment)
            .options(
                joinedload(Comment.user),
                joinedload(Comment.replies),  # Thêm joinedload cho replies
            )
            .where(Comment.parent_id == comment_id)
            .order_by(Comment.created_at)
            .offset(offset)
            .limit(limit)
        )

        result = await self.db.execute(stmt)
        replies = result.unique().scalars().all()

        # Format replies
        formatted_replies = [self._format_comment(reply) for reply in replies]

        return formatted_replies, total_count

    async def update_comment(
        self, comment_id: str, user_id: str, content: str
    ) -> Comment:
        comment = await self.db.get(Comment, comment_id)
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
            )

        if comment.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this comment",
            )

        comment.content = content
        await self.db.commit()
        await self.db.refresh(comment)
        return comment

    async def delete_comment(self, comment_id: str, user_id: str):
        comment = await self.db.get(Comment, comment_id)
        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
            )

        # Get post to check if user is post owner
        post = await self.db.get(Post, comment.post_id)
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
            )

        # Allow both comment owner and post owner to delete the comment
        if comment.user_id != user_id and post.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this comment",
            )

        await self.db.delete(comment)
        await self.db.commit()

    def _format_comment(self, comment: Comment) -> dict:
        return {
            "comment_id": comment.comment_id,
            "post_id": comment.post_id,
            "content": comment.content,
            "created_at": comment.created_at,
            "updated_at": comment.updated_at,
            "parent_id": comment.parent_id,
            "replies_count": len(comment.replies) if comment.replies else 0,
            "user": {
                "user_id": comment.user.user_id,
                "username": comment.user.username,
                "profile_picture_url": comment.user.profile_picture_url,
            },
        }

    async def get_comment_by_id(self, comment_id: str) -> dict:
        """Get a specific comment by its ID"""
        stmt = (
            select(Comment)
            .options(joinedload(Comment.user), joinedload(Comment.replies))
            .where(Comment.comment_id == comment_id)
        )

        result = await self.db.execute(stmt)
        comment = result.unique().scalar_one_or_none()

        if not comment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found"
            )

        return self._format_comment(comment)
