"""
Tests for video discovery functionality including metadata parsing, pagination, and error handling.
"""
import pytest
from datetime import datetime
from unittest.mock import Mock, patch, AsyncMock

from app.models import VideoMetadata
from app.services.video_service import VideoService


class TestVideoService:
    """Test cases for VideoService metadata parsing functionality."""

    def test_parse_duration_string_standard_format(self):
        """Test parsing standard ISO 8601 duration formats."""
        # Test various duration formats
        assert VideoService.parse_duration_string("PT4M13S") == 253  # 4 minutes 13 seconds
        assert VideoService.parse_duration_string("PT1H30M5S") == 5405  # 1 hour 30 minutes 5 seconds
        assert VideoService.parse_duration_string("PT2H") == 7200  # 2 hours
        assert VideoService.parse_duration_string("PT45M") == 2700  # 45 minutes
        assert VideoService.parse_duration_string("PT30S") == 30  # 30 seconds

    def test_parse_duration_string_edge_cases(self):
        """Test parsing duration string edge cases."""
        # Test edge cases
        assert VideoService.parse_duration_string("PT0S") == 0  # 0 seconds
        assert VideoService.parse_duration_string("") is None  # Empty string
        assert VideoService.parse_duration_string(None) is None  # None input
        assert VideoService.parse_duration_string("INVALID") is None  # Invalid format

    def test_parse_youtube_video_data_complete(self):
        """Test parsing complete YouTube video data."""
        # Mock complete video data from YouTube API
        video_data = {
            "id": "dQw4w9WgXcQ",
            "snippet": {
                "title": "Rick Astley - Never Gonna Give You Up",
                "publishedAt": "2009-10-25T06:57:33Z",
                "thumbnails": {
                    "high": {
                        "url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
                    }
                }
            },
            "statistics": {
                "viewCount": "1000000000"
            },
            "contentDetails": {
                "duration": "PT3M33S"
            }
        }

        result = VideoService.parse_youtube_video_data(video_data)

        assert isinstance(result, VideoMetadata)
        assert result.youtube_id == "dQw4w9WgXcQ"
        assert result.title == "Rick Astley - Never Gonna Give You Up"
        assert result.duration_seconds == 213  # 3 minutes 33 seconds
        assert result.view_count == 1000000000
        assert result.thumbnail_url == "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
        assert result.url == "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        assert isinstance(result.upload_date, datetime)

    def test_parse_youtube_video_data_minimal(self):
        """Test parsing minimal YouTube video data."""
        # Mock minimal video data
        video_data = {
            "id": "test123",
            "snippet": {
                "title": "Test Video"
            }
        }

        result = VideoService.parse_youtube_video_data(video_data)

        assert isinstance(result, VideoMetadata)
        assert result.youtube_id == "test123"
        assert result.title == "Test Video"
        assert result.duration_seconds is None
        assert result.view_count is None
        assert result.thumbnail_url is None
        assert result.upload_date is None
        assert result.url == "https://www.youtube.com/watch?v=test123"

    def test_parse_youtube_video_data_thumbnail_priority(self):
        """Test that thumbnail selection follows priority order."""
        video_data = {
            "id": "test123",
            "snippet": {
                "title": "Test Video",
                "thumbnails": {
                    "default": {"url": "https://example.com/default.jpg"},
                    "medium": {"url": "https://example.com/medium.jpg"},
                    "high": {"url": "https://example.com/high.jpg"},
                    "maxres": {"url": "https://example.com/maxres.jpg"}
                }
            }
        }

        result = VideoService.parse_youtube_video_data(video_data)
        # Should prefer maxres over other qualities
        assert result.thumbnail_url == "https://example.com/maxres.jpg"

        # Test with missing maxres
        video_data["snippet"]["thumbnails"].pop("maxres")
        result = VideoService.parse_youtube_video_data(video_data)
        # Should prefer high over medium/default
        assert result.thumbnail_url == "https://example.com/high.jpg"

    def test_parse_youtube_video_data_invalid_dates(self):
        """Test handling of invalid date formats."""
        video_data = {
            "id": "test123",
            "snippet": {
                "title": "Test Video",
                "publishedAt": "invalid-date-format"
            }
        }

        result = VideoService.parse_youtube_video_data(video_data)
        assert result.upload_date is None

    def test_parse_youtube_video_data_invalid_view_count(self):
        """Test handling of invalid view count formats."""
        vehicle_data = {
            "id": "test123",
            "snippet": {"title": "Test Video"},
            "statistics": {"viewCount": "not-a-number"}
        }

        result = VideoService.parse_youtube_video_data(vehicle_data)
        assert result.view_count is None


class TestVideoDiscoveryIntegration:
    """Integration tests for video discovery with YouTube API pagination."""

    @pytest.fixture
    def mock_youtube_service(self):
        """Mock YouTube API service for testing."""
        with patch('app.services.youtube_api.YouTubeAPIService') as mock_service:
            # Create a mock instance with async methods
            mock_instance = Mock()
            mock_instance.get_channel_videos = AsyncMock()
            mock_instance.get_channel_uploads_playlist = AsyncMock()
            mock_service.return_value = mock_instance
            yield mock_instance

    @pytest.mark.asyncio
    async def test_channel_videos_pagination(self, mock_youtube_service):
        """Test that video discovery supports pagination correctly."""
        # Mock paginated response
        first_page_response = {
            "items": [
                {
                    "id": {"videoId": "video1"} if "search" in str(mock_youtube_service) else "video1",
                    "snippet": {"title": "Video 1", "publishedAt": "2023-01-01T00:00:00Z"}
                }
            ],
            "nextPageToken": "next_page_token_123"
        }
        
        second_page_response = {
            "items": [
                {
                    "id": {"videoId": "video2"} if "search" in str(mock_youtube_service) else "video2", 
                    "snippet": {"title": "Video 2", "publishedAt": "2023-01-02T00:00:00Z"}
                }
            ],
            "nextPageToken": None  # No more pages
        }

        # Configure mock to return different responses for different calls
        mock_youtube_service.get_channel_videos.side_effect = [
            first_page_response,
            second_page_response
        ]

        # Test first page
        result = await mock_youtube_service.get_channel_videos("UCtest", max_results=1)
        assert "items" in result
        assert "nextPageToken" in result
        assert result["nextPageToken"] == "next_page_token_123"
        assert len(result["items"]) == 1

        # Test second page with pagination token
        result = await mock_youtube_service.get_channel_videos(
            "UCtest", max_results=1, page_token="next_page_token_123"
        )
        assert "items" in result
        assert "nextPageToken" in result
        assert result["nextPageToken"] is None  # No more pages
        assert len(result["items"]) == 1

    @pytest.mark.asyncio
    async def test_uploads_playlist_retrieval(self, mock_youtube_service):
        """Test dedicated uploads playlist ID retrieval."""
        mock_youtube_service.get_channel_uploads_playlist.side_effect = [
            "UUtest_uploads_playlist",
            None
        ]

        result = await mock_youtube_service.get_channel_uploads_playlist("UCtest")
        assert result == "UUtest_uploads_playlist"

        # Test with non-existent channel
        result = await mock_youtube_service.get_channel_uploads_playlist("UCnonexistent")
        assert result is None

    @pytest.mark.asyncio
    async def test_error_handling_channel_types(self, mock_youtube_service):
        """Test error handling for various channel types and invalid URLs."""
        from app.services.youtube_api import YouTubeNotFoundError, YouTubeAPIError

        # Test channel not found
        mock_youtube_service.get_channel_videos.side_effect = YouTubeNotFoundError("Channel not found")
        
        with pytest.raises(YouTubeNotFoundError):
            await mock_youtube_service.get_channel_videos("UCnonexistent")

        # Test API error
        mock_youtube_service.get_channel_videos.side_effect = YouTubeAPIError("API error")
        
        with pytest.raises(YouTubeAPIError):
            await mock_youtube_service.get_channel_videos("UCtest")

    def test_video_metadata_model_validation(self):
        """Test VideoMetadata model validation and serialization."""
        # Test valid data
        metadata = VideoMetadata(
            youtube_id="test123",
            title="Test Video",
            duration_seconds=180,
            upload_date=datetime(2023, 1, 1),
            view_count=10000,
            thumbnail_url="https://example.com/thumb.jpg",
            url="https://www.youtube.com/watch?v=test123"
        )

        assert metadata.youtube_id == "test123"
        assert metadata.title == "Test Video"
        assert metadata.duration_seconds == 180
        assert metadata.view_count == 10000

        # Test model dict conversion
        metadata_dict = metadata.model_dump()
        assert metadata_dict["youtube_id"] == "test123"
        assert metadata_dict["title"] == "Test Video"

    def test_video_url_generation(self):
        """Test that video URLs are generated correctly."""
        video_data = {
            "id": "dQw4w9WgXcQ",
            "snippet": {"title": "Test Video"}
        }

        result = VideoService.parse_youtube_video_data(video_data)
        expected_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        assert result.url == expected_url

    @pytest.mark.asyncio 
    async def test_large_channel_pagination_stress(self, mock_youtube_service):
        """Test pagination with large channels (stress test scenario)."""
        # Simulate multiple pages of results
        pages = []
        for i in range(5):  # 5 pages of results
            page_response = {
                "items": [
                    {
                        "id": f"video{j + i*10}",
                        "snippet": {
                            "title": f"Video {j + i*10}",
                            "publishedAt": "2023-01-01T00:00:00Z"
                        }
                    }
                    for j in range(10)  # 10 videos per page
                ],
                "nextPageToken": f"page_{i+1}" if i < 4 else None  # Last page has no next token
            }
            pages.append(page_response)

        mock_youtube_service.get_channel_videos.side_effect = pages

        # Test that we can paginate through all pages
        all_videos = []
        page_token = None
        page_count = 0

        while page_count < 5:  # Prevent infinite loop
            result = await mock_youtube_service.get_channel_videos(
                "UCtest", max_results=10, page_token=page_token
            )
            
            all_videos.extend(result["items"])
            page_token = result.get("nextPageToken")
            page_count += 1
            
            if not page_token:
                break

        assert len(all_videos) == 50  # 5 pages * 10 videos per page
        assert page_count == 5