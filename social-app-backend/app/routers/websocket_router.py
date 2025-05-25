import logging

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, get_redis
from app.core.security import decode_access_token
from app.core.websocket import manager
from app.schemas.chat import MessageCreate
from app.services.chat_service import ChatService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/ws-test")
async def test_websocket(websocket: WebSocket):
    try:
        await websocket.accept()
        print("Connection accepted")
        await websocket.send_text("Connected to test socket")
        await websocket.close()
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        raise


@router.websocket("/ws/{token}")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    try:
        # Verify token
        payload = decode_access_token(token)
        user_id = payload["user_id"]

        # Connect to WebSocket
        await manager.connect(websocket, user_id)
        chat_service = ChatService(db, redis)

        try:
            while True:
                data = await websocket.receive_json()

                if data["type"] == "join_conversation":
                    conversation_id = data["conversation_id"]
                    await manager.join_conversation(conversation_id, user_id)

                elif data["type"] == "leave_conversation":
                    conversation_id = data["conversation_id"]
                    await manager.leave_conversation(conversation_id, user_id)

                elif data["type"] == "message":
                    conversation_id = data["conversation_id"]
                    # Create message in database
                    message_data = MessageCreate(
                        conversation_id=data["conversation_id"],
                        content=data["content"],
                        message_type=data["message_type"],
                    )
                    message = await chat_service.create_message(user_id, message_data)

                    # Broadcast to conversation participants
                    await manager.broadcast_to_conversation(
                        conversation_id,
                        {
                            "type": "new_message",
                            "conversation_id": conversation_id,
                            "data": {
                                "message_id": message.message_id,
                                "sender_id": message.sender_id,
                                "content": message.content,
                                "message_type": "text",
                                "created_at": message.created_at.isoformat(),
                                "status": {
                                    "sent": True,
                                    "delivered": False,
                                    "seen_by": [],
                                },
                            },
                        },
                    )

                elif data["type"] == "typing":
                    conversation_id = data["conversation_id"]
                    # Broadcast typing status
                    await manager.broadcast_to_conversation(
                        conversation_id,
                        {
                            "type": "typing",
                            "conversation_id": conversation_id,
                            "data": {
                                "user_id": user_id,
                                "is_typing": data["is_typing"],
                            },
                        },
                    )

                elif data["type"] == "read_messages":
                    conversation_id = data["conversation_id"]
                    await chat_service.mark_messages_as_read(user_id, conversation_id)

                    # Broadcast read status
                    await manager.broadcast_to_conversation(
                        conversation_id,
                        {
                            "type": "messages_read",
                            "conversation_id": conversation_id,
                            "data": {
                                "user_id": user_id,
                            },
                        },
                    )

        except WebSocketDisconnect:
            await manager.disconnect(websocket, user_id)

    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        print(f"WebSocket error: {str(e)}")
        await websocket.close()
