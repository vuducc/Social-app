import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.settings import get_settings

load_dotenv()

settings = get_settings()

SQLALCHEMY_DATABASE_URL = (
    f"postgresql+asyncpg://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}"
    f"@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
)

# Create a new SQLAlchemy async engine instance without SSL
engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=False,
)

# Create a configured "AsyncSession" class
SessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Create a base class for our models
Base = declarative_base()


# Dependency to get a session
async def get_db():
    async with SessionLocal() as session:
        yield session


async def get_redis() -> Redis:  # type: ignore
    redis = Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        password=settings.REDIS_PASSWORD,
        db=settings.REDIS_DB,
        decode_responses=True,
        encoding="utf-8",
    )
    try:
        await redis.ping()
        yield redis
    finally:
        await redis.close()
