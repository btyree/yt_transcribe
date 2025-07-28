"""
YouTube Data API v3 service for channel and video information retrieval.
"""
import logging
from typing import Any

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from app.core.config import settings

logger = logging.getLogger(__name__)


class YouTubeAPIError(Exception):
    """Base exception for YouTube API errors."""

    pass


class YouTubeQuotaExceededError(YouTubeAPIError):
    """Raised when YouTube API quota is exceeded."""

    pass


class YouTubeAccessDeniedError(YouTubeAPIError):
    """Raised when YouTube API access is denied."""

    pass


class YouTubeNotFoundError(YouTubeAPIError):
    """Raised when requested YouTube resource is not found."""

    pass


class YouTubeAPIService:
    """Service for interacting with YouTube Data API v3."""

    def __init__(self, api_key: str | None = None):
        """
        Initialize YouTube API service.

        Args:
            api_key: YouTube Data API v3 key. If None, uses from settings.
        """
        self.api_key = api_key or settings.youtube_api_key
        if not self.api_key:
            raise ValueError("YouTube API key is required")

        self.youtube = build("youtube", "v3", developerKey=self.api_key)

    def _handle_http_error(self, error: HttpError, operation: str) -> None:
        """
        Handle HTTP errors from YouTube API and raise appropriate exceptions.

        Args:
            error: The HttpError from the YouTube API
            operation: Description of the operation that failed
        """
        error_details = error.error_details if hasattr(error, 'error_details') else []
        error_code = error.resp.status if hasattr(error, 'resp') else None
        
        logger.error(f"YouTube API error during {operation}: {error}")
        
        # Check for specific error reasons in error details
        for detail in error_details:
            reason = detail.get('reason', '').lower()
            if reason in ['quotaexceeded', 'dailylimitexceeded', 'usageratelimitexceeded']:
                raise YouTubeQuotaExceededError(f"YouTube API quota exceeded during {operation}: {detail.get('message', '')}")
            elif reason in ['forbidden', 'accessnotconfigured']:
                raise YouTubeAccessDeniedError(f"YouTube API access denied during {operation}: {detail.get('message', '')}")
            elif reason in ['notfound', 'videonotfound', 'channelnotfound']:
                raise YouTubeNotFoundError(f"YouTube resource not found during {operation}: {detail.get('message', '')}")
        
        # Fallback to HTTP status codes
        if error_code == 403:
            if 'quota' in str(error).lower():
                raise YouTubeQuotaExceededError(f"YouTube API quota exceeded during {operation}")
            else:
                raise YouTubeAccessDeniedError(f"YouTube API access denied during {operation}")
        elif error_code == 404:
            raise YouTubeNotFoundError(f"YouTube resource not found during {operation}")
        
        # Generic error for other cases
        raise YouTubeAPIError(f"YouTube API error during {operation}: {error}")

    async def get_channel_info(self, channel_id: str) -> dict[str, Any] | None:
        """
        Get channel information by channel ID.

        Args:
            channel_id: YouTube channel ID

        Returns:
            Channel information dict or None if not found
        """
        try:
            request = self.youtube.channels().list(
                part="snippet,statistics,contentDetails", id=channel_id
            )
            response = request.execute()

            if response["items"]:
                return response["items"][0]
            return None
        except HttpError as e:
            self._handle_http_error(e, "fetching channel info")
            return None  # This line won't be reached due to exception

    async def get_channel_by_username(self, username: str) -> dict[str, Any] | None:
        """
        Get channel information by username (@handle).

        Args:
            username: YouTube channel username/handle

        Returns:
            Channel information dict or None if not found
        """
        try:
            # First try to search for the channel by name
            search_request = self.youtube.search().list(
                part="snippet",
                q=f"@{username}",
                type="channel",
                maxResults=1
            )
            search_response = search_request.execute()
            logger.debug(f"YouTube search response for @{username}: {search_response}")

            if search_response.get("items"):
                channel_id = search_response["items"][0]["snippet"]["channelId"]
                # Now get the full channel info
                return await self.get_channel_info(channel_id)
            
            # Fallback to the old forUsername method
            request = self.youtube.channels().list(
                part="snippet,statistics,contentDetails", forUsername=username
            )
            response = request.execute()
            logger.debug(f"YouTube API response for username {username}: {response}")

            if response.get("items"):
                return response["items"][0]
            return None
        except HttpError as e:
            self._handle_http_error(e, "fetching channel by username")
            return None  # This line won't be reached due to exception

    async def get_channel_videos(
        self,
        channel_id: str,
        max_results: int = 50,
        published_after: str | None = None,
        published_before: str | None = None,
    ) -> list[dict[str, Any]]:
        """
        Get videos from a channel.

        Args:
            channel_id: YouTube channel ID
            max_results: Maximum number of videos to return
            published_after: RFC 3339 formatted date-time (optional)
            published_before: RFC 3339 formatted date-time (optional)

        Returns:
            List of video information dicts
        """
        try:
            # Use search API for date filtering, otherwise use playlist
            if published_after or published_before:
                # Use search endpoint for date filtering
                search_params = {
                    "part": "snippet",
                    "channelId": channel_id,
                    "type": "video",
                    "order": "date",
                    "maxResults": max_results,
                }

                if published_after:
                    search_params["publishedAfter"] = published_after
                if published_before:
                    search_params["publishedBefore"] = published_before

                request = self.youtube.search().list(**search_params)
                response = request.execute()
                return response.get("items", [])
            else:
                # Use uploads playlist for simple listing (more efficient)
                channel_request = self.youtube.channels().list(
                    part="contentDetails", id=channel_id
                )
                channel_response = channel_request.execute()

                if not channel_response["items"]:
                    return []

                uploads_playlist_id = channel_response["items"][0]["contentDetails"][
                    "relatedPlaylists"
                ]["uploads"]

                playlist_request = self.youtube.playlistItems().list(
                    part="snippet",
                    playlistId=uploads_playlist_id,
                    maxResults=max_results,
                )
                playlist_response = playlist_request.execute()

                return playlist_response.get("items", [])
        except HttpError as e:
            self._handle_http_error(e, "fetching channel videos")
            return []  # This line won't be reached due to exception

    async def get_video_details(self, video_id: str) -> dict[str, Any] | None:
        """
        Get detailed video information.

        Args:
            video_id: YouTube video ID

        Returns:
            Video details dict or None if not found
        """
        try:
            request = self.youtube.videos().list(
                part="snippet,statistics,contentDetails", id=video_id
            )
            response = request.execute()

            if response["items"]:
                return response["items"][0]
            return None
        except HttpError as e:
            self._handle_http_error(e, "fetching video details")
            return None  # This line won't be reached due to exception

    async def search_channels(
        self, query: str, max_results: int = 10
    ) -> list[dict[str, Any]]:
        """
        Search for channels by query.

        Args:
            query: Search query
            max_results: Maximum number of results

        Returns:
            List of channel search results
        """
        try:
            request = self.youtube.search().list(
                part="snippet", q=query, type="channel", maxResults=max_results
            )
            response = request.execute()

            return response.get("items", [])
        except HttpError as e:
            self._handle_http_error(e, "searching channels")
            return []  # This line won't be reached due to exception


# Singleton instance - initialize only when API key is available
def get_youtube_api_service() -> YouTubeAPIService:
    """Get YouTube API service instance."""
    return YouTubeAPIService()


# For backwards compatibility
youtube_api_service = None
