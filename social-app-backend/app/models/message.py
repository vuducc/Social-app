from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import (
    TIMESTAMP,
    Column,
    Enum,
    ForeignKey,
    Index,
    String,
)
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class MessageType(PyEnum):
    TEXT = "TEXT"
    IMAGE = "IMAGE"
    VIDEO = "VIDEO"
    AUDIO = "AUDIO"


class Message(Base):
    __tablename__ = "messages"

    message_id: Mapped[str] = Column(
        String(50), primary_key=True, default="message-" + func.uuid_generate_v4()
    )
    conversation_id: Mapped[str] = Column(
        String(50), ForeignKey("conversations.conversation_id", ondelete="CASCADE")
    )
    sender_id: Mapped[str] = Column(
        String(50), ForeignKey("users.user_id", ondelete="CASCADE")
    )
    message_type: Mapped[str] = Column(Enum(MessageType), nullable=False)
    content: Mapped[str] = Column(String, nullable=False)
    updated_at: Mapped[datetime] = Column(
        TIMESTAMP, server_default=func.now(), onupdate=func.now()
    )
    created_at: Mapped[datetime] = Column(TIMESTAMP, server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship(
        "User",
        back_populates="sent_messages",
        foreign_keys=[sender_id],
        lazy="selectin",
    )

    __table_args__ = (
        Index("ix_messages_conversation_id", "conversation_id"),
        Index("ix_messages_sender_id", "sender_id"),
    )
