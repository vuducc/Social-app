from datetime import timedelta
from typing import List

from redis.asyncio import Redis


class UserStatusService:
    def __init__(self, redis_client: Redis):
        self.redis = redis_client
        self.online_key_prefix = "user:online:"
        self.expiry = timedelta(minutes=5)

    async def set_user_online(self, user_id: str):
        key = f"{self.online_key_prefix}{user_id}"
        await self.redis.setex(key, self.expiry, "1")

    async def is_user_online(self, user_id: str) -> bool:
        key = f"{self.online_key_prefix}{user_id}"
        return bool(await self.redis.exists(key))

    async def set_user_offline(self, user_id: str):
        key = f"{self.online_key_prefix}{user_id}"
        await self.redis.delete(key)

    async def get_all_online_users(self) -> List[str]:
        keys = await self.redis.keys(f"{self.online_key_prefix}*")
        return [key.split(":")[-1] for key in keys]
