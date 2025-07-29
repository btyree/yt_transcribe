"""
Integration tests for YouTube API using real API calls.
These tests require a valid YOUTUBE_API_KEY in the environment.

Note: These tests make real API calls and consume quota.
Run sparingly to avoid hitting quota limits.
"""
import os
import pytest
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
from app.services.youtube_api import (
    YouTubeAPIService,
    YouTubeNotFoundError,
    YouTubeAPIError
)


@pytest.mark.skipif(
    not os.getenv("YOUTUBE_API_KEY"), 
    reason="YouTube API key not found in environment"
)
class TestYouTubeAPIIntegration:
    """Integration tests using real YouTube API."""

    @pytest.fixture
    def youtube_service(self):
        """Real YouTube API service instance."""
        return YouTubeAPIService()

    @pytest.mark.asyncio
    async def test_get_channel_by_username_real(self, youtube_service):
        """Test getting channel info by username with real API."""
        # Using a well-known YouTube channel that should always exist
        result = await youtube_service.get_channel_by_username("TEDTalks")
        
        assert result is not None
        assert "id" in result
        assert "snippet" in result
        assert result["snippet"]["title"] == "TED"
        assert "statistics" in result
        print(f"✅ Found channel: {result['snippet']['title']}")

    @pytest.mark.asyncio
    async def test_get_channel_info_real(self, youtube_service):
        """Test getting channel info by ID with real API."""
        # TED's channel ID
        ted_channel_id = "UCAuUUnT6oDeKwE6v1NGQxug"
        
        result = await youtube_service.get_channel_info(ted_channel_id)
        
        assert result is not None
        assert result["id"] == ted_channel_id
        assert "snippet" in result
        assert result["snippet"]["title"] == "TED"
        print(f"✅ Found channel by ID: {result['snippet']['title']}")

    @pytest.mark.asyncio
    async def test_get_channel_videos_real(self, youtube_service):
        """Test getting channel videos with real API."""
        # TED's channel ID
        ted_channel_id = "UCAuUUnT6oDeKwE6v1NGQxug"
        
        result = await youtube_service.get_channel_videos(ted_channel_id, max_results=5)
        
        assert "items" in result
        assert len(result["items"]) > 0
        assert len(result["items"]) <= 5
        
        # Check first video has expected structure
        first_video = result["items"][0]
        assert "snippet" in first_video
        assert "title" in first_video["snippet"]
        print(f"✅ Found {len(result['items'])} videos")
        print(f"   First video: {first_video['snippet']['title'][:50]}...")

    @pytest.mark.asyncio
    async def test_get_video_details_real(self, youtube_service):
        """Test getting video details with real API."""
        # A famous TED talk video ID
        video_id = "do_WQ6HWrPY"  # "Your body language may shape who you are"
        
        result = await youtube_service.get_video_details(video_id)
        
        assert result is not None
        assert result["id"] == video_id
        assert "snippet" in result
        assert "contentDetails" in result
        assert "statistics" in result
        
        # Check that it has duration and view count
        assert "duration" in result["contentDetails"]
        assert "viewCount" in result["statistics"]
        print(f"✅ Video details: {result['snippet']['title'][:50]}...")
        print(f"   Views: {result['statistics']['viewCount']}")

    @pytest.mark.asyncio
    async def test_search_channels_real(self, youtube_service):
        """Test searching channels with real API."""
        result = await youtube_service.search_channels("TED", max_results=3)
        
        assert len(result) > 0
        assert len(result) <= 3
        
        # Check that TED appears in results
        channel_titles = [channel["snippet"]["title"] for channel in result]
        ted_found = any("TED" in title for title in channel_titles)
        assert ted_found, f"TED not found in results: {channel_titles}"
        print(f"✅ Found {len(result)} channels in search")
        print(f"   Channels: {', '.join(channel_titles)}")

    @pytest.mark.asyncio
    async def test_nonexistent_channel_username(self, youtube_service):
        """Test handling of nonexistent channel username."""
        with pytest.raises(YouTubeNotFoundError):
            await youtube_service.get_channel_by_username("ThisChannelDoesNotExist12345")
        print("✅ Correctly handled nonexistent channel username")

    @pytest.mark.asyncio
    async def test_nonexistent_channel_id(self, youtube_service):
        """Test handling of nonexistent channel ID."""
        with pytest.raises(YouTubeNotFoundError):
            await youtube_service.get_channel_info("UCDoesNotExist12345")
        print("✅ Correctly handled nonexistent channel ID")

    @pytest.mark.asyncio
    async def test_api_quota_info(self, youtube_service):
        """Test that we can make multiple calls without issues."""
        # Make several API calls to test quota usage
        calls_made = 0
        
        try:
            # Small API calls to test quota
            await youtube_service.get_channel_by_username("TEDTalks")
            calls_made += 1
            
            result = await youtube_service.search_channels("TED", max_results=1)
            calls_made += 1
            
            if result:
                channel_id = result[0]["id"]["channelId"]
                await youtube_service.get_channel_info(channel_id)
                calls_made += 1
            
            print(f"✅ Successfully made {calls_made} API calls")
            
        except Exception as e:
            print(f"⚠️  API call failed after {calls_made} calls: {str(e)}")
            if "quota" in str(e).lower():
                print("   This appears to be a quota limit - normal for heavy testing")
            raise


# Utility function to run integration tests manually
if __name__ == "__main__":
    import asyncio
    
    print("🧪 Running YouTube API Integration Tests...")
    print("⚠️  These tests make real API calls and consume quota")
    
    # Check if API key is available
    if not os.getenv("YOUTUBE_API_KEY"):
        print("❌ No YouTube API key found in environment")
        exit(1)
    
    async def run_basic_test():
        service = YouTubeAPIService()
        
        try:
            print("\n1. Testing channel lookup by username...")
            result = await service.get_channel_by_username("TEDTalks")
            print(f"   ✅ Found: {result['snippet']['title']}")
            
            print("\n2. Testing video search...")
            videos = await service.get_channel_videos(result["id"], max_results=2)
            print(f"   ✅ Found {len(videos['items'])} videos")
            
            print("\n3. Testing channel search...")
            channels = await service.search_channels("TED", max_results=2)
            print(f"   ✅ Found {len(channels)} channels")
            
            print("\n🎉 All integration tests passed!")
            
        except Exception as e:
            print(f"\n❌ Integration test failed: {str(e)}")
            raise
    
    asyncio.run(run_basic_test())