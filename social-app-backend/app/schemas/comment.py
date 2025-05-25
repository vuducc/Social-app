from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class CommentBase(BaseModel):
    content: str = Field(..., min_length=1)


class CommentCreate(CommentBase):
    post_id: str
    parent_id: Optional[str] = None


class CommentUpdate(BaseModel):
    content: str = Field(..., min_length=1)


class CommentUser(BaseModel):
    user_id: str
    username: str
    profile_picture_url: Optional[str] = None


class CommentResponse(CommentBase):
    comment_id: str
    post_id: str
    user: CommentUser
    created_at: datetime
    updated_at: datetime
    replies_count: int = 0
    parent_id: Optional[str] = None

    class Config:
        from_attributes = True


class CommentWithReplies(CommentResponse):
    replies: List[CommentResponse] = []


class CommentListResponse(BaseModel):
    comments: List[CommentResponse]
    total_count: int
    page: int
    total_pages: int
    has_more: bool
