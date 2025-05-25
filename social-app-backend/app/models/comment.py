from sqlalchemy import TIMESTAMP, CheckConstraint, Column, ForeignKey, Index, String
from sqlalchemy.orm import backref, relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Comment(Base):
    __tablename__ = "comments"

    comment_id = Column(
        String(50), primary_key=True, default="comment-" + func.uuid_generate_v4()
    )
    post_id = Column(String(50), ForeignKey("posts.post_id", ondelete="CASCADE"))
    user_id = Column(String(50), ForeignKey("users.user_id", ondelete="CASCADE"))
    content = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    parent_id = Column(
        String(50), ForeignKey("comments.comment_id", ondelete="CASCADE"), nullable=True
    )

    __table_args__ = (
        CheckConstraint("length(content) > 0", name="comments_content_check"),
        Index("ix_comments_post_id", "post_id"),
        Index("ix_comments_user_id", "user_id"),
        Index("ix_comments_parent_id", "parent_id"),
    )

    # Relationships
    user = relationship("User", back_populates="comments", lazy="selectin")
    post = relationship("Post", back_populates="comments", lazy="selectin")
    replies = relationship(
        "Comment",
        backref=backref("parent", remote_side=[comment_id]),
        cascade="all, delete-orphan",
        lazy="selectin",
    )
