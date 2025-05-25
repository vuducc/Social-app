import redis

redis_client = redis.StrictRedis(
    host="localhost", port=6379, db=0, decode_responses=True
)


def add_token_to_blacklist(token: str):
    redis_client.set(f"blacklist:{token}", "true")


def is_token_blacklisted(token: str) -> bool:
    return redis_client.exists(f"blacklist:{token}") == 1
