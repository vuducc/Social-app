import logging
from typing import Any, Dict, List, Tuple

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.follow import Follow
from app.models.like import Like
from app.models.post import Post
from app.models.post_image import PostImage
from app.utils.cloudinary_helper import (
    delete_post_images_from_cloudinary,
    upload_multiple_images,
)

logger = logging.getLogger(__name__)


class PostService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _format_post(
        self, post: Post, likes_count: int, is_liked: bool
    ) -> Dict[str, Any]:
        """Helper method to format post data consistently"""
        return {
            "post_id": post.post_id,
            "user_id": post.user_id,
            "content": post.content,
            "created_at": post.created_at,
            "image_urls": [image.image_url for image in post.post_images],
            "user_username": post.user.username,
            "user_profile_picture_url": post.user.profile_picture_url,
            "comments_count": len(post.comments),
            "likes_count": likes_count,
            "is_liked_by_me": is_liked,
        }

    async def get_posts(
        self, user_id: str, page: int = 1, limit: int = 10
    ) -> Tuple[List[Dict[str, Any]], int]:
        offset = (page - 1) * limit

        # Optimized query with all needed information in one go
        stmt = (
            select(
                Post,
                func.count(Like.like_id).label("likes_count"),
                func.bool_or(Like.user_id == user_id).label("is_liked_by_me"),
            )
            .outerjoin(Like)
            .options(
                joinedload(Post.user),
                joinedload(Post.post_images),
                joinedload(Post.comments),
            )
            .group_by(Post.post_id)
            .order_by(Post.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        result = await self.db.execute(stmt)
        posts_data = result.unique().all()

        # Format posts using helper method
        formatted_posts = [
            await self._format_post(post, likes_count, is_liked)
            for post, likes_count, is_liked in posts_data
        ]

        # Get total count
        total_count = await self.db.scalar(select(func.count(Post.post_id)))

        return formatted_posts, total_count

    async def get_feed_posts(
        self, user_id: str, page: int = 1, limit: int = 10
    ) -> Tuple[List[Dict[str, Any]], int]:
        offset = (page - 1) * limit

        # Get following users' IDs
        following_subquery = select(Follow.following_id).where(
            Follow.user_id == user_id
        )

        # Optimized query combining all needed data
        stmt = (
            select(
                Post,
                func.count(Like.like_id).label("likes_count"),
                func.bool_or(Like.user_id == user_id).label("is_liked_by_me"),
            )
            .outerjoin(Like)
            .where(or_(Post.user_id == user_id, Post.user_id.in_(following_subquery)))
            .options(
                joinedload(Post.user),
                joinedload(Post.post_images),
                joinedload(Post.comments),
            )
            .group_by(Post.post_id)
            .order_by(Post.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        result = await self.db.execute(stmt)
        posts_data = result.unique().all()

        # Format posts using helper method
        formatted_posts = [
            await self._format_post(post, likes_count, is_liked)
            for post, likes_count, is_liked in posts_data
        ]

        # Get total count for feed posts
        total_count = await self.db.scalar(
            select(func.count(Post.post_id)).where(
                or_(Post.user_id == user_id, Post.user_id.in_(following_subquery))
            )
        )

        return formatted_posts, total_count

    async def get_user_posts(
        self, target_user_id: str, current_user_id: str, page: int = 1, limit: int = 10
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Get all posts from a specific user with pagination"""
        offset = (page - 1) * limit

        # Query to get posts with likes info
        stmt = (
            select(
                Post,
                func.count(Like.like_id).label("likes_count"),
                func.bool_or(Like.user_id == current_user_id).label("is_liked_by_me"),
            )
            .outerjoin(Like)
            .where(Post.user_id == target_user_id)
            .options(
                joinedload(Post.user),
                joinedload(Post.post_images),
                joinedload(Post.comments),
            )
            .group_by(Post.post_id)
            .order_by(Post.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        result = await self.db.execute(stmt)
        posts_data = result.unique().all()

        # Format posts using helper method
        formatted_posts = [
            await self._format_post(post, likes_count, is_liked or False)
            for post, likes_count, is_liked in posts_data
        ]

        # Get total count of user's posts
        total_count = await self.db.scalar(
            select(func.count(Post.post_id)).where(Post.user_id == target_user_id)
        )

        return formatted_posts, total_count

    async def create_post(self, content: str, user_id: str, files: List[UploadFile]):
        try:
            # Create post first
            new_post = Post(user_id=user_id, content=content)
            self.db.add(new_post)
            await self.db.flush()
            await self.db.refresh(new_post)

            # Read all files
            file_contents = []
            for file in files:
                content = await file.read()
                file_contents.append(content)

            # Upload images
            image_urls = await upload_multiple_images(
                file_contents, user_id, new_post.post_id
            )

            # Create PostImage records
            for image_url in image_urls:
                post_image = PostImage(post_id=new_post.post_id, image_url=image_url)
                self.db.add(post_image)

            await self.db.commit()
            await self.db.refresh(new_post)

            return new_post

        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e),
            )

    async def get_post_by_id(
        self, post_id: str, current_user_id: str
    ) -> Dict[str, Any]:
        """Get a single post by ID with complete information"""
        stmt = (
            select(
                Post,
                func.count(Like.like_id).label("likes_count"),
                func.bool_or(Like.user_id == current_user_id).label("is_liked_by_me"),
            )
            .outerjoin(Like)
            .where(Post.post_id == post_id)
            .options(
                joinedload(Post.user),
                joinedload(Post.post_images),
                joinedload(Post.comments),
            )
            .group_by(Post.post_id)
        )

        result = await self.db.execute(stmt)
        post_data = result.unique().first()

        if not post_data:
            return None

        post, likes_count, is_liked = post_data
        return await self._format_post(post, likes_count, is_liked or False)

    async def delete_post(self, post_id: str, user_id: str):
        try:
            # Load post with images in a single query
            stmt = select(Post).where(Post.post_id == post_id)
            post = await self.db.scalar(stmt)

            if not post or post.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Post not found or you don't have permission to delete it",
                )

            # Delete images from cloudinary
            delete_post_images_from_cloudinary(user_id, post_id)

            # Delete post (will cascade delete post_images automatically)
            await self.db.delete(post)
            await self.db.commit()

            return {"message": "Post deleted successfully"}

        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting post: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete post",
            )
