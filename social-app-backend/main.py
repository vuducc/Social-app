import logging

from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.core.exception_handler import (
    http_exception_handler,
    validation_exception_handler,
)
from app.core.logging import setup_logging
from app.core.settings import get_settings
from app.routers import (
    admin_router,
    auth_router,
    chat_router,
    comment_router,
    notification_router,
    post_router,
    report_router,
    statistics_router,
    user_router,
    websocket_router,
)

setup_logging()
logger = logging.getLogger(__name__)

settings = get_settings()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        docs_url=f"{settings.API_PREFIX}/docs",
        redoc_url=f"{settings.API_PREFIX}/redoc",
        openapi_url=f"{settings.API_PREFIX}/openapi.json",
    )

    origins = [
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://20.2.67.45:3000",
        "http://135.233.97.237:3000",
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)

    api_router = APIRouter(prefix="/api")
    api_router.include_router(auth_router.router, prefix="/auth", tags=["auth"])
    api_router.include_router(user_router.router, prefix="/users", tags=["users"])
    api_router.include_router(post_router.router, prefix="/posts", tags=["posts"])
    api_router.include_router(chat_router.router, prefix="/chat", tags=["chat"])
    api_router.include_router(
        comment_router.router, prefix="/comments", tags=["comments"]
    )
    api_router.include_router(
        notification_router.router, prefix="/notifications", tags=["notifications"]
    )
    api_router.include_router(
        statistics_router.router, prefix="/statistics", tags=["statistics"]
    )
    api_router.include_router(admin_router.router, prefix="/admin", tags=["admin"])
    api_router.include_router(report_router.router, prefix="/reports", tags=["reports"])

    app.include_router(websocket_router.router)
    app.include_router(api_router)

    return app


app = create_app()
