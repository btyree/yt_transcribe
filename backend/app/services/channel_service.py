"""
Channel domain services for YouTube channel management.
"""
import re
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Channel


class YouTubeUrlValidator:
    """Validates and normalizes YouTube channel URLs."""

    # Regex patterns for different YouTube URL formats
    PATTERNS = {
        "username": re.compile(
            r"^https?://(?:www\.)?youtube\.com/@([a-zA-Z0-9_-]+)/?$"
        ),
        "channel_id": re.compile(
            r"^https?://(?:www\.)?youtube\.com/channel/([a-zA-Z0-9_-]+)/?$"
        ),
        "c_format": re.compile(
            r"^https?://(?:www\.)?youtube\.com/c/([a-zA-Z0-9_-]+)/?$"
        ),
        "user_format": re.compile(
            r"^https?://(?:www\.)?youtube\.com/user/([a-zA-Z0-9_-]+)/?$"
        ),
    }

    @classmethod
    def validate_url(cls, url: str) -> dict[str, str]:
        """
        Validate YouTube channel URL and extract identifier.

        Args:
            url: YouTube channel URL to validate

        Returns:
            Dict with 'type' and 'identifier' keys

        Raises:
            ValueError: If URL format is not supported
        """
        url = url.strip()

        for url_type, pattern in cls.PATTERNS.items():
            match = pattern.match(url)
            if match:
                return {
                    "type": url_type,
                    "identifier": match.group(1),
                    "original_url": url,
                }

        raise ValueError(f"Unsupported YouTube URL format: {url}")

    @classmethod
    def normalize_url(cls, url: str) -> str:
        """Normalize YouTube URL to standard format."""
        validation_result = cls.validate_url(url)
        identifier = validation_result["identifier"]
        url_type = validation_result["type"]

        # Convert all formats to standard format
        if url_type == "username":
            return f"https://www.youtube.com/@{identifier}"
        elif url_type == "channel_id":
            return f"https://www.youtube.com/channel/{identifier}"
        elif url_type == "c_format":
            return f"https://www.youtube.com/c/{identifier}"
        elif url_type == "user_format":
            return f"https://www.youtube.com/user/{identifier}"

        return url


class ChannelService:
    """Service for managing YouTube channels."""

    @staticmethod
    async def validate_channel_url(url: str) -> dict[str, Any]:
        """
        Validate YouTube channel URL format.

        Args:
            url: YouTube channel URL to validate

        Returns:
            Dict with validation result and normalized URL

        Raises:
            ValueError: If URL format is invalid
        """
        try:
            validation_result = YouTubeUrlValidator.validate_url(url)
            normalized_url = YouTubeUrlValidator.normalize_url(url)

            return {
                "is_valid": True,
                "type": validation_result["type"],
                "identifier": validation_result["identifier"],
                "original_url": url,
                "normalized_url": normalized_url,
                "message": "Valid YouTube channel URL",
            }
        except ValueError as e:
            return {
                "is_valid": False,
                "error": str(e),
                "original_url": url,
                "message": "Invalid YouTube channel URL format",
            }

    @staticmethod
    async def get_channel_by_id(db: AsyncSession, channel_id: int) -> Optional[Channel]:
        """Get channel by database ID."""
        result = await db.execute(select(Channel).where(Channel.id == channel_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_channel_by_youtube_id(
        db: AsyncSession, youtube_id: str
    ) -> Optional[Channel]:
        """Get channel by YouTube channel ID."""
        result = await db.execute(
            select(Channel).where(Channel.youtube_id == youtube_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all_channels(db: AsyncSession) -> list[Channel]:
        """Get all channels from database."""
        result = await db.execute(select(Channel))
        return list(result.scalars().all())

    @staticmethod
    async def delete_channel(db: AsyncSession, channel: Channel) -> None:
        """
        Delete channel and all associated data.

        Args:
            db: Database session
            channel: Channel to delete
        """
        from app.models import Video, TranscriptionJob
        
        # Delete all transcription jobs for videos in this channel
        transcription_jobs_result = await db.execute(
            select(TranscriptionJob).join(Video).where(Video.channel_id == channel.id)
        )
        transcription_jobs = transcription_jobs_result.scalars().all()
        for job in transcription_jobs:
            await db.delete(job)
        
        # Delete all videos in this channel
        videos_result = await db.execute(select(Video).where(Video.channel_id == channel.id))
        videos = videos_result.scalars().all()
        for video in videos:
            await db.delete(video)
        
        # Finally delete the channel
        await db.delete(channel)
        await db.commit()


# Global service instance
channel_service = ChannelService()
