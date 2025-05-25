import random
from datetime import timedelta
from pathlib import Path

from fastapi.templating import Jinja2Templates
from fastapi_mail import FastMail, MessageSchema
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.email_config import mail_config
from app.core.security import get_password_hash
from app.models import User
from app.schemas.auth import UserCreate


class AuthService:
    def __init__(self, db: AsyncSession, redis: Redis = None):
        self.db = db
        self.redis = redis
        self.mail = FastMail(mail_config)
        # Khởi tạo templates
        self.templates = Jinja2Templates(
            directory=Path(__file__).parent.parent / "templates"
        )

    # Các methods không cần redis
    async def get_user_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: str) -> User | None:
        stmt = select(User).where(User.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_user(self, user_data: UserCreate) -> User:
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            password=get_password_hash(user_data.password),
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user

    # Các methods cần redis
    async def generate_otp(self, email: str) -> str:
        if not self.redis:
            raise ValueError("Redis connection required for OTP operations")
        otp = "".join([str(random.randint(0, 9)) for _ in range(6)])
        await self.redis.setex(f"otp:{email}", timedelta(minutes=5), otp)
        return otp

    async def verify_otp(self, email: str, otp: str) -> bool:
        """Xác thực OTP"""
        if not self.redis:
            raise ValueError("Redis connection required for OTP operations")

        stored_otp = await self.redis.get(f"otp:{email}")
        if not stored_otp:
            return False

        # Kiểm tra xem stored_otp có phải bytes không
        if isinstance(stored_otp, bytes):
            stored_otp = stored_otp.decode()

        return stored_otp == otp

    async def send_otp_email(self, email: str, otp: str):
        """Gửi OTP qua email với template HTML"""
        # Render template HTML với OTP
        html_content = self.templates.get_template("email/otp.html").render(
            {"otp": otp}
        )

        message = MessageSchema(
            subject="Xác thực tài khoản của bạn",
            recipients=[email],
            body=html_content,
            subtype="html",
        )

        await self.mail.send_message(message)
