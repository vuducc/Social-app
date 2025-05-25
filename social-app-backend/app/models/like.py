from sqlalchemy import TIMESTAMP, Column, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Like(Base):
    __tablename__ = "likes"

    like_id = Column(
        String(50), primary_key=True, default="like-" + func.uuid_generate_v4()
    )
    user_id = Column(String(50), ForeignKey("users.user_id", ondelete="CASCADE"))
    post_id = Column(String(50), ForeignKey("posts.post_id", ondelete="CASCADE"))
    created_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="unique_user_post_like"),
        Index("ix_likes_user_id", "user_id"),
        Index("ix_likes_post_id", "post_id"),
    )

    post = relationship("Post", back_populates="likes", lazy="selectin")
    user = relationship("User", back_populates="likes", lazy="selectin")
