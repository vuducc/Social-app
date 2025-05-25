from pydantic import BaseModel


class LikeResponse(BaseModel):
    message: str
    is_liked: bool
    likes_count: int
