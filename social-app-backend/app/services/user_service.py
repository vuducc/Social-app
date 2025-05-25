from typing import List, Optional, Tuple

from fastapi import HTTPException, status
from sqlalchemy import and_, func, literal, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.follow import Follow
from app.models.post import Post
from app.models.user import User
from app.schemas.user import UserUpdate


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        stmt = (
            select(User)
            .options(joinedload(User.followers), joinedload(User.following))
            .where(User.user_id == user_id)
        )
        result = await self.db.execute(stmt)
        return result.unique().scalar_one_or_none()

    async def get_user_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def update_user(self, user_id: str, user_data: UserUpdate) -> User:
        """Update user profile information"""
        user = await self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update only provided fields
        if user_data.username is not None:
            user.username = user_data.username
        if user_data.email is not None:
            user.email = user_data.email
        if user_data.full_name is not None:
            user.full_name = user_data.full_name
        if user_data.bio is not None:
            user.bio = user_data.bio
        if user_data.profile_picture_url is not None:
            user.profile_picture_url = user_data.profile_picture_url

        try:
            self.db.add(user)
            await self.db.commit()
            await self.db.refresh(user)
            return user
        except Exception as e:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e),
            )

    async def get_followers(
        self, user_id: str, offset: int, limit: int
    ) -> Tuple[List[User], int]:
        # Get followers count
        count_stmt = select(func.count(Follow.follow_id)).where(
            Follow.following_id == user_id
        )
        total_count = await self.db.scalar(count_stmt)

        # Get followers with pagination
        stmt = (
            select(User)
            .join(Follow, Follow.user_id == User.user_id)
            .where(Follow.following_id == user_id)
            .offset(offset)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        followers = result.scalars().all()

        return followers, total_count

    async def get_following(
        self, user_id: str, offset: int, limit: int
    ) -> Tuple[List[User], int]:
        # Get following count
        count_stmt = select(func.count(Follow.follow_id)).where(
            Follow.user_id == user_id
        )
        total_count = await self.db.scalar(count_stmt)

        # Get following with pagination
        stmt = (
            select(User)
            .join(Follow, Follow.following_id == User.user_id)
            .where(Follow.user_id == user_id)
            .offset(offset)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        following = result.scalars().all()

        return following, total_count

    async def create_follow(self, follow: Follow) -> Follow:
        self.db.add(follow)
        await self.db.commit()
        await self.db.refresh(follow)
        return follow

    async def delete_follow(self, follow: Follow) -> None:
        await self.db.delete(follow)
        await self.db.commit()

    async def get_follow(self, user_id: str, following_id: str) -> Optional[Follow]:
        stmt = select(Follow).where(
            Follow.user_id == user_id, Follow.following_id == following_id
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def search_users(
        self, query: str, current_user_id: str, offset: int, limit: int
    ) -> Tuple[List[User], int]:
        """Search users by username or full name"""
        search_term = f"%{query}%"

        # Base condition for both queries
        search_condition = and_(
            or_(
                User.username.ilike(search_term),
                User.full_name.ilike(search_term),
            ),
            User.user_id != current_user_id,  # Exclude current user
        )

        # Get users with pagination
        stmt = select(User).where(search_condition).offset(offset).limit(limit)
        result = await self.db.execute(stmt)
        users = result.scalars().all()

        # Get total count with the same condition
        count_stmt = select(func.count(User.user_id)).where(search_condition)
        total_count = await self.db.scalar(count_stmt)

        return users, total_count

    async def get_user_stats(self, user_id: str) -> dict:
        """Get user statistics (posts, followers, following counts)"""
        # Get posts count
        posts_count = await self.db.scalar(
            select(func.count(Post.post_id)).where(Post.user_id == user_id)
        )

        # Get followers count
        followers_count = await self.db.scalar(
            select(func.count(Follow.follow_id)).where(Follow.following_id == user_id)
        )

        # Get following count
        following_count = await self.db.scalar(
            select(func.count(Follow.follow_id)).where(Follow.user_id == user_id)
        )

        return {
            "posts_count": posts_count,
            "followers_count": followers_count,
            "following_count": following_count,
        }

    async def get_suggested_users(self, user_id: str, limit: int = 5) -> dict:
        try:
            # Get users that current user is following
            following_subquery = select(Follow.following_id).where(
                Follow.user_id == user_id
            )
            following_ids = (await self.db.execute(following_subquery)).scalars().all()

            # Users who follow me but I don't follow back
            not_following_back = (
                select(
                    User.user_id,
                    User.username,
                    User.full_name,
                    User.profile_picture_url,
                    literal(True).label("is_followed_by"),
                )
                .join(
                    Follow,
                    and_(
                        Follow.user_id == User.user_id, Follow.following_id == user_id
                    ),
                )
                .where(
                    and_(
                        ~User.user_id.in_(following_ids),
                        User.user_id != user_id,
                        User.is_banned == False,
                    )
                )
                .limit(limit)
            )

            result = await self.db.execute(not_following_back)
            not_following_back_users = result.all()
            suggested_users = [
                {
                    "user_id": user.user_id,
                    "username": user.username,
                    "full_name": user.full_name,
                    "profile_picture_url": user.profile_picture_url,
                    "is_followed_by": True,
                }
                for user in not_following_back_users
            ]

            # If we need more suggestions
            if len(suggested_users) < limit:
                remaining_limit = limit - len(suggested_users)
                existing_ids = [user["user_id"] for user in suggested_users]

                # Subqueries for counting mutual connections and followers
                mutual_connections = (
                    select(func.count(Follow.follow_id))
                    .where(
                        and_(
                            Follow.following_id == User.user_id,
                            Follow.user_id.in_(following_ids),
                        )
                    )
                    .correlate(User)
                    .scalar_subquery()
                )

                total_followers = (
                    select(func.count(Follow.follow_id))
                    .where(Follow.following_id == User.user_id)
                    .correlate(User)
                    .scalar_subquery()
                )

                # Get mutual connections and popular users
                other_suggestions = (
                    select(
                        User.user_id,
                        User.username,
                        User.full_name,
                        User.profile_picture_url,
                        Follow.user_id.isnot(None).label("is_followed_by"),
                    )
                    .outerjoin(
                        Follow,
                        and_(
                            Follow.user_id == User.user_id,
                            Follow.following_id == user_id,
                        ),
                    )
                    .where(
                        and_(
                            ~User.user_id.in_(following_ids),
                            ~User.user_id.in_(existing_ids),
                            User.user_id != user_id,
                            User.is_banned == False,
                        )
                    )
                    .group_by(
                        User.user_id,
                        User.username,
                        User.full_name,
                        User.profile_picture_url,
                        Follow.user_id,
                    )
                    .order_by(mutual_connections.desc(), total_followers.desc())
                    .limit(remaining_limit)
                )

                result = await self.db.execute(other_suggestions)
                other_users = result.all()
                suggested_users.extend(
                    [
                        {
                            "user_id": user.user_id,
                            "username": user.username,
                            "full_name": user.full_name,
                            "profile_picture_url": user.profile_picture_url,
                            "is_followed_by": bool(user.is_followed_by),
                        }
                        for user in other_users
                    ]
                )

            return {"users": suggested_users}

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error getting suggested users: {str(e)}",
            )

    async def get_mutual_followers(
        self, user_id1: str, user_id2: str, offset: int, limit: int
    ) -> Tuple[List[User], int]:
        """Get mutual followers between two users"""
        # Get followers of user1
        user1_followers = select(Follow.user_id).where(Follow.following_id == user_id1)

        # Get followers of user2
        user2_followers = select(Follow.user_id).where(Follow.following_id == user_id2)

        # Get mutual followers
        mutual_followers_stmt = (
            select(User)
            .where(User.user_id.in_(user1_followers.intersect(user2_followers)))
            .offset(offset)
            .limit(limit)
        )

        result = await self.db.execute(mutual_followers_stmt)
        mutual_followers = result.scalars().all()

        # Get total count
        count_stmt = select(func.count(User.user_id)).where(
            User.user_id.in_(user1_followers.intersect(user2_followers))
        )
        total_count = await self.db.scalar(count_stmt)

        return mutual_followers, total_count

    async def check_follow_status(self, user_id: str, target_user_id: str) -> dict:
        """Check follow status between two users"""
        # Check if user follows target
        is_following = await self.get_follow(user_id, target_user_id) is not None

        # Check if target follows user
        is_followed_by = await self.get_follow(target_user_id, user_id) is not None

        return {"is_following": is_following, "is_followed_by": is_followed_by}

    async def get_user_activity(
        self, user_id: str, offset: int, limit: int
    ) -> Tuple[List[dict], int]:
        """Get user's recent activity (follows, posts)"""
        # Get recent follows
        follows_stmt = (
            select(Follow, User)
            .join(User, User.user_id == Follow.following_id)
            .where(Follow.user_id == user_id)
            .order_by(Follow.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        follows_result = await self.db.execute(follows_stmt)
        follows = follows_result.fetchall()

        # Get recent posts
        posts_stmt = (
            select(Post)
            .where(Post.user_id == user_id)
            .order_by(Post.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        posts_result = await self.db.execute(posts_stmt)
        posts = posts_result.scalars().all()

        # Combine and sort activities
        activities = []
        for follow, user in follows:
            activities.append(
                {
                    "type": "follow",
                    "timestamp": follow.created_at,
                    "data": {"user_id": user.user_id, "username": user.username},
                }
            )

        for post in posts:
            activities.append(
                {
                    "type": "post",
                    "timestamp": post.created_at,
                    "data": {"post_id": post.post_id, "content": post.content},
                }
            )

        # Sort by timestamp
        activities.sort(key=lambda x: x["timestamp"], reverse=True)

        return activities[:limit], len(activities)

    async def update_password(self, user: User) -> User:
        """Update user's password in database"""
        try:
            self.db.add(user)
            await self.db.commit()
            await self.db.refresh(user)
            return user
        except Exception as e:
            await self.db.rollback()
            raise e
