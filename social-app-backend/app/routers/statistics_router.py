import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import verify_admin
from app.schemas.statistics import (
    DashboardStats,
    InteractionStats,
    MessageDetailStats,
    PostDetailStats,
    PostStats,
    TimeSeriesData,
    UserDetailStats,
    UserEngagementStats,
    UserGrowthStats,
)
from app.services.statistics_service import StatisticsService

logger = logging.getLogger(__name__)

router = APIRouter(
    dependencies=[Depends(verify_admin)],  # Chỉ admin mới có quyền xem thống kê
)


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_statistics(
    days: Optional[int] = 30, db: AsyncSession = Depends(get_db)
):
    """Get dashboard statistics"""
    stats_service = StatisticsService(db)

    # Collect all statistics
    user_growth = await stats_service.get_user_growth_stats(days)
    post_activity = await stats_service.get_post_activity_stats(days)
    interaction_stats = await stats_service.get_interaction_stats(days)
    engagement_stats = await stats_service.get_user_engagement_stats()

    # Format data for time series
    return DashboardStats(
        user_growth=TimeSeriesData(
            labels=[str(stat["date"].date()) for stat in user_growth],
            values=[float(stat["new_users_count"]) for stat in user_growth],
        ),
        post_activity=TimeSeriesData(
            labels=[str(stat["date"].date()) for stat in post_activity],
            values=[float(stat["total_posts"]) for stat in post_activity],
        ),
        interaction_rates=TimeSeriesData(
            labels=[str(stat["date"].date()) for stat in interaction_stats],
            values=[float(stat["total_messages"]) for stat in interaction_stats],
        ),
        engagement_stats={
            "avg_posts_per_user": engagement_stats["avg_posts_per_user"],
            "avg_comments_per_post": engagement_stats["avg_comments_per_post"],
            "avg_likes_per_post": engagement_stats["avg_likes_per_post"],
        },
    )


@router.get("/users/growth", response_model=List[UserGrowthStats])
async def get_user_growth(days: Optional[int] = 30, db: AsyncSession = Depends(get_db)):
    """Get user growth statistics"""
    stats_service = StatisticsService(db)
    result = await stats_service.get_user_growth_stats(days)

    # Convert to UserGrowthStats objects
    stats = [UserGrowthStats(**stat) for stat in result]
    return stats


@router.get("/posts/activity", response_model=List[PostStats])
async def get_post_activity(
    days: Optional[int] = 30, db: AsyncSession = Depends(get_db)
):
    """Get post activity statistics"""
    stats_service = StatisticsService(db)
    result = await stats_service.get_post_activity_stats(days)

    # Convert to PostStats objects
    stats = [PostStats(**stat) for stat in result]
    return stats


@router.get("/interactions", response_model=List[InteractionStats])
async def get_interaction_statistics(
    days: Optional[int] = 30, db: AsyncSession = Depends(get_db)
):
    """Get interaction statistics"""
    stats_service = StatisticsService(db)
    result = await stats_service.get_interaction_stats(days)

    # Convert to InteractionStats objects
    stats = [InteractionStats(**stat) for stat in result]
    return stats


@router.get("/users/details", response_model=UserDetailStats)
async def get_user_details(db: AsyncSession = Depends(get_db)):
    """Get detailed user statistics"""
    stats_service = StatisticsService(db)
    return await stats_service.get_user_detail_stats()


@router.get("/posts/details", response_model=PostDetailStats)
async def get_post_details(db: AsyncSession = Depends(get_db)):
    """Get detailed post statistics"""
    stats_service = StatisticsService(db)
    return await stats_service.get_post_detail_stats()


@router.get("/messages/details", response_model=MessageDetailStats)
async def get_message_details(db: AsyncSession = Depends(get_db)):
    """Get detailed message statistics"""
    stats_service = StatisticsService(db)
    return await stats_service.get_message_detail_stats()
