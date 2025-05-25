from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, field_validator


class MessageBase(BaseModel):
    content: str
    message_type: str


class MessageCreate(MessageBase):
    conversation_id: str


class MessageResponse(MessageBase):
    message_id: str
    sender_id: str
    conversation_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationBase(BaseModel):
    title: Optional[str] = None


class ConversationCreate(BaseModel):
    title: Optional[str] = None
    participant_ids: List[str]

    @field_validator("title")
    def validate_title(cls, v, values):
        participant_ids = values.get("participant_ids", [])
        if len(participant_ids) > 2 and not v:
            raise ValueError("Title is required for group conversations")
        return v


class ConversationResponse(BaseModel):
    conversation_id: str
    title: Optional[str] = None
    creator_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ParticipantResponse(BaseModel):
    user_id: str
    username: str
    full_name: str  # Added
    profile_picture_url: Optional[str]
    is_online: bool = False


class LatestMessage(BaseModel):
    message_id: str
    content: str
    message_type: str
    sender_id: str
    created_at: datetime
    is_read: bool


class ConversationListResponse(BaseModel):
    conversation_id: str
    title: Optional[str] = None
    creator_id: str
    created_at: datetime
    updated_at: datetime
    participants: List[ParticipantResponse]
    latest_message: Optional[LatestMessage] = None
    unread_count: int = 0


class ConversationsResponse(BaseModel):
    conversations: List[ConversationListResponse]
    total: int

    class Config:
        from_attributes = True


class MessageDeliveryStatus(BaseModel):
    sent: bool = True
    delivered: bool = True
    seen_by: List[dict] = []


class DetailedMessageResponse(BaseModel):
    message_id: str
    sender_id: str
    content: str
    message_type: str
    media_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    edited: bool = False
    status: MessageDeliveryStatus


class ConversationType(str, Enum):
    PRIVATE = "private"
    GROUP = "group"


class ParticipantInfo(ParticipantResponse):
    last_seen: Optional[datetime] = None
    role: Optional[str] = None


class ConversationInfo(BaseModel):
    conversation_id: str
    title: Optional[str] = None
    type: ConversationType
    created_at: datetime
    participants: List[ParticipantInfo]


class PaginationInfo(BaseModel):
    total_messages: int
    limit: int
    offset: int
    has_more: bool
    next_cursor: Optional[str]


class ConversationMessagesResponse(BaseModel):
    conversation_info: ConversationInfo
    messages: List[DetailedMessageResponse]
    pagination: PaginationInfo
    meta: dict
