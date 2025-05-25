from typing import List

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserVerifyOTP(BaseModel):
    otp: str
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str
    roles: List[str]
    session_id: str


class RegisterResponse(BaseModel):
    message: str
    user_id: str
