from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, verify_admin
from app.core.security import get_password_hash
from app.models.follow import Follow
from app.models.user import User
from app.schemas.user import AdminUserCreate, AdminUserResponse, UserResponse
from app.services.admin_service import AdminService

router = APIRouter(
    dependencies=[Depends(verify_admin)],  # All routes require admin access
)


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a user account (Admin only)"""
    admin_service = AdminService(db)
    await admin_service.delete_user(user_id)
    return {"message": "User deleted successfully"}


@router.delete("/posts/{post_id}")
async def delete_post(post_id: str, db: AsyncSession = Depends(get_db)):
    """Delete any post (Admin only)"""
    admin_service = AdminService(db)
    await admin_service.delete_post(post_id)
    return {"message": "Post deleted successfully"}


@router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str, db: AsyncSession = Depends(get_db)):
    """Delete any comment (Admin only)"""
    admin_service = AdminService(db)
    await admin_service.delete_comment(comment_id)
    return {"message": "Comment deleted successfully"}


@router.get("/users", response_model=List[AdminUserResponse])
async def get_all_users(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    """Get all users (Admin only)"""
    admin_service = AdminService(db)
    users = await admin_service.get_all_users(current_user.user_id, skip, limit)

    # Format response with full user information
    return [
        AdminUserResponse(
            user_id=user.user_id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            bio=user.bio,
            profile_picture_url=user.profile_picture_url,
            created_at=user.created_at,
            followers_count=len(user.followers),
            following_count=len(user.following),
            is_following=False,
            is_followed_by=False,
            is_admin=user.is_admin,
            is_banned=user.is_banned,
        )
        for user in users
    ]


@router.post("/users/{user_id}/ban")
async def ban_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Ban a user (Admin only)"""
    admin_service = AdminService(db)
    await admin_service.ban_user(user_id)
    return {"message": "User banned successfully"}


@router.post("/users/{user_id}/unban")
async def unban_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Unban a user (Admin only)"""
    admin_service = AdminService(db)
    await admin_service.unban_user(user_id)
    return {"message": "User unbanned successfully"}


@router.post("/users", response_model=AdminUserResponse)
async def create_user(user_data: AdminUserCreate, db: AsyncSession = Depends(get_db)):
    """Create a new user without OTP verification (Admin only)"""
    admin_service = AdminService(db)
    user = await admin_service.create_user(user_data.dict())

    # Format response with required fields
    return {
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "bio": user.bio,
        "profile_picture_url": user.profile_picture_url,
        "created_at": user.created_at,
        "followers_count": 0,
        "following_count": 0,
        "is_following": False,
        "is_followed_by": False,
        "is_admin": user.is_admin,
        "is_banned": user.is_banned,
    }
