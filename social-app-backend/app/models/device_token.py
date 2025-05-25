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


class DeviceToken(Base):
    __tablename__ = "device_tokens"

    id = Column(
        String(50), primary_key=True, default="device-" + func.uuid_generate_v4()
    )
    user_id = Column(
        String(50), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    token = Column(String(255), nullable=False)
    device_type = Column(String(50), nullable=False)  # ios/android
    device_id = Column(String(255), nullable=False)  # Unique device identifier
    is_active = Column(Boolean, default=True)  # Track if token is still active
    last_used_at = Column(TIMESTAMP, server_default=func.now())
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="device_tokens")

    __table_args__ = (
        Index(
            "ix_unique_active_device",
            "device_id",
            unique=True,
            postgresql_where=Column("is_active") == True,
        ),
        Index("ix_device_tokens_user_id", "user_id"),
        Index("ix_device_tokens_device_id", "device_id"),
        Index("ix_device_tokens_is_active", "is_active"),
    )
