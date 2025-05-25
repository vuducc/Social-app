import logging

from fastapi import APIRouter, Depends, Query
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, get_redis
from app.core.dependencies import verify_token
from app.schemas.chat import (
    ConversationCreate,
    ConversationMessagesResponse,
    ConversationResponse,
    ConversationsResponse,
    MessageCreate,
    MessageResponse,
)
from app.services.chat_service import ChatService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    conversation: ConversationCreate,
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    chat_service = ChatService(db, redis)
    return await chat_service.create_conversation(user_id, conversation)


@router.get("/conversations", response_model=ConversationsResponse)
async def get_conversations(
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    chat_service = ChatService(db, redis)
    return await chat_service.get_user_conversations(user_id)


@router.post("/messages", response_model=MessageResponse)
async def create_message(
    message: MessageCreate,
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    chat_service = ChatService(db, redis)
    return await chat_service.create_message(user_id, message)


@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=ConversationMessagesResponse,
)
async def get_conversation_messages(
    conversation_id: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    chat_service = ChatService(db, redis)
    return await chat_service.get_conversation_messages(
        conversation_id, user_id, limit, offset
    )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    user_id: str = Depends(verify_token),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),
):
    chat_service = ChatService(db, redis)
    await chat_service.delete_conversation(user_id, conversation_id)
    return {
        "message": "conversation deleted successfully",
        "conversation_id": conversation_id,
    }
