from sqlalchemy import TIMESTAMP, Boolean, CheckConstraint, Column, Index, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(
        String(50), primary_key=True, default="user-" + func.uuid_generate_v4()
    )
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    username = Column(String(50), nullable=False)
    profile_picture_url = Column(String)
    bio = Column(String)
    is_admin = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    full_name = Column(String(255), nullable=False, default="")
    is_banned = Column(Boolean, default=False)

    __table_args__ = (
        CheckConstraint("length(username) >= 3", name="users_username_check"),
        Index("ix_users_email", "email"),
        Index("ix_users_username", "username"),
        Index("ix_users_is_admin", "is_admin"),
    )

    posts = relationship(
        "Post", back_populates="user", lazy="selectin", cascade="all, delete-orphan"
    )
    comments = relationship(
        "Comment", back_populates="user", lazy="selectin", cascade="all, delete-orphan"
    )
    likes = relationship(
        "Like", back_populates="user", lazy="selectin", cascade="all, delete-orphan"
    )
    sessions = relationship(
        "UserSession",
        back_populates="user",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    sent_messages = relationship(
        "Message",
        back_populates="sender",
        foreign_keys="Message.sender_id",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    followers = relationship(
        "Follow",
        back_populates="following",
        foreign_keys="Follow.following_id",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    following = relationship(
        "Follow",
        back_populates="follower",
        foreign_keys="Follow.user_id",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    device_tokens = relationship(
        "DeviceToken",
        back_populates="user",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    notifications_received = relationship(
        "NotificationRecipient",
        foreign_keys="NotificationRecipient.recipient_id",
        back_populates="recipient",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    notifications_sent = relationship(
        "Notification",
        foreign_keys="Notification.sender_id",
        back_populates="sender",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
