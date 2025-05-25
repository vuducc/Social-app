from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class PostBase(BaseModel):
    post_id: str
    user_id: str
    content: str
    created_at: datetime
    image_urls: List[str]
    user_username: Optional[str] = None
    user_profile_picture_url: Optional[str] = None
    comments_count: Optional[int] = 0
    likes_count: Optional[int] = 0
    is_liked_by_me: Optional[bool] = False

    class Config:
        from_attributes = True


class PostCreateResponse(BaseModel):
    message: str
    post_id: str
    content: str
    created_at: datetime
    user_id: str
    image_urls: List[str]


class PostDetailResponse(PostBase):
    pass


class PostListResponse(BaseModel):
    posts: List[PostBase]
    page: int
    total_pages: int
    total_posts: int
    has_more: bool
