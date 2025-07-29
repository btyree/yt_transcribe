"""
Tests for YouTube API service with mock responses.
"""
import pytest
from unittest.mock import Mock, patch, AsyncMock
from googleapiclient.errors import HttpError

from app.services.youtube_api import (
    YouTubeAPIService,
    YouTubeQuotaExceededError,
    YouTubeAccessDeniedError,
    YouTubeNotFoundError,
    YouTubeAPIError,
)


class TestYouTubeAPIService:
    """Test cases for YouTubeAPIService."""

    @pytest.fixture
    def mock_youtube_client(self):
        """Mock YouTube API client."""
        with patch('app.services.youtube_api.build') as mock_build:
            mock_client = Mock()
            mock_build.return_value = mock_client
            yield mock_client

    @pytest.fixture
    def youtube_service(self, mock_youtube_client):
        """YouTube API service instance with mocked client."""
        return YouTubeAPIService(api_key="test_api_key")

    def test_init_with_api_key(self, mock_youtube_client):
        """Test initialization with API key."""
        service = YouTubeAPIService(api_key="test_key")
        assert service.api_key == "test_key"

    def test_init_without_api_key(self):
        """Test initialization without API key raises ValueError."""
        with patch('app.services.youtube_api.settings') as mock_settings:
            mock_settings.youtube_api_key = None
            with pytest.raises(ValueError, match="YouTube API key is required"):
                YouTubeAPIService()

    @pytest.mark.asyncio
    async def test_get_channel_info_success(self, youtube_service, mock_youtube_client):
        """Test successful channel info retrieval."""
        # Mock response
        mock_response = {
            "items": [{
                "id": "UC_test_channel_id",
                "snippet": {
                    "title": "Test Channel",
                    "description": "Test description",
                    "publishedAt": "2020-01-01T00:00:00Z",
                    "thumbnails": {
                        "high": {"url": "https://example.com/thumb.jpg"}
                    },
                    "customUrl": "@testchannel"
                },
                "statistics": {
                    "subscriberCount": "1000",
                    "videoCount": "50",
                    "viewCount": "10000"
                }
            }]
        }
        
        # Setup mock
        mock_request = Mock()
        mock_request.execute.return_value = mock_response
        mock_youtube_client.channels.return_value.list.return_value = mock_request

        # Test
        result = await youtube_service.get_channel_info("UC_test_channel_id")

        # Assertions
        assert result is not None
        assert result["id"] == "UC_test_channel_id"
        assert result["snippet"]["title"] == "Test Channel"
        mock_youtube_client.channels.return_value.list.assert_called_once_with(
            part="snippet,statistics,contentDetails", id="UC_test_channel_id"
        )

    @pytest.mark.asyncio
    async def test_get_channel_info_not_found(self, youtube_service, mock_youtube_client):
        """Test channel info when channel not found."""
        # Mock empty response
        mock_response = {"items": []}
        
        mock_request = Mock()
        mock_request.execute.return_value = mock_response
        mock_youtube_client.channels.return_value.list.return_value = mock_request

        # Test
        result = await youtube_service.get_channel_info("UC_nonexistent")

        # Assertions
        assert result is None

    @pytest.mark.asyncio
    async def test_get_channel_by_username_success(self, youtube_service, mock_youtube_client):
        """Test successful channel retrieval by username using search."""
        # Mock search response
        mock_search_response = {
            "items": [{
                "snippet": {
                    "channelId": "UC_test_channel_id"
                }
            }]
        }
        
        # Mock channel info response
        mock_channel_response = {
            "items": [{
                "id": "UC_test_channel_id",
                "snippet": {
                    "title": "Test Channel",
                    "customUrl": "@testuser"
                },
                "statistics": {
                    "subscriberCount": "1000"
                }
            }]
        }

        # Setup mocks
        mock_search_request = Mock()
        mock_search_request.execute.return_value = mock_search_response
        mock_youtube_client.search.return_value.list.return_value = mock_search_request

        mock_channel_request = Mock()
        mock_channel_request.execute.return_value = mock_channel_response
        mock_youtube_client.channels.return_value.list.return_value = mock_channel_request

        # Test
        result = await youtube_service.get_channel_by_username("testuser")

        # Assertions
        assert result is not None
        assert result["id"] == "UC_test_channel_id"
        mock_youtube_client.search.return_value.list.assert_called_once_with(
            part="snippet", q="@testuser", type="channel", maxResults=1
        )

    @pytest.mark.asyncio
    async def test_get_channel_by_username_not_found(self, youtube_service, mock_youtube_client):
        """Test channel by username when not found."""
        # Mock empty responses
        mock_search_response = {"items": []}
        mock_channel_response = {"items": []}

        mock_search_request = Mock()
        mock_search_request.execute.return_value = mock_search_response
        mock_youtube_client.search.return_value.list.return_value = mock_search_request

        mock_channel_request = Mock()
        mock_channel_request.execute.return_value = mock_channel_response
        mock_youtube_client.channels.return_value.list.return_value = mock_channel_request

        # Test
        result = await youtube_service.get_channel_by_username("nonexistent")

        # Assertions
        assert result is None

    @pytest.mark.asyncio
    async def test_quota_exceeded_error(self, youtube_service, mock_youtube_client):
        """Test quota exceeded error handling."""
        # Create mock HttpError for quota exceeded
        mock_error = HttpError(
            resp=Mock(status=403),
            content=b'{"error": {"errors": [{"reason": "quotaExceeded", "message": "Quota exceeded"}]}}'
        )
        mock_error.error_details = [{"reason": "quotaExceeded", "message": "Quota exceeded"}]

        mock_request = Mock()
        mock_request.execute.side_effect = mock_error
        mock_youtube_client.channels.return_value.list.return_value = mock_request

        # Test
        with pytest.raises(YouTubeQuotaExceededError, match="quota exceeded"):
            await youtube_service.get_channel_info("UC_test")

    @pytest.mark.asyncio
    async def test_access_denied_error(self, youtube_service, mock_youtube_client):
        """Test access denied error handling."""
        # Create mock HttpError for access denied
        mock_error = HttpError(
            resp=Mock(status=403),
            content=b'{"error": {"errors": [{"reason": "forbidden", "message": "Access denied"}]}}'
        )
        mock_error.error_details = [{"reason": "forbidden", "message": "Access denied"}]

        mock_request = Mock()
        mock_request.execute.side_effect = mock_error
        mock_youtube_client.channels.return_value.list.return_value = mock_request

        # Test
        with pytest.raises(YouTubeAccessDeniedError, match="access denied"):
            await youtube_service.get_channel_info("UC_test")

    @pytest.mark.asyncio
    async def test_not_found_error(self, youtube_service, mock_youtube_client):
        """Test not found error handling."""
        # Create mock HttpError for not found
        mock_error = HttpError(
            resp=Mock(status=404),
            content=b'{"error": {"errors": [{"reason": "notFound", "message": "Not found"}]}}'
        )
        mock_error.error_details = [{"reason": "notFound", "message": "Not found"}]

        mock_request = Mock()
        mock_request.execute.side_effect = mock_error
        mock_youtube_client.channels.return_value.list.return_value = mock_request

        # Test
        with pytest.raises(YouTubeNotFoundError, match="not found"):
            await youtube_service.get_channel_info("UC_test")

    @pytest.mark.asyncio
    async def test_generic_api_error(self, youtube_service, mock_youtube_client):
        """Test generic API error handling."""
        # Create mock HttpError for generic error
        mock_error = HttpError(
            resp=Mock(status=500),
            content=b'{"error": {"message": "Internal server error"}}'
        )
        mock_error.error_details = []

        mock_request = Mock()
        mock_request.execute.side_effect = mock_error
        mock_youtube_client.channels.return_value.list.return_value = mock_request

        # Test
        with pytest.raises(YouTubeAPIError, match="YouTube API error"):
            await youtube_service.get_channel_info("UC_test")

    @pytest.mark.asyncio
    async def test_get_channel_videos_success(self, youtube_service, mock_youtube_client):
        """Test successful channel videos retrieval."""
        # Mock channel content details response
        mock_channel_response = {
            "items": [{
                "contentDetails": {
                    "relatedPlaylists": {
                        "uploads": "UU_test_playlist_id"
                    }
                }
            }]
        }

        # Mock playlist items response
        mock_playlist_response = {
            "items": [{
                "snippet": {
                    "title": "Test Video",
                    "publishedAt": "2023-01-01T00:00:00Z",
                    "resourceId": {
                        "videoId": "test_video_id"
                    }
                }
            }]
        }

        # Setup mocks
        mock_channel_request = Mock()
        mock_channel_request.execute.return_value = mock_channel_response
        mock_youtube_client.channels.return_value.list.return_value = mock_channel_request

        mock_playlist_request = Mock()
        mock_playlist_request.execute.return_value = mock_playlist_response
        mock_youtube_client.playlistItems.return_value.list.return_value = mock_playlist_request

        # Test
        result = await youtube_service.get_channel_videos("UC_test_channel_id")

        # Assertions
        assert len(result["items"]) == 1
        assert result["items"][0]["snippet"]["title"] == "Test Video"

    @pytest.mark.asyncio
    async def test_get_video_details_success(self, youtube_service, mock_youtube_client):
        """Test successful video details retrieval."""
        # Mock response
        mock_response = {
            "items": [{
                "id": "test_video_id",
                "snippet": {
                    "title": "Test Video",
                    "description": "Test description"
                },
                "statistics": {
                    "viewCount": "1000",
                    "likeCount": "100"
                }
            }]
        }

        mock_request = Mock()
        mock_request.execute.return_value = mock_response
        mock_youtube_client.videos.return_value.list.return_value = mock_request

        # Test
        result = await youtube_service.get_video_details("test_video_id")

        # Assertions
        assert result is not None
        assert result["id"] == "test_video_id"
        assert result["snippet"]["title"] == "Test Video"

    @pytest.mark.asyncio
    async def test_search_channels_success(self, youtube_service, mock_youtube_client):
        """Test successful channel search."""
        # Mock response
        mock_response = {
            "items": [{
                "snippet": {
                    "channelId": "UC_test_channel",
                    "title": "Test Channel",
                    "description": "Test description"
                }
            }]
        }

        mock_request = Mock()
        mock_request.execute.return_value = mock_response
        mock_youtube_client.search.return_value.list.return_value = mock_request

        # Test
        result = await youtube_service.search_channels("test query")

        # Assertions
        assert len(result) == 1
        assert result[0]["snippet"]["title"] == "Test Channel"
        mock_youtube_client.search.return_value.list.assert_called_once_with(
            part="snippet", q="test query", type="channel", maxResults=10
        )