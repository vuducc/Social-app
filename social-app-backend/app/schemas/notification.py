from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel


class DeviceTokenCreate(BaseModel):
    token: str
    device_type: str  # ios/android
    device_id: str


class DeviceTokenResponse(BaseModel):
    id: str
    user_id: str
    token: str
    device_type: str
    device_id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NotificationBase(BaseModel):
    type: str
    title: str
    body: str
    data: Optional[str] = None


class NotificationCreate(NotificationBase):
    recipient_id: str


class NotificationResponse(NotificationBase):
    notification_id: str
    sender_id: Optional[str]
    sender_profile_picture: Optional[str] = None
    created_at: datetime
    is_read: bool
    read_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NotificationCount(BaseModel):
    total: int
    unread: int


class PaginatedNotifications(BaseModel):
    items: List[NotificationResponse]
    total: int
    page: int
    size: int
    pages: int


class NotificationType(str, Enum):
    POST_LIKE = "post_like"
    POST_COMMENT = "post_comment"
    COMMENT_LIKE = "comment_like"
    COMMENT_REPLY = "comment_reply"
    NEW_POST = "new_post"
    POST_MENTION = "post_mention"
    COMMENT_MENTION = "comment_mention"
    FOLLOW = "follow"
    FOLLOW_REQUEST = "follow_request"
    REPORT = "report"
