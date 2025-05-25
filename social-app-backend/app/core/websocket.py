import logging
from typing import Dict, Optional, Set

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # Store active connections: user_id -> Set[WebSocket]
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Store conversation connections: conversation_id -> Set[user_id]
        self.conversation_members: Dict[str, Set[str]] = {}
        # Store user status: user_id -> bool
        self.user_status: Dict[str, bool] = {}
        # Store typing status: conversation_id -> Set[user_id]
        self.typing_status: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, user_id: str) -> None:
        try:
            await websocket.accept()
            if user_id not in self.active_connections:
                self.active_connections[user_id] = set()
            self.active_connections[user_id].add(websocket)
            self.user_status[user_id] = True

            # Broadcast user online status
            await self.broadcast_user_status(user_id, True)
            logger.info(
                f"User {user_id} connected. Total users: {len(self.active_connections)}"
            )
        except Exception as e:
            logger.error(f"Error connecting user {user_id}: {str(e)}")
            raise

    async def disconnect(self, websocket: WebSocket, user_id: str) -> None:
        try:
            if user_id in self.active_connections:
                self.active_connections[user_id].remove(websocket)
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
                    self.user_status[user_id] = False

                    # Cleanup user from all conversations
                    for conv_id in list(self.conversation_members.keys()):
                        if user_id in self.conversation_members[conv_id]:
                            self.conversation_members[conv_id].remove(user_id)
                            if not self.conversation_members[conv_id]:
                                del self.conversation_members[conv_id]

                    # Cleanup typing status
                    for conv_id in list(self.typing_status.keys()):
                        if user_id in self.typing_status[conv_id]:
                            self.typing_status[conv_id].remove(user_id)
                            if not self.typing_status[conv_id]:
                                del self.typing_status[conv_id]

                    # Broadcast user offline status
                    await self.broadcast_user_status(user_id, False)
                    logger.info(
                        f"User {user_id} disconnected. Total users: {len(self.active_connections)}"
                    )
        except Exception as e:
            logger.error(f"Error disconnecting user {user_id}: {str(e)}")
            raise

    async def join_conversation(self, conversation_id: str, user_id: str) -> None:
        if conversation_id not in self.conversation_members:
            self.conversation_members[conversation_id] = set()
        self.conversation_members[conversation_id].add(user_id)
        logger.info(f"User {user_id} joined conversation {conversation_id}")

    async def leave_conversation(self, conversation_id: str, user_id: str) -> None:
        if conversation_id in self.conversation_members:
            self.conversation_members[conversation_id].discard(user_id)
            if not self.conversation_members[conversation_id]:
                del self.conversation_members[conversation_id]
            logger.info(f"User {user_id} left conversation {conversation_id}")

    async def send_personal_message(self, message: dict, user_id: str) -> None:
        if user_id in self.active_connections:
            failed_connections = set()
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to user {user_id}: {str(e)}")
                    failed_connections.add(connection)

            # Remove failed connections
            for failed in failed_connections:
                self.active_connections[user_id].remove(failed)

    async def broadcast_to_conversation(
        self, conversation_id: str, message: dict, exclude_user: Optional[str] = None
    ) -> None:
        if conversation_id in self.conversation_members:
            for user_id in self.conversation_members[conversation_id]:
                if user_id != exclude_user:
                    await self.send_personal_message(message, user_id)

    async def broadcast_user_status(self, user_id: str, is_online: bool) -> None:
        message = {"type": "user_status", "user_id": user_id, "is_online": is_online}
        for other_user_id in self.active_connections:
            if other_user_id != user_id:
                await self.send_personal_message(message, other_user_id)

    async def broadcast_typing_status(
        self, conversation_id: str, user_id: str, is_typing: bool
    ) -> None:
        try:
            if is_typing:
                if conversation_id not in self.typing_status:
                    self.typing_status[conversation_id] = set()
                self.typing_status[conversation_id].add(user_id)
            else:
                if conversation_id in self.typing_status:
                    self.typing_status[conversation_id].discard(user_id)
                    if not self.typing_status[conversation_id]:
                        del self.typing_status[conversation_id]

            message = {
                "type": "typing_status",
                "conversation_id": conversation_id,
                "user_id": user_id,
                "is_typing": is_typing,
            }
            await self.broadcast_to_conversation(conversation_id, message, user_id)
        except Exception as e:
            logger.error(f"Error broadcasting typing status: {str(e)}")


manager = ConnectionManager()
