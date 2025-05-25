from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import verify_token
from app.schemas.notification import (
    DeviceTokenCreate,
    DeviceTokenResponse,
    NotificationCount,
    NotificationCreate,
    NotificationResponse,
    PaginatedNotifications,
)
from app.services.notification_service import NotificationService

router = APIRouter()


@router.post("/register-device", response_model=DeviceTokenResponse)
async def register_device(
    device: DeviceTokenCreate,
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """
    Đăng ký device token cho push notification.

    - **token**: FCM token từ thiết bị
    - **device_type**: Loại thiết bị (ios/android)
    - **device_id**: ID định danh của thiết bị
    """
    notification_service = NotificationService(db)
    return await notification_service.register_device(
        user_id=user_id,
        token=device.token,
        device_type=device.device_type,
        device_id=device.device_id,
    )


@router.get("/devices", response_model=List[DeviceTokenResponse])
async def get_user_devices(
    user_id: str = Depends(verify_token), db: AsyncSession = Depends(get_db)
):
    """Lấy danh sách thiết bị đã đăng ký của user"""
    notification_service = NotificationService(db)
    return await notification_service.get_user_devices(user_id)


@router.delete("/devices/{device_id}")
async def delete_device(
    device_id: str,
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """Xóa thiết bị khỏi danh sách đăng ký"""
    notification_service = NotificationService(db)
    success = await notification_service.delete_device(user_id, device_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Device not found"
        )
    return {"message": "Device deleted successfully"}


@router.get("/", response_model=PaginatedNotifications)
async def get_notifications(
    page: int = 1,
    size: int = 20,
    is_report: bool = None,
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """
    Lấy danh sách thông báo của user với phân trang.

    - **page**: Số trang (bắt đầu từ 1)
    - **size**: Số lượng item mỗi trang
    - **is_report**: Lọc thông báo theo type REPORT (True) hoặc không phải REPORT (False)
    """
    notification_service = NotificationService(db)
    return await notification_service.get_notifications(
        user_id=user_id, page=page, size=size, is_report=is_report
    )


@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: str,
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """Đánh dấu thông báo đã đọc"""
    notification_service = NotificationService(db)
    success = await notification_service.mark_as_read(
        notification_id=notification_id, user_id=user_id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found"
        )
    return {"message": "Notification marked as read"}


@router.get("/counts", response_model=NotificationCount)
async def get_notification_counts(
    user_id: str = Depends(verify_token), db: AsyncSession = Depends(get_db)
):
    """Lấy số lượng thông báo và số chưa đọc"""
    notification_service = NotificationService(db)
    return await notification_service.get_notification_counts(user_id)


@router.post("/", response_model=NotificationResponse)
async def create_notification(
    notification: NotificationCreate,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
):
    """
    Tạo thông báo mới (Chỉ dùng cho testing)
    Trong thực tế, notifications sẽ được tạo từ các service khác
    """
    notification_service = NotificationService(db)
    return await notification_service.create_notification(
        notification_create=notification,
        sender_id=user_id,
        background_tasks=background_tasks,
    )
