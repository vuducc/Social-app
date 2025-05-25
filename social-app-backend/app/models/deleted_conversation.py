from sqlalchemy import TIMESTAMP, Column, ForeignKey, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class DeletedConversation(Base):
    __tablename__ = "deleted_conversations"

    id = Column(
        String(50),
        primary_key=True,
        default="conversation-" + func.uuid_generate_v4(),
    )
    conversation_id = Column(
        String(50), ForeignKey("conversations.conversation_id", ondelete="CASCADE")
    )
    user_id = Column(String(50), ForeignKey("users.user_id", ondelete="CASCADE"))
    deleted_at = Column(TIMESTAMP, server_default=func.now())

    conversation = relationship("Conversation", lazy="selectin")
    user = relationship("User", lazy="selectin")
