"""
YouTube Data API v3 service for channel and video information retrieval.
"""
from typing import Any

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from app.core.config import settings


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
            print(f"Error fetching channel info: {e}")
            return None

    async def get_channel_by_username(self, username: str) -> dict[str, Any] | None:
        """
        Get channel information by username (@handle).

        Args:
            username: YouTube channel username/handle

        Returns:
            Channel information dict or None if not found
        """
        try:
            request = self.youtube.channels().list(
                part="snippet,statistics,contentDetails", forUsername=username
            )
            response = request.execute()

            if response["items"]:
                return response["items"][0]
            return None
        except HttpError as e:
            print(f"Error fetching channel by username: {e}")
            return None

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
            print(f"Error fetching channel videos: {e}")
            return []

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
            print(f"Error fetching video details: {e}")
            return None

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
            print(f"Error searching channels: {e}")
            return []


# Singleton instance - initialize only when API key is available
def get_youtube_api_service() -> YouTubeAPIService:
    """Get YouTube API service instance."""
    return YouTubeAPIService()


# For backwards compatibility
youtube_api_service = None
