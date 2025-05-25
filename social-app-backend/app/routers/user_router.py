import logging
from typing import List, Optional

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
from pydantic import EmailStr
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, get_redis
from app.core.dependencies import get_current_user, verify_token
from app.core.security import get_password_hash, verify_password
from app.models.follow import Follow
from app.models.user import User
from app.schemas.user import (
    CurrentUserResponse,
    PasswordChange,
    SuggestedUsersResponse,
    UserListItem,
    UserListResponse,
    UserResponse,
    UserUpdate,
)
from app.services.follow_notification_service import FollowNotificationService
from app.services.user_service import UserService
from app.services.user_status_service import UserStatusService
from app.utils.cloudinary_helper import upload_profile_image, upload_single_post_image

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/search", response_model=UserListResponse)
async def search_users(
    query: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """Search for users by username or full name"""
    user_service = UserService(db)
    offset = (page - 1) * limit

    users, total_count = await user_service.search_users(
        query, current_user_id, offset, limit
    )

    user_list = []
    for user in users:
        is_following = await user_service.get_follow(current_user_id, user.user_id)
        user_list.append(
            UserListItem(
                user_id=user.user_id,
                username=user.username,
                full_name=user.full_name,
                profile_picture_url=user.profile_picture_url,
                is_following=bool(is_following),
            )
        )
    return UserListResponse(users=user_list, total_count=total_count)


@router.get("/me", response_model=CurrentUserResponse)
async def get_current_user_profile(
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    """Get current user's profile"""
    user_service = UserService(db)
    user = await user_service.get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_status_service = UserStatusService(redis)
    await user_status_service.set_user_online(user_id)

    return CurrentUserResponse(
        user_id=user.user_id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        bio=user.bio,
        profile_picture_url=user.profile_picture_url,
        created_at=user.created_at,
        followers_count=len(user.followers),
        following_count=len(user.following),
    )


@router.put("/me/avatar", response_model=UserResponse)
async def update_profile_picture(
    profile_picture: UploadFile = File(...),
    current_user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """Update user's profile picture"""
    try:
        user_service = UserService(db)

        # Validate file type
        if not profile_picture.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")

        # Read and upload image
        content = await profile_picture.read()
        profile_picture_url = await upload_profile_image(content, current_user_id)

        # Update user's profile picture URL
        user_data = UserUpdate(profile_picture_url=profile_picture_url)
        updated_user = await user_service.update_user(current_user_id, user_data)

        return UserResponse(
            user_id=updated_user.user_id,
            username=updated_user.username,
            email=updated_user.email,
            full_name=updated_user.full_name,
            bio=updated_user.bio,
            profile_picture_url=updated_user.profile_picture_url,
            created_at=updated_user.created_at,
            followers_count=len(updated_user.followers),
            following_count=len(updated_user.following),
        )

    except Exception as e:
        logger.error(f"Error updating profile picture: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating profile picture",
        )


@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    user_data: UserUpdate,
    current_user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """Update user profile information (excluding profile picture)"""
    try:
        user_service = UserService(db)

        # Remove profile_picture_url from update data if present
        if hasattr(user_data, "profile_picture_url"):
            user_data.profile_picture_url = None

        updated_user = await user_service.update_user(current_user_id, user_data)

        return UserResponse(
            user_id=updated_user.user_id,
            username=updated_user.username,
            email=updated_user.email,
            full_name=updated_user.full_name,
            bio=updated_user.bio,
            profile_picture_url=updated_user.profile_picture_url,
            created_at=updated_user.created_at,
            followers_count=len(updated_user.followers),
            following_count=len(updated_user.following),
        )

    except Exception as e:
        logger.error(f"Error updating user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating user profile",
        )


@router.get("/suggested", response_model=SuggestedUsersResponse)
async def get_suggested_users(
    limit: int = Query(5, ge=1, le=20),
    current_user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """Get suggested users to follow"""
    user_service = UserService(db)
    suggested_users = await user_service.get_suggested_users(current_user_id, limit)
    return suggested_users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_profile(
    user_id: str,
    current_user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """Get user profile by user_id"""
    user_service = UserService(db)
    user = await user_service.get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get follow status between current user and target user
    follow_status = await user_service.check_follow_status(current_user_id, user_id)

    return UserResponse(
        user_id=user.user_id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        bio=user.bio,
        profile_picture_url=user.profile_picture_url,
        created_at=user.created_at,
        followers_count=len(user.followers),
        following_count=len(user.following),
        is_following=follow_status["is_following"],
        is_followed_by=follow_status["is_followed_by"],
    )


@router.post("/{user_id}/toggle-follow")
async def toggle_follow(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle follow/unfollow a user"""
    if user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")

    user_service = UserService(db)
    follow_notification_service = FollowNotificationService(db)

    # Check if target user exists
    target_user = await user_service.get_user_by_id(user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get current user info for notification
    current_user = await user_service.get_user_by_id(current_user.user_id)
    if not current_user:
        raise HTTPException(status_code=404, detail="Current user not found")

    # Check if already following
    existing_follow = await user_service.get_follow(current_user.user_id, user_id)

    if existing_follow:
        # Unfollow
        await user_service.delete_follow(existing_follow)
        message = "Successfully unfollowed user"
    else:
        # Follow
        new_follow = Follow(user_id=current_user.user_id, following_id=user_id)
        await user_service.create_follow(new_follow)

        # Send notification to target user
        await follow_notification_service.notify_new_follower(
            follower_id=current_user.user_id,
            follower_name=current_user.username,
            target_user_id=user_id,
        )
        message = "Successfully followed user"

    return {"message": message, "target_user_id": user_id}


@router.get("/{user_id}/followers", response_model=UserListResponse)
async def get_followers(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """Get user's followers"""
    user_service = UserService(db)
    offset = (page - 1) * limit

    followers, total_count = await user_service.get_followers(user_id, offset, limit)

    # Format response
    user_list = []
    for follower in followers:
        is_following = (
            await user_service.get_follow(current_user_id, follower.user_id) is not None
        )

        user_list.append(
            UserListItem(
                user_id=follower.user_id,
                username=follower.username,
                full_name=follower.full_name,
                profile_picture_url=follower.profile_picture_url,
                is_following=is_following,
            )
        )

    return UserListResponse(users=user_list, total_count=total_count)


@router.get("/{user_id}/following", response_model=UserListResponse)
async def get_following(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """Get list of users that the specified user is following"""
    user_service = UserService(db)
    offset = (page - 1) * limit

    following, total_count = await user_service.get_following(user_id, offset, limit)

    user_list = []
    for user in following:
        is_following = await user_service.get_follow(current_user_id, user.user_id)
        user_list.append(
            UserListItem(
                user_id=user.user_id,
                username=user.username,
                full_name=user.full_name,
                profile_picture_url=user.profile_picture_url,
                is_following=bool(is_following),
            )
        )

    return UserListResponse(users=user_list, total_count=total_count)


@router.get("/{user_id}/mutual-followers", response_model=UserListResponse)
async def get_mutual_followers(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """Get mutual followers between current user and target user"""
    user_service = UserService(db)
    offset = (page - 1) * limit

    mutual_followers, total_count = await user_service.get_mutual_followers(
        current_user_id, user_id, offset, limit
    )

    user_list = []
    for user in mutual_followers:
        is_following = await user_service.get_follow(current_user_id, user.user_id)
        user_list.append(
            UserListItem(
                user_id=user.user_id,
                username=user.username,
                full_name=user.full_name,
                profile_picture_url=user.profile_picture_url,
                is_following=bool(is_following),
            )
        )

    return UserListResponse(users=user_list, total_count=total_count)


@router.get("/{user_id}/activity")
async def get_user_activity(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """Get user's recent activity"""
    if user_id != current_user_id:
        raise HTTPException(
            status_code=403, detail="You can only view your own activity"
        )

    user_service = UserService(db)
    offset = (page - 1) * limit

    activities, total_count = await user_service.get_user_activity(
        user_id, offset, limit
    )

    return {"activities": activities, "total_count": total_count}


@router.put("/me/password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change user password"""
    # Verify old password
    if not verify_password(password_data.old_password, current_user.password):
        logger.warning(f"Invalid old password attempt for user {current_user.user_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid old password"
        )

    try:
        user_service = UserService(db)

        # Update password
        current_user.password = get_password_hash(password_data.new_password)
        await user_service.update_password(current_user)

        logger.info(f"Password changed successfully for user {current_user.user_id}")
        return {"message": "Password changed successfully"}

    except Exception as e:
        logger.error(
            f"Error changing password for user {current_user.user_id}: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error changing password",
        )
