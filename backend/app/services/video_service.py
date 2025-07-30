"""
Video domain services for YouTube video metadata parsing and discovery.
"""
import re
from datetime import datetime
from typing import Any, Optional
from urllib.parse import parse_qs, urlparse

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Video, VideoMetadata
from app.services.youtube_api import get_youtube_api_service


class VideoService:
    """Service for managing YouTube video metadata parsing and discovery."""

    @staticmethod
    def extract_video_id_from_url(url: str) -> Optional[str]:
        """
        Extract YouTube video ID from various URL formats.
        
        Args:
            url: YouTube video URL in various formats
            
        Returns:
            Video ID string or None if not found
        """
        patterns = [
            r"(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)",
            r"youtube\.com\/watch\?.*v=([^&\n?#]+)"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match and match.group(1):
                return match.group(1)
        
        return None

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
        pattern = r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?"
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
                upload_date = datetime.fromisoformat(
                    published_at.replace("Z", "+00:00")
                )
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
            url=url,
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
        result = await db.execute(select(Video).where(Video.youtube_id == youtube_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_videos_by_channel_id(
        db: AsyncSession, channel_id: int
    ) -> list[Video]:
        """Get all videos for a specific channel."""
        result = await db.execute(select(Video).where(Video.channel_id == channel_id))
        return list(result.scalars().all())

    @staticmethod
    async def get_all_videos(db: AsyncSession) -> list[Video]:
        """Get all videos from the database."""
        result = await db.execute(select(Video))
        return list(result.scalars().all())

    @staticmethod
    async def create_video_from_metadata(
        db: AsyncSession, video_metadata: VideoMetadata, channel_id: Optional[int] = None
    ) -> Video:
        """
        Create a new video record from YouTube metadata.

        Args:
            db: Database session
            video_metadata: Parsed video metadata from YouTube API
            channel_id: Database ID of the channel this video belongs to (optional for standalone videos)

        Returns:
            Created Video instance
        """
        # Check if video already exists
        existing_video = await VideoService.get_video_by_youtube_id(
            db, video_metadata.youtube_id
        )
        if existing_video:
            return existing_video

        # Create new video record
        video = Video(
            youtube_id=video_metadata.youtube_id,
            channel_id=channel_id,
            title=video_metadata.title,
            url=video_metadata.url,
            thumbnail_url=video_metadata.thumbnail_url,
            duration_seconds=video_metadata.duration_seconds,
            view_count=video_metadata.view_count,
            published_at=video_metadata.upload_date,
        )

        db.add(video)
        await db.commit()
        await db.refresh(video)
        return video

    @staticmethod
    async def create_video_from_url(db: AsyncSession, video_url: str) -> Video:
        """
        Create a video record from a YouTube URL by extracting metadata.
        
        Args:
            db: Database session
            video_url: YouTube video URL
            
        Returns:
            Created Video instance
            
        Raises:
            ValueError: If video ID cannot be extracted or video details cannot be fetched
        """
        # Extract video ID from URL
        video_id = VideoService.extract_video_id_from_url(video_url)
        if not video_id:
            raise ValueError(f"Could not extract video ID from URL: {video_url}")
        
        # Check if video already exists
        existing_video = await VideoService.get_video_by_youtube_id(db, video_id)
        if existing_video:
            return existing_video
        
        # Get YouTube API service and fetch video details
        youtube_service = get_youtube_api_service()
        video_details = await youtube_service.get_video_details(video_id)
        
        if not video_details:
            raise ValueError(f"Could not fetch details for video ID: {video_id}")
        
        # Parse video metadata
        video_metadata = VideoService.parse_youtube_video_data(video_details)
        
        # Create video record without channel association
        return await VideoService.create_video_from_metadata(db, video_metadata, channel_id=None)

    @staticmethod
    async def discover_videos_for_channel(
        db: AsyncSession, channel_youtube_id: str, max_results: int = 50
    ) -> list[Video]:
        """
        Discover and store new videos for a specific channel.

        Args:
            db: Database session
            channel_youtube_id: YouTube channel ID
            max_results: Maximum number of videos to discover

        Returns:
            List of newly discovered and stored Video instances
        """
        # Get YouTube API service
        youtube_service = get_youtube_api_service()

        # Fetch videos from YouTube API
        videos_response = await youtube_service.get_channel_videos(
            channel_youtube_id, max_results=max_results
        )

        if not videos_response.get("items"):
            return []

        # Get channel database ID
        from app.models import Channel

        result = await db.execute(
            select(Channel).where(Channel.youtube_id == channel_youtube_id)
        )
        channel = result.scalar_one_or_none()
        if not channel:
            raise ValueError(
                f"Channel with YouTube ID {channel_youtube_id} not found in database"
            )

        discovered_videos = []

        # Process each video from the API response
        for video_item in videos_response["items"]:
            # Extract video ID from different response formats
            video_id = None
            
            # Handle playlist item format (most common)
            if "snippet" in video_item and "resourceId" in video_item["snippet"]:
                video_id = video_item["snippet"]["resourceId"].get("videoId")
            # Handle search result format
            elif "id" in video_item and isinstance(video_item["id"], dict):
                video_id = video_item["id"].get("videoId")
            # Handle direct video ID
            elif "id" in video_item and isinstance(video_item["id"], str):
                video_id = video_item["id"]

            if not video_id:
                continue

            # Get detailed video information
            video_details = await youtube_service.get_video_details(video_id)
            if not video_details:
                continue

            # Parse video metadata
            video_metadata = VideoService.parse_youtube_video_data(video_details)

            # Create video record
            try:
                video = await VideoService.create_video_from_metadata(
                    db, video_metadata, channel_id=channel.id
                )
                discovered_videos.append(video)
            except Exception as e:
                # Log error but continue processing other videos
                import logging

                logger = logging.getLogger(__name__)
                logger.error(f"Failed to create video {video_id}: {e}")
                continue

        return discovered_videos


# Global service instance
video_service = VideoService()
