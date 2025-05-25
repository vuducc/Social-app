from datetime import datetime

from sqlalchemy import TIMESTAMP, Column, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    conversation_id: Mapped[str] = Column(
        String(50), primary_key=True, default="conversation-" + func.uuid_generate_v4()
    )
    title: Mapped[str] = Column(String(255), nullable=True)
    creator_id: Mapped[str] = Column(
        String(50), ForeignKey("users.user_id", ondelete="CASCADE")
    )
    created_at: Mapped[datetime] = Column(TIMESTAMP, server_default=func.now())
    updated_at: Mapped[datetime] = Column(
        TIMESTAMP, server_default=func.now(), onupdate=func.now()
    )
    deleted_at: Mapped[datetime] = Column(TIMESTAMP, nullable=True)

    messages = relationship("Message", back_populates="conversation", lazy="selectin", cascade="all, delete-orphan")
    participants = relationship(
        "Participant", back_populates="conversation", lazy="selectin", cascade="all, delete-orphan"
    )

    __table_args__ = (Index("ix_conversations_creator_id", "creator_id"),)
