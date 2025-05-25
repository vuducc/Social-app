from sqlalchemy import TIMESTAMP, Column, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Follow(Base):
    __tablename__ = "follows"

    follow_id = Column(
        String(50), primary_key=True, default="follow-" + func.uuid_generate_v4()
    )
    user_id = Column(String(50), ForeignKey("users.user_id", ondelete="CASCADE"))
    following_id = Column(String(50), ForeignKey("users.user_id", ondelete="CASCADE"))
    created_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "following_id", name="unique_follow"),
        Index("ix_follows_user_id", "user_id"),
        Index("ix_follows_following_id", "following_id"),
    )

    follower = relationship(
        "User", back_populates="following", foreign_keys=[user_id], lazy="selectin"
    )
    following = relationship(
        "User", back_populates="followers", foreign_keys=[following_id], lazy="selectin"
    )
