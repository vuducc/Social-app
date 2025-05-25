from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class PostImage(Base):
    __tablename__ = "post_images"

    image_id = Column(
        String(50), primary_key=True, default="post-image-" + func.uuid_generate_v4()
    )
    post_id = Column(
        String(50), 
        ForeignKey("posts.post_id", ondelete="CASCADE")
    )
    image_url = Column(String, nullable=False)

    post = relationship(
        "Post", 
        back_populates="post_images", 
        lazy="selectin"
    )
