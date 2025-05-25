import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, verify_token
from app.models.user import User
from app.schemas.comment import (
    CommentCreate,
    CommentListResponse,
    CommentResponse,
    CommentUpdate,
    CommentWithReplies,
)
from app.services.comment_service import CommentService
from app.services.post_notification_service import PostNotificationService
from app.services.post_service import PostService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("", response_model=CommentResponse)
async def create_comment(
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new comment"""
    comment_service = CommentService(db)
    try:
        comment = await comment_service.create_comment(
            user_id=current_user.user_id,
            comment_data=comment_data,
        )

        # Gửi thông báo cho chủ post
        post = await PostService(db).get_post_by_id(
            comment_data.post_id, current_user.user_id
        )
        notification_service = PostNotificationService(db)
        await notification_service.notify_new_comment(
            post_id=comment_data.post_id,
            post_author_id=post["user_id"],
            commenter_id=current_user.user_id,
            commenter_name=current_user.username,
            comment_content=comment_data.content,
        )

        return comment
    except Exception as e:
        logger.error(f"Error creating comment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating comment: {str(e)}",
        )


@router.get(
    "/post/{post_id}",
    response_model=CommentListResponse,
    dependencies=[Depends(verify_token)],
)
async def get_post_comments(
    post_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    comment_service = CommentService(db)
    comments, total_count = await comment_service.get_post_comments(
        post_id, page, limit
    )

    total_pages = (total_count + limit - 1) // limit

    return CommentListResponse(
        comments=comments,
        total_count=total_count,
        page=page,
        total_pages=total_pages,
        has_more=page < total_pages,
    )


@router.get(
    "/{comment_id}/replies",
    response_model=CommentListResponse,
    dependencies=[Depends(verify_token)],
)
async def get_comment_replies(
    comment_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    comment_service = CommentService(db)
    replies, total_count = await comment_service.get_comment_replies(
        comment_id, page, limit
    )

    total_pages = (total_count + limit - 1) // limit

    return CommentListResponse(
        comments=replies,
        total_count=total_count,
        page=page,
        total_pages=total_pages,
        has_more=page < total_pages,
    )


@router.put("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: str,
    comment_update: CommentUpdate,
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    comment_service = CommentService(db)
    updated_comment = await comment_service.update_comment(
        comment_id, user_id, comment_update.content
    )
    return updated_comment


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: str,
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    comment_service = CommentService(db)
    await comment_service.delete_comment(comment_id, user_id)


@router.get(
    "/{comment_id}",
    response_model=CommentResponse,
    dependencies=[Depends(verify_token)],
)
async def get_comment_by_id(
    comment_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific comment by its ID"""
    comment_service = CommentService(db)
    comment = await comment_service.get_comment_by_id(comment_id)
    return comment
