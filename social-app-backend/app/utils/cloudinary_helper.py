import asyncio
import logging
import uuid
from functools import partial
from typing import List
from urllib.parse import urlparse

from cloudinary import CloudinaryImage, api
from cloudinary.uploader import destroy, upload
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)


def generate_post_url(user_id: str, post_id: str) -> str:
    random_filename = uuid.uuid4().hex
    return f"social_media_app/{user_id}/posts/{post_id}/{random_filename}"


def generate_profile_url(user_id: str) -> str:
    random_filename = uuid.uuid4().hex
    return f"social_media_app/{user_id}/profile/{random_filename}"


async def upload_single_post_image(
    file_content: bytes, user_id: str, post_id: str
) -> str:
    try:
        public_id = generate_post_url(user_id, post_id)
        # Run upload in executor to avoid blocking
        upload_result = await asyncio.get_event_loop().run_in_executor(
            None, partial(upload, file_content, public_id=public_id)
        )
        return upload_result["secure_url"]
    except Exception as e:
        logger.error(f"Error uploading image to cloudinary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error uploading image",
        )


async def upload_profile_image(file_content: bytes, user_id: str) -> str:
    try:
        public_id = generate_profile_url(user_id)
        upload_result = await asyncio.get_event_loop().run_in_executor(
            None, partial(upload, file_content, public_id=public_id)
        )
        return upload_result["secure_url"]
    except Exception as e:
        logger.error(f"Error uploading image to cloudinary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error uploading image",
        )


async def upload_multiple_images(
    files: List[bytes], user_id: str, post_id: str
) -> List[str]:
    try:
        tasks = [
            upload_single_post_image(file_content, user_id, post_id)
            for file_content in files
        ]
        return await asyncio.gather(*tasks)
    except Exception as e:
        logger.error(f"Error uploading multiple images: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error uploading multiple images",
        )


def delete_post_images_from_cloudinary(user_id: str, post_id: str) -> None:
    try:
        folder_path = f"social_media_app/{user_id}/posts/{post_id}"
        api.delete_resources_by_prefix(folder_path)
        api.delete_folder(folder_path)
    except Exception as e:
        logger.error(f"Error deleting post images from cloudinary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting post images",
        )


def delete_single_image_from_cloudinary(image_url: str) -> None:
    try:
        parsed_url = urlparse(image_url)
        path_parts = parsed_url.path.split("/")
        public_id = "/".join(path_parts[path_parts.index("upload") + 1 :]).split(".")[0]
        destroy(public_id)
    except Exception as e:
        logger.error(f"Error deleting single image from cloudinary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting single image",
        )


def get_cloudinary_url(public_id: str) -> str:
    try:
        return CloudinaryImage(public_id).build_url()
    except Exception as e:
        logger.error(f"Error getting cloudinary url: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error getting cloudinary url",
        )


def upload_image(file_content: bytes, user_id: str, post_id: str) -> str:
    try:
        public_id = generate_post_url(user_id, post_id)
        upload_result = upload(file_content, public_id=public_id)
        return CloudinaryImage(public_id).build_url()
    except Exception as e:
        logger.error(f"Error uploading image: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error uploading image",
        )
