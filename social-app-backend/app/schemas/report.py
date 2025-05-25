from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel


class ReportCreate(BaseModel):
    type: Literal["POST", "COMMENT"]
    content_id: str
    reason: str


class ReportUpdate(BaseModel):
    status: Literal["PENDING", "RESOLVED", "REJECTED"]
    admin_note: Optional[str] = None


class ReportResponse(BaseModel):
    report_id: str
    reporter_id: str
    reported_id: str
    type: str
    status: str
    content_id: str
    reason: str
    admin_note: Optional[str]
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True
