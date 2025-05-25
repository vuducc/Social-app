from enum import Enum as PyEnum

from sqlalchemy import TIMESTAMP, Column, Enum, ForeignKey, Index, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class ReportType(PyEnum):
    POST = "POST"
    COMMENT = "COMMENT"


class ReportStatus(PyEnum):
    PENDING = "PENDING"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"


class Report(Base):
    __tablename__ = "reports"

    report_id = Column(
        String(50), primary_key=True, default="report-" + func.uuid_generate_v4()
    )
    reporter_id = Column(String(50), ForeignKey("users.user_id", ondelete="CASCADE"))
    reported_id = Column(String(50), ForeignKey("users.user_id", ondelete="CASCADE"))
    type = Column(Enum(ReportType), nullable=False)
    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING)
    content_id = Column(String(50), nullable=False)  # post_id or comment_id
    reason = Column(Text, nullable=False)
    admin_note = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    resolved_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    reporter = relationship("User", foreign_keys=[reporter_id], lazy="selectin")
    reported_user = relationship("User", foreign_keys=[reported_id], lazy="selectin")

    __table_args__ = (
        Index("ix_reports_reporter_id", "reporter_id"),
        Index("ix_reports_reported_id", "reported_id"),
        Index("ix_reports_status", "status"),
        Index("ix_reports_type", "type"),
    )
