from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user_session import UserSession


class SessionService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_session(
        self, user_id: str, expires_in_days: int = 7
    ) -> UserSession:
        """Create a new session for a user"""
        expires_at = (
            datetime.now(timezone.utc) + timedelta(days=expires_in_days)
        ).replace(tzinfo=None)

        session = UserSession(
            user_id=user_id,
            expires_at=expires_at,
        )
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        return session

    async def get_active_session(self, session_id: str) -> UserSession | None:
        """Get an active session by ID"""
        return await UserSession.get_active_session(self.db, session_id)

    async def delete_session(self, session_id: str) -> None:
        """Delete a session"""
        session = await self.get_active_session(session_id)
        if session:
            await self.db.delete(session)
            await self.db.commit()

    async def cleanup_expired_sessions(self) -> None:
        """Clean up all expired sessions"""
        await UserSession.cleanup_expired_sessions(self.db)

    async def get_user_sessions(self, user_id: str) -> list[UserSession]:
        """Get all active sessions for a user"""
        current_time = datetime.now(timezone.utc).replace(tzinfo=None)
        query = select(UserSession).where(
            UserSession.user_id == user_id,
            UserSession.expires_at > current_time,
        )
        result = await self.db.execute(query)
        return result.scalars().all()
