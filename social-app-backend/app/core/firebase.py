import logging

import firebase_admin
from firebase_admin import credentials, messaging

from app.core.settings import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()

# Initialize Firebase Admin
cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
firebase_admin.initialize_app(cred)


async def send_push_notification(
    token: str, title: str, body: str, data: dict = None
) -> bool:
    try:
        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data=data,
            token=token,
        )

        response = messaging.send(message)
        logger.info(f"Successfully sent notification: {response}")
        return True if response else False
    except Exception as e:
        logger.error(f"Error sending notification: {e}")
        return False
