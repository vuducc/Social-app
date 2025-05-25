from sqlalchemy import TIMESTAMP, CheckConstraint, Column, ForeignKey, Index, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Post(Base):
    __tablename__ = "posts"

    post_id = Column(
        String(50), primary_key=True, default="post-" + func.uuid_generate_v4()
    )
    user_id = Column(
        String(50), 
        ForeignKey("users.user_id", ondelete="CASCADE")
    )
    content = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("length(content) > 0", name="posts_content_check"),
        Index("ix_posts_user_id", "user_id"),
    )

    user = relationship("User", back_populates="posts", lazy="selectin")
    post_images = relationship(
        "PostImage", 
        back_populates="post", 
        lazy="selectin",
        cascade="all, delete-orphan"
    )
    comments = relationship(
        "Comment", 
        back_populates="post", 
        lazy="selectin",
        cascade="all, delete-orphan"
    )
    likes = relationship(
        "Like", 
        back_populates="post", 
        lazy="selectin",
        cascade="all, delete-orphan"
    )
