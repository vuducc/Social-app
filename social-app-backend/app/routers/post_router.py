import logging
from typing import List

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, verify_token
from app.models.user import User
from app.schemas.like import LikeResponse
from app.schemas.post import PostCreateResponse, PostDetailResponse, PostListResponse
from app.services.like_service import LikeService
from app.services.post_notification_service import PostNotificationService
from app.services.post_service import PostService

logger = logging.getLogger(__name__)
router = APIRouter()


# @router.get("", response_model=PostListResponse)
# async def get_posts(
#     db: AsyncSession = Depends(get_db),
#     page: int = Query(1, ge=1),
#     limit: int = Query(10, ge=1, le=100),
#     current_user_id: str = Depends(verify_token),
# ):
#     """
#     Get paginated list of all posts
#     """
#     post_service = PostService(db)
#     posts, total_count = await post_service.get_posts(current_user_id, page, limit)

#     total_pages = (total_count + limit - 1) // limit

#     return {
#         "posts": posts,
#         "page": page,
#         "total_pages": total_pages,
#         "total_posts": total_count,
#         "has_more": page < total_pages,
#     }


@router.get("/feed", response_model=PostListResponse)
async def get_feed_posts(
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    """
    Get paginated list of posts from friends and self for homepage feed
    """
    post_service = PostService(db)
    posts, total_count = await post_service.get_feed_posts(user_id, page, limit)

    total_pages = (total_count + limit - 1) // limit

    return {
        "posts": posts,
        "page": page,
        "total_pages": total_pages,
        "total_posts": total_count,
        "has_more": page < total_pages,
    }


@router.post(
    "/create", response_model=PostCreateResponse, status_code=status.HTTP_201_CREATED
)
async def create_post(
    content: str = Form(...),
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """
    Create a new post with text content and optional images
    """
    try:
        post_service = PostService(db)
        new_post = await post_service.create_post(content, user_id, files)
        logger.info(f"Post created: {new_post.post_id}")

        notification_service = PostNotificationService(db)
        await notification_service.notify_new_post(
            post_id=new_post.post_id,
            author_id=user_id,
            author_name=new_post.user.username,
        )

        return {
            "message": "Post created successfully",
            "post_id": new_post.post_id,
            "content": new_post.content,
            "created_at": new_post.created_at,
            "user_id": new_post.user_id,
            "image_urls": [image.image_url for image in new_post.post_images],
        }

    except Exception as e:
        logger.error(f"Error creating post: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating post",
        )


@router.get("/user/{target_user_id}", response_model=PostListResponse)
async def get_user_posts(
    target_user_id: str,
    current_user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
):
    post_service = PostService(db)
    posts, total_count = await post_service.get_user_posts(
        target_user_id=target_user_id,
        current_user_id=current_user_id,
        page=page,
        limit=limit,
    )

    total_pages = (total_count + limit - 1) // limit

    return {
        "posts": posts,
        "page": page,
        "total_pages": total_pages,
        "total_posts": total_count,
        "has_more": page < total_pages,
    }


@router.get(
    "/{post_id}",
    response_model=PostDetailResponse,
    dependencies=[Depends(verify_token)],
)
async def get_post_detail(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(verify_token),
):
    """
    Get detailed information about a specific post
    """
    post_service = PostService(db)
    post = await post_service.get_post_by_id(post_id, current_user_id)

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )

    return post


@router.delete("/{post_id}", status_code=status.HTTP_200_OK)
async def delete_post(
    post_id: str,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(verify_token),
):
    """
    Delete a post (only by post owner)
    """
    post_service = PostService(db)
    deleted_post = await post_service.delete_post(post_id, user_id)

    if not deleted_post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or you don't have permission to delete it",
        )

    logger.info(f"Post deleted: {post_id}")
    return {"message": "Post deleted successfully", "post_id": post_id}


@router.post("/{post_id}/like", response_model=LikeResponse)
async def toggle_like_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle like/unlike a post"""
    like_service = LikeService(db)
    try:
        is_liked, likes_count = await like_service.toggle_like(
            current_user.user_id, post_id
        )

        if is_liked:  # Only notify when liking, not unliking
            post = await PostService(db).get_post_by_id(post_id, current_user.user_id)
            notification_service = PostNotificationService(db)
            await notification_service.notify_post_like(
                post_id=post_id,
                post_author_id=post["user_id"],
                liker_id=current_user.user_id,
                liker_name=current_user.username,
            )

        return {
            "message": (
                "Post liked successfully" if is_liked else "Post unliked successfully"
            ),
            "is_liked": is_liked,
            "likes_count": likes_count,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error toggling like: {str(e)}",
        )
