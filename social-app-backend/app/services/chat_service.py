from typing import List

from fastapi import HTTPException
from redis.asyncio import Redis
from sqlalchemy import and_, case, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.conversation import Conversation
from app.models.deleted_conversation import DeletedConversation
from app.models.message import Message
from app.models.message_status import MessageStatus
from app.models.participant import Participant, ParticipantType
from app.models.user import User
from app.schemas.chat import (
    ConversationCreate,
    ConversationInfo,
    ConversationListResponse,
    ConversationMessagesResponse,
    ConversationType,
    DetailedMessageResponse,
    LatestMessage,
    MessageCreate,
    MessageDeliveryStatus,
    PaginationInfo,
    ParticipantInfo,
    ParticipantResponse,
)
from app.services.user_status_service import UserStatusService


class ChatService:
    def __init__(self, db: AsyncSession, redis: Redis):
        self.db = db
        self.redis = redis
        self.user_status_service = UserStatusService(redis)

    async def create_conversation(
        self, creator_id: str, conversation_data: ConversationCreate
    ) -> Conversation:
        # For 1-1 chat, user only needs to send the other participant's ID
        if len(conversation_data.participant_ids) != 1:
            raise HTTPException(
                status_code=400,
                detail="For direct message, provide only one participant ID",
            )

        other_user_id = conversation_data.participant_ids[0]

        # Check if trying to create chat with self
        if creator_id == other_user_id:
            raise HTTPException(
                status_code=400, detail="Cannot create conversation with yourself"
            )

        # Check if conversation already exists between these users
        existing_conv_query = (
            select(Conversation)
            .join(
                Participant, Conversation.conversation_id == Participant.conversation_id
            )
            .filter(
                Participant.user_id.in_([creator_id, other_user_id]),
                Participant.type == ParticipantType.SINGLE,
                Conversation.deleted_at.is_(None),
            )
            .group_by(Conversation.conversation_id)
            .having(func.count(Participant.user_id) == 2)
        )

        result = await self.db.execute(existing_conv_query)
        existing_conversation = result.scalar_one_or_none()

        if existing_conversation:
            return existing_conversation

        # Create new conversation
        conversation = Conversation(
            creator_id=creator_id, title=None  # 1-1 chat doesn't need title
        )
        self.db.add(conversation)
        await self.db.flush()

        # Add both participants
        participants = [
            Participant(
                conversation_id=conversation.conversation_id,
                user_id=user_id,
                type=ParticipantType.SINGLE,
            )
            for user_id in [creator_id, other_user_id]
        ]

        for participant in participants:
            self.db.add(participant)

        await self.db.commit()
        return conversation

    async def get_user_conversations(
        self, user_id: str
    ) -> List[ConversationListResponse]:
        # Get latest message for each conversation using window function
        latest_messages_subquery = select(
            Message.conversation_id,
            Message.message_id,
            Message.content,
            Message.created_at,
            Message.sender_id,
            Message.message_type,
            func.row_number()
            .over(
                partition_by=Message.conversation_id, order_by=Message.created_at.desc()
            )
            .label("rn"),
        ).subquery()

        # Main query
        query = (
            select(
                Conversation,
                latest_messages_subquery.c.message_id,
                latest_messages_subquery.c.content,
                latest_messages_subquery.c.message_type,
                latest_messages_subquery.c.sender_id,
                latest_messages_subquery.c.created_at.label("message_created_at"),
                func.count(
                    case(
                        (
                            and_(
                                Message.sender_id != user_id,
                                or_(
                                    MessageStatus.is_read.is_(False),
                                    MessageStatus.is_read.is_(None),
                                ),
                            ),
                            1,
                        )
                    )
                ).label("unread_count"),
            )
            .join(
                Participant, Conversation.conversation_id == Participant.conversation_id
            )
            .outerjoin(
                latest_messages_subquery,
                and_(
                    Conversation.conversation_id
                    == latest_messages_subquery.c.conversation_id,
                    latest_messages_subquery.c.rn == 1,
                ),
            )
            .outerjoin(Message, Conversation.conversation_id == Message.conversation_id)
            .outerjoin(
                MessageStatus,
                and_(
                    Message.message_id == MessageStatus.message_id,
                    MessageStatus.user_id == user_id,
                ),
            )
            .filter(Participant.user_id == user_id, Conversation.deleted_at.is_(None))
            .group_by(
                Conversation.conversation_id,
                latest_messages_subquery.c.message_id,
                latest_messages_subquery.c.content,
                latest_messages_subquery.c.message_type,
                latest_messages_subquery.c.sender_id,
                latest_messages_subquery.c.created_at,
            )
            .order_by(latest_messages_subquery.c.created_at.desc())
        )

        result = await self.db.execute(query)
        conversations = result.all()

        # Get participants info including online status

        response_conversations = []
        for conv in conversations:
            # Get participants
            participants_query = (
                select(User)
                .join(Participant, User.user_id == Participant.user_id)
                .filter(
                    Participant.conversation_id == conv.Conversation.conversation_id
                )
            )
            participants = (await self.db.execute(participants_query)).scalars().all()

            # Get online status for each participant
            participant_responses = []
            for p in participants:
                is_online = await self.user_status_service.is_user_online(p.user_id)
                participant_responses.append(
                    ParticipantResponse(
                        user_id=p.user_id,
                        username=p.username,
                        full_name=p.full_name,
                        profile_picture_url=p.profile_picture_url,
                        is_online=is_online,
                    )
                )

            response_conversations.append(
                ConversationListResponse(
                    conversation_id=conv.Conversation.conversation_id,
                    title=conv.Conversation.title,
                    creator_id=conv.Conversation.creator_id,
                    created_at=conv.Conversation.created_at,
                    updated_at=conv.Conversation.updated_at,
                    participants=participant_responses,
                    latest_message=(
                        LatestMessage(
                            message_id=conv.message_id,
                            content=conv.content,
                            message_type=conv.message_type,
                            sender_id=conv.sender_id,
                            created_at=conv.message_created_at,
                            is_read=True if conv.unread_count == 0 else False,
                        )
                        if conv.message_id
                        else None
                    ),
                    unread_count=conv.unread_count,
                )
            )

        return {
            "conversations": response_conversations,
            "total": len(response_conversations),
        }

    async def create_message(
        self, sender_id: str, message_data: MessageCreate
    ) -> Message:
        # Verify sender is participant
        query = select(Participant).filter(
            Participant.conversation_id == message_data.conversation_id,
            Participant.user_id == sender_id,
        )
        result = await self.db.execute(query)
        participant = result.scalar_one_or_none()

        if not participant:
            raise HTTPException(
                status_code=403, detail="User is not a participant in this conversation"
            )

        message = Message(
            conversation_id=message_data.conversation_id,
            sender_id=sender_id,
            content=message_data.content,
            message_type=message_data.message_type,
        )

        self.db.add(message)
        await self.db.commit()
        return message

    async def get_conversation_messages(
        self, conversation_id: str, user_id: str, limit: int = 50, offset: int = 0
    ) -> ConversationMessagesResponse:
        # Verify user is participant
        query = select(Participant).filter(
            Participant.conversation_id == conversation_id,
            Participant.user_id == user_id,
        )
        result = await self.db.execute(query)
        participant = result.scalar_one_or_none()

        if not participant:
            raise HTTPException(
                status_code=403, detail="User is not a participant in this conversation"
            )

        # Get conversation info with participants
        conv_query = (
            select(Conversation)
            .options(joinedload(Conversation.participants).joinedload(Participant.user))
            .filter(Conversation.conversation_id == conversation_id)
        )
        result = await self.db.execute(conv_query)
        conversation = result.unique().scalar_one()

        # Get participants info including online status and last seen
        participants_info = []
        for p in conversation.participants:
            is_online = await self.user_status_service.is_user_online(p.user.user_id)

            # Get last read message time for this participant
            last_seen_query = (
                select(MessageStatus.read_at)
                .filter(
                    MessageStatus.user_id == p.user.user_id,
                    MessageStatus.is_read == True,
                )
                .order_by(MessageStatus.read_at.desc())
                .limit(1)
            )
            last_seen_result = await self.db.execute(last_seen_query)
            last_seen = last_seen_result.scalar_one_or_none()

            participants_info.append(
                ParticipantInfo(
                    user_id=p.user.user_id,
                    username=p.user.username,
                    full_name=p.user.full_name,
                    profile_picture_url=p.user.profile_picture_url,
                    is_online=is_online,
                    last_seen=last_seen,
                    role=p.type.value,
                )
            )
            # Get total message count
            count_query = select(func.count(Message.message_id)).filter(
                Message.conversation_id == conversation_id
            )
            total_count = await self.db.execute(count_query)
            total_messages = total_count.scalar()

            # Get messages with pagination and related data
            messages_query = (
                select(Message, User, MessageStatus)
                .join(User, Message.sender_id == User.user_id)
                .outerjoin(
                    MessageStatus,
                    and_(
                        Message.message_id == MessageStatus.message_id,
                        MessageStatus.user_id == user_id,
                    ),
                )
                .filter(Message.conversation_id == conversation_id)
                .order_by(Message.created_at.desc())
                .offset(offset)
                .limit(limit)
            )

            result = await self.db.execute(messages_query)
            messages_data = result.all()

            # Process messages
            detailed_messages = []
            for message, user, status in messages_data:
                # Get seen_by information for each message
                seen_by_query = (
                    select(MessageStatus, User)
                    .join(User, MessageStatus.user_id == User.user_id)
                    .filter(
                        MessageStatus.message_id == message.message_id,
                        MessageStatus.is_read == True,
                    )
                )
                seen_by_result = await self.db.execute(seen_by_query)
                seen_by_data = seen_by_result.all()

                seen_by = [
                    {"user_id": user.user_id, "seen_at": status.read_at}
                    for status, user in seen_by_data
                ]

                message_status = MessageDeliveryStatus(
                    sent=True, delivered=True, seen_by=seen_by
                )

                detailed_message = DetailedMessageResponse(
                    message_id=message.message_id,
                    sender_id=message.sender_id,
                    content=message.content,
                    message_type=message.message_type,
                    media_url=(
                        message.media_url if hasattr(message, "media_url") else None
                    ),
                    thumbnail_url=(
                        message.thumbnail_url
                        if hasattr(message, "thumbnail_url")
                        else None
                    ),
                    created_at=message.created_at,
                    updated_at=message.updated_at,
                    deleted_at=(
                        message.deleted_at if hasattr(message, "deleted_at") else None
                    ),
                    edited=message.edited if hasattr(message, "edited") else False,
                    status=message_status,
                )
                detailed_messages.append(detailed_message)

            # Calculate pagination info
            has_more = total_messages > (offset + limit)
            next_cursor = str(messages_data[-1][0].message_id) if has_more else None

            # Get conversation type
            conv_type = (
                ConversationType.GROUP
                if len(participants_info) > 2
                else ConversationType.PRIVATE
            )

            return ConversationMessagesResponse(
                conversation_info=ConversationInfo(
                    conversation_id=conversation.conversation_id,
                    title=conversation.title,
                    type=conv_type,
                    created_at=conversation.created_at,
                    participants=participants_info,
                ),
                messages=detailed_messages,
                pagination=PaginationInfo(
                    total_messages=total_messages,
                    limit=limit,
                    offset=offset,
                    has_more=has_more,
                    next_cursor=next_cursor,
                ),
                meta={
                    "last_read_message_id": None  # You can implement this based on your needs
                },
            )

    async def delete_conversation(self, user_id: str, conversation_id: str) -> None:
        # Verify user is participant
        query = select(Participant).filter(
            Participant.conversation_id == conversation_id,
            Participant.user_id == user_id,
        )
        result = await self.db.execute(query)
        participant = result.scalar_one_or_none()

        if not participant:
            raise HTTPException(
                status_code=403, detail="User is not a participant in this conversation"
            )

        # Get conversation
        query = select(Conversation).filter(
            Conversation.conversation_id == conversation_id,
            Conversation.deleted_at.is_(None),
        )
        result = await self.db.execute(query)
        conversation = result.scalar_one_or_none()

        if not conversation:
            raise HTTPException(
                status_code=404, detail="Conversation not found or already deleted"
            )

        # Soft delete conversation
        conversation.deleted_at = func.now()

        # Add to deleted_conversations
        deleted_conversation = DeletedConversation(
            conversation_id=conversation_id, user_id=user_id
        )

        self.db.add(deleted_conversation)
        await self.db.commit()

        return conversation

    async def mark_messages_as_read(self, user_id: str, conversation_id: str) -> None:
        # Get unread messages
        query = (
            select(Message)
            .outerjoin(
                MessageStatus,
                and_(
                    Message.message_id == MessageStatus.message_id,
                    MessageStatus.user_id == user_id,
                ),
            )
            .filter(
                Message.conversation_id == conversation_id,
                Message.sender_id != user_id,
                or_(MessageStatus.is_read.is_(False), MessageStatus.is_read.is_(None)),
            )
        )
        result = await self.db.execute(query)
        unread_messages = result.scalars().all()

        # Mark messages as read
        for message in unread_messages:
            status = MessageStatus(
                message_id=message.message_id,
                user_id=user_id,
                is_read=True,
                read_at=func.now(),
            )
            self.db.add(status)

        await self.db.commit()
