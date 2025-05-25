import json
from datetime import datetime
from typing import List

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.comment import Comment
from app.models.post import Post
from app.models.report import Report, ReportStatus, ReportType
from app.models.user import User
from app.services.notification_service import NotificationService


class ReportService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.notification_service = NotificationService(db)

    async def create_report(self, reporter_id: str, report_data: dict) -> Report:
        # Verify content exists
        content_id = report_data["content_id"]
        report_type = report_data["type"]

        # Convert string type to enum
        report_type_enum = ReportType(report_type)

        if report_type_enum == ReportType.POST:
            content = await self.db.execute(
                select(Post).where(Post.post_id == content_id)
            )
            content = content.scalar_one_or_none()
            if not content:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Post not found: {content_id}",
                )
            reported_id = content.user_id
        else:
            content = await self.db.execute(
                select(Comment).where(Comment.comment_id == content_id)
            )
            content = content.scalar_one_or_none()
            if not content:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Comment not found: {content_id}",
                )
            reported_id = content.user_id

        # Create report
        report = Report(
            reporter_id=reporter_id,
            reported_id=reported_id,
            type=report_type_enum,
            content_id=content_id,
            reason=report_data["reason"],
            status=ReportStatus.PENDING,
        )
        self.db.add(report)

        # Notify admins
        admins = await self.db.execute(select(User).where(User.is_admin == True))
        admin_ids = [admin.user_id for admin in admins.scalars()]

        if admin_ids:
            # Tạo notification data theo đúng format
            notification_data = {
                "type": "REPORT",
                "title": "New Report",
                "body": f"New {report_type} report needs review",
                "data": json.dumps(
                    {
                        "report_id": report.report_id,
                        "type": report_type,
                        "content_id": content_id,
                        "reporter_id": reporter_id,
                        "reported_id": reported_id,
                    }
                ),
                "recipient_id": admin_ids[0],  # Gửi cho admin đầu tiên
            }

            # Gọi create_notification với notification_data
            await self.notification_service.create_notification(
                notification_data=notification_data, sender_id=reporter_id
            )

        await self.db.commit()
        await self.db.refresh(report)
        return report

    async def get_reports(
        self, status: ReportStatus = None, skip: int = 0, limit: int = 50
    ) -> List[Report]:
        query = select(Report).order_by(Report.created_at.desc())

        if status:
            query = query.where(Report.status == status)

        query = query.offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def update_report(
        self, report_id: str, status: str, admin_note: str = None
    ) -> Report:
        """Update report status"""
        report = await self.db.execute(
            select(Report).where(Report.report_id == report_id)
        )
        report = report.scalar_one_or_none()

        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Report not found"
            )

        # Chuyển đổi string status thành enum
        try:
            report.status = ReportStatus(status)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status value. Must be one of: {[s.value for s in ReportStatus]}",
            )

        report.admin_note = admin_note
        report.resolved_at = datetime.utcnow() if status == "RESOLVED" else None
        report.updated_at = datetime.utcnow()  # Cập nhật updated_at

        await self.db.commit()
        await self.db.refresh(report)  # Refresh để lấy data mới nhất
        return report
