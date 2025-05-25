from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, ConfigDict


class UserGrowthStats(BaseModel):
    date: datetime
    total_users: int = 0
    new_users_count: int = 0

    model_config = ConfigDict(from_attributes=True)


class PostStats(BaseModel):
    date: datetime
    total_posts: int = 0
    total_comments: int = 0
    total_likes: int = 0

    model_config = ConfigDict(from_attributes=True)


class InteractionStats(BaseModel):
    date: datetime
    total_messages: int = 0
    active_conversations: int = 0
    total_notifications: int = 0

    model_config = ConfigDict(from_attributes=True)


class UserEngagementStats(BaseModel):
    avg_posts_per_user: float = 0.0
    avg_comments_per_post: float = 0.0
    avg_likes_per_post: float = 0.0
    date: datetime

    model_config = ConfigDict(from_attributes=True)


class TimeSeriesData(BaseModel):
    labels: List[str]
    values: List[float]


class DashboardStats(BaseModel):
    user_growth: TimeSeriesData
    post_activity: TimeSeriesData
    interaction_rates: TimeSeriesData
    engagement_stats: Dict[str, float]


class UserDetailStats(BaseModel):
    total_users: int
    total_active_users: int  # Users có session trong 7 ngày
    total_posts: int
    total_followers: int
    model_config = ConfigDict(from_attributes=True)


class PostDetailStats(BaseModel):
    total_posts: int
    total_comments: int
    total_likes: int
    avg_comments_per_post: float
    avg_likes_per_post: float
    model_config = ConfigDict(from_attributes=True)


class MessageDetailStats(BaseModel):
    total_conversations: int
    total_messages: int
    total_participants: int
    avg_messages_per_conversation: float
    model_config = ConfigDict(from_attributes=True)
