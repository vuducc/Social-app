import logging
from logging.config import dictConfig

from colorlog import ColoredFormatter

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "[%(asctime)s] [%(levelname)s] [%(name)s.%(funcName)s:%(lineno)d] %(message)s",
        },
        "colored": {
            "()": ColoredFormatter,
            "format": "%(log_color)s[%(asctime)s] [%(levelname)s] [%(name)s.%(funcName)s:%(lineno)d]%(reset)s %(message)s",
            "log_colors": {
                "DEBUG": "cyan",
                "INFO": "green",
                "WARNING": "yellow",
                "ERROR": "red",
                "CRITICAL": "red,bg_white",
            },
            "secondary_log_colors": {},
            "style": "%",
            "datefmt": None,
        },
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "colored",
        },
        "file": {
            "level": "DEBUG",
            "class": "logging.FileHandler",
            "formatter": "standard",
            "filename": "app.log",
        },
    },
    "root": {
        "handlers": ["console", "file"],
        "level": "WARNING",
    },
    "loggers": {
        # Logger mặc định cho toàn bộ ứng dụng
        "app": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "passlib": {
            "level": "ERROR",  # Only show errors, not warnings
            "handlers": ["console"],
            "propagate": False,
        },
    },
}


def setup_logging():
    dictConfig(LOGGING_CONFIG)
