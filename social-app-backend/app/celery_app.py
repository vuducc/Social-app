from celery import Celery

from app.core.settings import get_settings

settings = get_settings()

REDIS_URL = (
    f"redis://:{settings.REDIS_PASSWORD}@{settings.REDIS_HOST}:{settings.REDIS_PORT}/0"
)

# Tạo một ứng dụng Celery
celery_app = Celery(
    "app",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.tasks.notification_tasks"],
)

# Cấu hình Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    broker_connection_retry_on_startup=True,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    task_routes={"app.tasks.notification_tasks.*": {"queue": "notifications"}},
)
