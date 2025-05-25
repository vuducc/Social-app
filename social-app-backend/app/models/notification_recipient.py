from sqlalchemy import (
    TIMESTAMP,
    Boolean,
    Column,
    ForeignKey,
    Index,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class NotificationRecipient(Base):
    __tablename__ = "notification_recipients"

    id = Column(
        String(50),
        primary_key=True,
        default="noti-rec-" + func.uuid_generate_v4(),
    )
    notification_id = Column(
        String(50),
        ForeignKey("notifications.notification_id", ondelete="CASCADE"),
        nullable=False,
    )
    recipient_id = Column(
        String(50), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    is_read = Column(Boolean, default=False)
    read_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    notification = relationship(
        "Notification", back_populates="recipients", lazy="selectin"
    )
    recipient = relationship("User", foreign_keys=[recipient_id], lazy="selectin")

    __table_args__ = (
        UniqueConstraint(
            "notification_id", "recipient_id", name="unique_notification_recipient"
        ),
        Index("ix_notification_recipients_notification_id", "notification_id"),
        Index("ix_notification_recipients_recipient_id", "recipient_id"),
        Index("ix_notification_recipients_is_read", "is_read"),
    )
