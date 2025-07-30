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
            # First try the new forHandle parameter (added January 2024)
            # This is the proper way to look up channels by @handle
            handle_variations = [
                f"@{username}",  # With @ prefix
                username,        # Without @ prefix
                f"@{username.lower()}",  # Lowercase with @
                username.lower()         # Lowercase without @
            ]
            
            for handle in handle_variations:
                try:
                    request = self.youtube.channels().list(
                        part="snippet,statistics,contentDetails", 
                        forHandle=handle
                    )
                    response = request.execute()
                    logger.debug(f"YouTube API forHandle response for '{handle}': {response}")

                    if response.get("items"):
                        return response["items"][0]
                except HttpError as handle_error:
                    # Log but continue to next variation
                    logger.debug(f"forHandle failed for '{handle}': {handle_error}")
                    continue
            
            # Fallback: try the legacy forUsername method (for old-style usernames)
            try:
                request = self.youtube.channels().list(
                    part="snippet,statistics,contentDetails", forUsername=username
                )
                response = request.execute()
                logger.debug(f"YouTube API forUsername response for {username}: {response}")

                if response.get("items"):
                    return response["items"][0]
            except HttpError as username_error:
                logger.debug(f"forUsername failed for '{username}': {username_error}")
            
            # Final fallback: search API with exact matching
            search_strategies = [
                f"@{username}",
                f"@{username.lower()}",
                f'"{username}"',
                username
            ]
            
            for search_query in search_strategies:
                try:
                    search_request = self.youtube.search().list(
                        part="snippet",
                        q=search_query,
                        type="channel",
                        maxResults=10
                    )
                    search_response = search_request.execute()
                    logger.debug(f"YouTube search response for '{search_query}': {search_response}")

                    # Look for exact matches in the results
                    for item in search_response.get("items", []):
                        snippet = item.get("snippet", {})
                        channel_title = snippet.get("title", "").lower()
                        custom_url = snippet.get("customUrl", "").lower()
                        
                        # Check if this is an exact match (case-insensitive)
                        if (channel_title == username.lower() or 
                            custom_url == f"@{username.lower()}" or
                            custom_url == username.lower()):
                            
                            channel_id = snippet["channelId"]
                            return await self.get_channel_info(channel_id)
                except HttpError as search_error:
                    logger.debug(f"Search failed for '{search_query}': {search_error}")
                    continue
            
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
        page_token: str | None = None,
    ) -> dict[str, Any]:
        """
        Get videos from a channel with pagination support.

        Args:
            channel_id: YouTube channel ID
            max_results: Maximum number of videos to return (max 50)
            published_after: RFC 3339 formatted date-time (optional)
            published_before: RFC 3339 formatted date-time (optional)
            page_token: Token for pagination (optional)

        Returns:
            Dict containing 'items' (list of videos) and 'nextPageToken' (if available)
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
                if page_token:
                    search_params["pageToken"] = page_token

                request = self.youtube.search().list(**search_params)
                response = request.execute()
                
                return {
                    "items": response.get("items", []),
                    "nextPageToken": response.get("nextPageToken")
                }
            else:
                # Use uploads playlist for simple listing (more efficient)
                channel_request = self.youtube.channels().list(
                    part="contentDetails", id=channel_id
                )
                channel_response = channel_request.execute()

                if not channel_response["items"]:
                    return {"items": [], "nextPageToken": None}

                uploads_playlist_id = channel_response["items"][0]["contentDetails"][
                    "relatedPlaylists"
                ]["uploads"]

                playlist_params = {
                    "part": "snippet",
                    "playlistId": uploads_playlist_id,
                    "maxResults": max_results,
                }
                
                if page_token:
                    playlist_params["pageToken"] = page_token

                playlist_request = self.youtube.playlistItems().list(**playlist_params)
                playlist_response = playlist_request.execute()

                return {
                    "items": playlist_response.get("items", []),
                    "nextPageToken": playlist_response.get("nextPageToken")
                }
        except HttpError as e:
            self._handle_http_error(e, "fetching channel videos")
            return {"items": [], "nextPageToken": None}  # This line won't be reached due to exception

    async def get_channel_uploads_playlist(self, channel_id: str) -> str | None:
        """
        Get the uploads playlist ID for a channel.
        
        Args:
            channel_id: YouTube channel ID
            
        Returns:
            Uploads playlist ID or None if not found
        """
        try:
            request = self.youtube.channels().list(
                part="contentDetails", id=channel_id
            )
            response = request.execute()
            
            if not response["items"]:
                return None
                
            uploads_playlist_id = response["items"][0]["contentDetails"][
                "relatedPlaylists"
            ]["uploads"]
            
            return uploads_playlist_id
        except HttpError as e:
            self._handle_http_error(e, "fetching channel uploads playlist")
            return None  # This line won't be reached due to exception

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
