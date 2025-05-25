from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user, verify_admin
from app.models.report import ReportStatus
from app.schemas.report import ReportCreate, ReportResponse, ReportUpdate
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("", response_model=ReportResponse)
async def create_report(
    report_data: ReportCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new report"""
    report_service = ReportService(db)
    return await report_service.create_report(current_user.user_id, report_data.dict())


@router.get("", response_model=List[ReportResponse])
async def get_reports(
    status: ReportStatus = None,
    skip: int = 0,
    limit: int = 50,
    _: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get all reports (Admin only)"""
    report_service = ReportService(db)
    return await report_service.get_reports(status, skip, limit)


@router.put("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: str,
    report_update: ReportUpdate,
    _: bool = Depends(verify_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update report status (Admin only)"""
    report_service = ReportService(db)
    return await report_service.update_report(
        report_id, report_update.status, report_update.admin_note
    )
