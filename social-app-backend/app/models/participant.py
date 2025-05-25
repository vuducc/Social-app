from enum import Enum as PyEnum

from sqlalchemy import TIMESTAMP, Column, Enum, ForeignKey, Index, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class ParticipantType(PyEnum):
    SINGLE = "SINGLE"
    GROUP = "GROUP"


class Participant(Base):
    __tablename__ = "participants"

    participant_id = Column(
        String(50), primary_key=True, default="participant-" + func.uuid_generate_v4()
    )
    conversation_id = Column(
        String(50), ForeignKey("conversations.conversation_id", ondelete="CASCADE")
    )
    user_id = Column(String(50), ForeignKey("users.user_id", ondelete="CASCADE"))
    type = Column(Enum(ParticipantType), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("ix_participants_conversation_id", "conversation_id"),
        Index("ix_participants_user_id", "user_id"),
    )

    conversation = relationship("Conversation", back_populates="participants")
    user = relationship("User", lazy="selectin")
