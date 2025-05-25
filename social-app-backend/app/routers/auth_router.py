import json
import logging
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from fastapi import APIRouter, Body, Cookie, Depends, HTTPException, Response, status
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, get_redis
from app.core.dependencies import verify_token
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    verify_password,
)
from app.schemas.auth import (
    RegisterResponse,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserVerifyOTP,
)
from app.services import AuthService
from app.services.session_service import SessionService
from app.services.user_status_service import UserStatusService

load_dotenv()

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/register")
async def register_user(
    user: UserCreate,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    auth_service = AuthService(db, redis)

    # Kiểm tra email tồn tại
    existing_user = await auth_service.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Tạo và gửi OTP
    otp = await auth_service.generate_otp(user.email)
    await auth_service.send_otp_email(user.email, otp)

    # Lưu thông tin user tạm thời vào Redis
    user_data = user.dict()
    await redis.setex(
        f"pending_user:{user.email}", timedelta(minutes=5), json.dumps(user_data)
    )

    return {"message": "Please verify your email with OTP", "email": user.email}


@router.post("/login", response_model=TokenResponse)
async def signin(
    response: Response,
    user: UserLogin = Body(default={"email": "admin@gmail.com", "password": "admin"}),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    auth_service = AuthService(db)
    session_service = SessionService(db)

    # Kiểm tra email và password
    user_db = await auth_service.get_user_by_email(user.email)
    if not user_db or not verify_password(user.password, user_db.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    # Kiểm tra user có bị banned không
    if user_db.is_banned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been banned",
        )

    # Tạo session mới
    session = await session_service.create_session(user_db.user_id)

    # Convert expires_at to UTC datetime for cookie
    cookie_expires = datetime.fromtimestamp(
        session.expires_at.timestamp(), tz=timezone.utc
    )

    # Tạo tokens
    access_token = create_access_token(user_db.user_id)
    refresh_token = create_refresh_token(user_db.user_id)

    # Set refresh token cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
    )

    # Set session cookie with UTC datetime
    response.set_cookie(
        key="session_id",
        value=session.session_id,
        httponly=True,
        secure=False,
        samesite="lax",
        expires=cookie_expires,
    )

    user_status_service = UserStatusService(redis)
    await user_status_service.set_user_online(user_db.user_id)

    # Xác định roles dựa trên is_admin
    roles = ["user"]
    if user_db.is_admin:
        roles.append("admin")

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user_db.user_id,
        roles=roles,
        session_id=session.session_id,
    )


@router.post("/refresh-token", response_model=TokenResponse)
async def refresh_token(
    response: Response,
    db: AsyncSession = Depends(get_db),
    session_id: str = Cookie(None),
    refresh_token: str = Cookie(None),
):
    if not refresh_token:
        raise HTTPException(
            status_code=401,
            detail="No refresh token provided",
        )

    auth_service = AuthService(db)

    payload = decode_refresh_token(refresh_token)
    if not payload or not payload.get("user_id"):
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    user = await auth_service.get_user_by_id(payload["user_id"])
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    access_token = create_access_token(user.user_id)
    new_refresh_token = create_refresh_token(user.user_id, exp=payload.get("exp"))

    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
    )

    # Xác định roles
    roles = ["user"]
    if user.is_admin:
        roles.append("admin")

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user_id=user.user_id,
        roles=roles,
        session_id=session_id,
    )


@router.post("/logout")
async def logout(
    response: Response,
    user_id: str = Depends(verify_token),
    session_id: str = Cookie(None),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    session_service = SessionService(db)

    # Delete session if exists
    if session_id:
        await session_service.delete_session(session_id)
        response.delete_cookie(key="session_id")

    response.delete_cookie(key="refresh_token")

    user_status_service = UserStatusService(redis)
    await user_status_service.set_user_offline(user_id)

    return {
        "message": "Logout successful",
    }


@router.post("/verify-otp")
async def verify_otp(
    body: UserVerifyOTP = Body(default={"otp": "123456", "email": "admin@gmail.com"}),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    auth_service = AuthService(db, redis)

    # Verify OTP
    if not await auth_service.verify_otp(body.email, body.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP or OTP expired"
        )

    # Lấy thông tin user từ Redis
    user_data = await redis.get(f"pending_user:{body.email}")
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration session expired",
        )

    # Tạo user trong database
    user_data = json.loads(user_data)
    user = UserCreate(**user_data)
    db_user = await auth_service.create_user(user)

    # Xóa dữ liệu tạm từ Redis
    await redis.delete(f"otp:{body.email}", f"pending_user:{body.email}")

    return {"message": "User registered successfully", "user_id": db_user.user_id}
