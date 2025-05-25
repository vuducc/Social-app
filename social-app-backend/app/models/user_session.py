from datetime import datetime, timezone

from sqlalchemy import TIMESTAMP, Column, ForeignKey, String, select
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class UserSession(Base):
    __tablename__ = "user_sessions"

    session_id = Column(
        String(50), primary_key=True, default="session-" + func.uuid_generate_v4()
    )
    user_id = Column(String(50), ForeignKey("users.user_id", ondelete="CASCADE"))
    created_at = Column(TIMESTAMP, server_default=func.now())
    expires_at = Column(TIMESTAMP)

    user = relationship("User", back_populates="sessions", lazy="selectin")

    @property
    def is_expired(self) -> bool:
        """Check if the session has expired"""
        return self.expires_at < datetime.now(timezone.utc)

    @classmethod
    async def get_active_session(cls, db, session_id: str):
        """Get an active (non-expired) session"""
        query = select(cls).where(
            cls.session_id == session_id, cls.expires_at > datetime.now(timezone.utc)
        )
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @classmethod
    async def cleanup_expired_sessions(cls, db):
        """Remove all expired sessions"""
        query = select(cls).where(cls.expires_at <= datetime.now(timezone.utc))
        result = await db.execute(query)
        expired_sessions = result.scalars().all()
        for session in expired_sessions:
            await db.delete(session)
        await db.commit()
