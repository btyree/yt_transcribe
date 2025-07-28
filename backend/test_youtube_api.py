#!/usr/bin/env python3
"""
Test script for YouTube API connectivity.
Tests the YouTubeAPIService with a sample channel.
"""
import asyncio
import os
import sys
from pathlib import Path

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Add the backend directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.youtube_api import (
    YouTubeAPIService,
    YouTubeQuotaExceededError,
    YouTubeAccessDeniedError,
    YouTubeNotFoundError,
    YouTubeAPIError,
)


async def test_youtube_api_connectivity():
    """Test basic YouTube API connectivity with sample channel."""
    print("Testing YouTube API connectivity...")
    
    try:
        # Get API key from environment
        api_key = os.getenv('YOUTUBE_API_KEY')
        if not api_key:
            print("✗ No YOUTUBE_API_KEY found in environment")
            return False
        
        # Initialize YouTube API service
        youtube_service = YouTubeAPIService(api_key=api_key)
        print("✓ YouTube API service initialized successfully")
        
        # Test with the provided channel: https://www.youtube.com/@indydevdan
        test_username = "indydevdan"
        print(f"\nTesting channel lookup for @{test_username}...")
        
        channel_data = await youtube_service.get_channel_by_username(test_username)
        print(f"Raw channel data: {channel_data}")
        
        if channel_data:
            snippet = channel_data.get("snippet", {})
            statistics = channel_data.get("statistics", {})
            
            print("✓ Successfully retrieved channel data!")
            print(f"  Channel ID: {channel_data.get('id')}")
            print(f"  Title: {snippet.get('title')}")
            print(f"  Subscriber Count: {statistics.get('subscriberCount', 'N/A')}")
            print(f"  Video Count: {statistics.get('videoCount', 'N/A')}")
            print(f"  View Count: {statistics.get('viewCount', 'N/A')}")
            print(f"  Published At: {snippet.get('publishedAt', 'N/A')}")
            return True
        else:
            print("✗ No channel data returned (but no error thrown)")
            return False
            
    except YouTubeQuotaExceededError as e:
        print(f"✗ YouTube API quota exceeded: {e}")
        return False
    except YouTubeAccessDeniedError as e:
        print(f"✗ YouTube API access denied: {e}")
        print("  Check that your API key is valid and YouTube Data API v3 is enabled")
        return False
    except YouTubeNotFoundError as e:
        print(f"✗ Channel not found: {e}")
        return False
    except YouTubeAPIError as e:
        print(f"✗ YouTube API error: {e}")
        return False
    except ValueError as e:
        print(f"✗ Configuration error: {e}")
        print("  Make sure YOUTUBE_API_KEY is set in your .env file")
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        return False


if __name__ == "__main__":
    print("YouTube API Connectivity Test")
    print("=" * 40)
    
    success = asyncio.run(test_youtube_api_connectivity())
    
    if success:
        print("\n✓ All tests passed! YouTube API is working correctly.")
        sys.exit(0)
    else:
        print("\n✗ Tests failed. Please check your configuration.")
        sys.exit(1)