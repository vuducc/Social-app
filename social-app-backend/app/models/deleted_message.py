from sqlalchemy import TIMESTAMP, Column, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class DeletedMessage(Base):
    __tablename__ = "deleted_messages"

    id = Column(
        String(50),
        primary_key=True,
        default="deleted-message-" + func.uuid_generate_v4(),
    )
    message_id = Column(
        String(50), ForeignKey("messages.message_id", ondelete="CASCADE")
    )
    user_id = Column(String(50), ForeignKey("users.user_id", ondelete="CASCADE"))
    deleted_at = Column(TIMESTAMP, server_default=func.now())

    message = relationship("Message", lazy="selectin")
    user = relationship("User", lazy="selectin")
