from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr


# Base User Schema
class UserBase(BaseModel):
    username: str
    email: str
    full_name: str | None = None
    bio: str | None = None
    profile_picture_url: str | None = None


# Schema cho việc cập nhật user
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = None


# Schema cho việc đổi mật khẩu
class PasswordChange(BaseModel):
    old_password: str
    new_password: str


class CurrentUserResponse(UserBase):
    user_id: str
    created_at: datetime
    followers_count: int
    following_count: int


# Schema cho thông tin user trả về
class UserResponse(CurrentUserResponse):
    is_following: bool = False
    is_followed_by: bool = False


# Schema cho danh sách followers/following
class UserListItem(BaseModel):
    user_id: str
    username: str
    full_name: Optional[str]
    profile_picture_url: Optional[str]
    is_following: bool


class UserListResponse(BaseModel):
    users: List[UserListItem]
    total_count: int


class AdminUserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    is_admin: Optional[bool] = False


class AdminUserResponse(UserResponse):
    is_admin: bool = False
    is_banned: bool = False


# Schema cho danh sách người dùng gợi ý
class SuggestedUserItem(BaseModel):
    user_id: str
    username: str
    full_name: Optional[str]
    profile_picture_url: Optional[str]
    is_followed_by: bool  # Người này có đang follow mình không


class SuggestedUsersResponse(BaseModel):
    users: List[SuggestedUserItem]
