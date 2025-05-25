from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import TIMESTAMP, Column, Enum, ForeignKey, Index, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(
        String(50), primary_key=True, default="notification-" + func.uuid_generate_v4()
    )
    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    sender_id = Column(
        String(50), ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True
    )
    data = Column(Text, nullable=True)  # JSON data as string
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], lazy="selectin")
    recipients = relationship(
        "NotificationRecipient",
        back_populates="notification",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("ix_notifications_sender_id", "sender_id"),
        Index("ix_notifications_created_at", "created_at"),
    )
