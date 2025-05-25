from sqlalchemy import TIMESTAMP, Boolean, Column, ForeignKey, Index, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class MessageStatus(Base):
    __tablename__ = "message_statuses"

    id = Column(
        String(100),
        primary_key=True,
        default="message-status-" + func.uuid_generate_v4(),
    )
    message_id = Column(
        String(50), ForeignKey("messages.message_id", ondelete="CASCADE")
    )
    user_id = Column(String(50), ForeignKey("users.user_id", ondelete="CASCADE"))
    is_read = Column(Boolean, default=False)
    read_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    message = relationship("Message", lazy="selectin")
    user = relationship("User", lazy="selectin")

    __table_args__ = (
        Index("ix_message_statuses_message_id", "message_id"),
        Index("ix_message_statuses_user_id", "user_id"),
        Index("ix_message_statuses_message_user", "message_id", "user_id"),
    )
