"""
Video domain services for YouTube video metadata parsing and discovery.
"""
import re
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.videos.models import Video, VideoMetadata


class VideoService:
    """Service for managing YouTube video metadata parsing and discovery."""

    @staticmethod
    def parse_duration_string(duration: str) -> Optional[int]:
        """
        Parse YouTube ISO 8601 duration string to seconds.
        
        Args:
            duration: Duration string in ISO 8601 format (e.g., 'PT4M13S', 'PT1H30M5S')
            
        Returns:
            Duration in seconds or None if parsing fails
        """
        if not duration:
            return None
            
        # Match ISO 8601 duration format PT[hours]H[minutes]M[seconds]S
        pattern = r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?'
        match = re.match(pattern, duration)
        
        if not match:
            return None
            
        hours, minutes, seconds = match.groups()
        
        total_seconds = 0
        if hours:
            total_seconds += int(hours) * 3600
        if minutes:
            total_seconds += int(minutes) * 60
        if seconds:
            total_seconds += int(seconds)
            
        return total_seconds

    @staticmethod
    def parse_youtube_video_data(video_data: dict[str, Any]) -> VideoMetadata:
        """
        Parse YouTube API video data into VideoMetadata model.
        
        Args:
            video_data: Raw video data from YouTube API
            
        Returns:
            VideoMetadata instance with parsed data
        """
        snippet = video_data.get("snippet", {})
        statistics = video_data.get("statistics", {})
        content_details = video_data.get("contentDetails", {})
        
        # Parse upload date
        upload_date = None
        published_at = snippet.get("publishedAt")
        if published_at:
            try:
                upload_date = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                pass
        
        # Parse duration
        duration_seconds = None
        duration_string = content_details.get("duration")
        if duration_string:
            duration_seconds = VideoService.parse_duration_string(duration_string)
        
        # Parse view count
        view_count = None
        view_count_str = statistics.get("viewCount")
        if view_count_str:
            try:
                view_count = int(view_count_str)
            except (ValueError, TypeError):
                pass
        
        # Extract thumbnail URL (prefer high quality)
        thumbnails = snippet.get("thumbnails", {})
        thumbnail_url = None
        for quality in ["maxres", "high", "medium", "default"]:
            if quality in thumbnails:
                thumbnail_url = thumbnails[quality].get("url")
                break
        
        # Build video URL
        youtube_id = video_data.get("id", "")
        url = f"https://www.youtube.com/watch?v={youtube_id}"
        
        return VideoMetadata(
            youtube_id=youtube_id,
            title=snippet.get("title", ""),
            duration_seconds=duration_seconds,
            upload_date=upload_date,
            view_count=view_count,
            thumbnail_url=thumbnail_url,
            url=url
        )

    @staticmethod
    async def get_video_by_id(db: AsyncSession, video_id: int) -> Optional[Video]:
        """Get video by database ID."""
        result = await db.execute(select(Video).where(Video.id == video_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_video_by_youtube_id(
        db: AsyncSession, youtube_id: str
    ) -> Optional[Video]:
        """Get video by YouTube video ID."""
        result = await db.execute(
            select(Video).where(Video.youtube_id == youtube_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_videos_by_channel_id(
        db: AsyncSession, channel_id: int
    ) -> list[Video]:
        """Get all videos for a specific channel."""
        result = await db.execute(
            select(Video).where(Video.channel_id == channel_id)
        )
        return list(result.scalars().all())


# Global service instance
video_service = VideoService()