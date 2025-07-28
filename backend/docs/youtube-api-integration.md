# YouTube API Integration Documentation

## Overview

This document outlines the YouTube Data API v3 integration for the YouTube Transcription Tool. The integration allows users to add YouTube channels to the system, fetch real channel metadata, and manage channel data.

## Table of Contents

1. [Setup and Configuration](#setup-and-configuration)
2. [YouTube API Service](#youtube-api-service)
3. [API Endpoints](#api-endpoints)
4. [Error Handling](#error-handling)
5. [Testing](#testing)
6. [Usage Examples](#usage-examples)

## Setup and Configuration

### Prerequisites

- Google Cloud Console account
- YouTube Data API v3 enabled
- Valid YouTube API key

### Environment Configuration

Create a `.env` file with the following configuration:

```env
# YouTube API Configuration
YOUTUBE_API_KEY=your_youtube_api_key_here

# Other required settings
DATABASE_URL=sqlite+aiosqlite:///./yt_transcribe.db
ALLOWED_ORIGINS='["http://localhost:3000", "http://localhost:5173"]'
DEBUG=true
LOG_LEVEL=INFO
```

### API Key Setup Steps

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Go to "Credentials" and create an API key
5. Copy the API key to your `.env` file

## YouTube API Service

### YouTubeAPIService Class

The `YouTubeAPIService` class provides methods to interact with the YouTube Data API v3.

#### Initialization

```python
from app.services.youtube_api import YouTubeAPIService

# Initialize with API key from environment
service = YouTubeAPIService()

# Or initialize with explicit API key
service = YouTubeAPIService(api_key="your_api_key")
```

**Requirements:**
- Valid YouTube API key
- Internet connection

**Raises:**
- `ValueError`: If no API key is provided

### Service Methods

#### 1. get_channel_info(channel_id: str)

Retrieves channel information by YouTube channel ID.

**What it does:** Fetches detailed channel metadata including statistics and content details.

**Parameters:**
- `channel_id` (str): YouTube channel ID (e.g., "UC_x36zCEGilGpB1m-V4gmjg")

**Returns:**
- `dict`: Channel information object or `None` if not found

**Example Response:**
```json
{
  "id": "UC_x36zCEGilGpB1m-V4gmjg",
  "snippet": {
    "title": "IndyDevDan",
    "description": "Channel description...",
    "publishedAt": "2020-12-23T15:49:25.910686Z",
    "thumbnails": {
      "high": {"url": "https://..."}
    },
    "customUrl": "@indydevdan"
  },
  "statistics": {
    "subscriberCount": "81400",
    "videoCount": "155",
    "viewCount": "2428770"
  }
}
```

**Raises:**
- `YouTubeQuotaExceededError`: API quota exceeded
- `YouTubeAccessDeniedError`: Invalid API key or access denied
- `YouTubeNotFoundError`: Channel not found
- `YouTubeAPIError`: Other API errors

#### 2. get_channel_by_username(username: str)

Retrieves channel information by username or handle.

**What it does:** Searches for a channel by @username handle and returns full channel details.

**Parameters:**
- `username` (str): YouTube username/handle (without @, e.g., "indydevdan")

**Process:**
1. Searches for channel using YouTube search API with "@username"
2. If found, retrieves full channel info using the channel ID
3. Falls back to legacy forUsername method if search fails

**Returns:**
- `dict`: Channel information object or `None` if not found

**Raises:** Same as `get_channel_info`

#### 3. get_channel_videos(channel_id: str, max_results: int = 50, published_after: str = None, published_before: str = None)

Retrieves videos from a channel.

**What it does:** Fetches a list of videos from a channel's uploads playlist.

**Parameters:**
- `channel_id` (str): YouTube channel ID
- `max_results` (int): Maximum number of videos to return (default: 50)
- `published_after` (str, optional): RFC 3339 formatted date-time
- `published_before` (str, optional): RFC 3339 formatted date-time

**Returns:**
- `list[dict]`: List of video information objects

**Raises:** Same as `get_channel_info`

#### 4. get_video_details(video_id: str)

Retrieves detailed information about a specific video.

**What it does:** Fetches video metadata, statistics, and content details.

**Parameters:**
- `video_id` (str): YouTube video ID

**Returns:**
- `dict`: Video information object or `None` if not found

**Raises:** Same as `get_channel_info`

#### 5. search_channels(query: str, max_results: int = 10)

Searches for channels by query string.

**What it does:** Performs a search for channels matching the query.

**Parameters:**
- `query` (str): Search query
- `max_results` (int): Maximum number of results (default: 10)

**Returns:**
- `list[dict]`: List of channel search results

**Raises:** Same as `get_channel_info`

## API Endpoints

### 1. Channel URL Validation

**Endpoint:** `POST /api/v1/channels/validate`

**What it does:** Validates YouTube channel URL format without making API calls.

**Request Body:**
```json
{
  "url": "https://www.youtube.com/@indydevdan"
}
```

**Response (Success):**
```json
{
  "is_valid": true,
  "message": "Valid YouTube channel URL",
  "type": "username",
  "identifier": "indydevdan",
  "original_url": "https://www.youtube.com/@indydevdan",
  "normalized_url": "https://www.youtube.com/@indydevdan",
  "error": null
}
```

**Response (Error):**
```json
{
  "is_valid": false,
  "message": "Invalid YouTube channel URL",
  "type": null,
  "identifier": null,
  "original_url": "https://invalid-url.com",
  "normalized_url": null,
  "error": "URL format not supported"
}
```

**Supported URL Formats:**
- `https://www.youtube.com/@username`
- `https://www.youtube.com/channel/CHANNEL_ID`
- `https://www.youtube.com/c/channelname`
- `https://www.youtube.com/user/username`

### 2. Create Channel

**Endpoint:** `POST /api/v1/channels/`

**What it does:** Adds a new YouTube channel to the database with real metadata from YouTube API.

**Requirements:**
- Valid YouTube API key in environment
- Valid YouTube channel URL
- Database connection

**Request Body:**
```json
{
  "url": "https://www.youtube.com/@indydevdan"
}
```

**Response (Success - 201 Created):**
```json
{
  "id": 1,
  "youtube_id": "UC_x36zCEGilGpB1m-V4gmjg",
  "title": "IndyDevDan",
  "description": "Channel description...",
  "url": "https://www.youtube.com/@indydevdan",
  "thumbnail_url": "https://yt3.ggpht.com/...",
  "custom_url": "@indydevdan",
  "subscriber_count": 81400,
  "video_count": 155,
  "view_count": 2428770,
  "published_at": "2020-12-23T15:49:25.910686Z"
}
```

**Error Responses:**

*400 Bad Request - Invalid URL:*
```json
{
  "detail": "Invalid YouTube channel URL format"
}
```

*400 Bad Request - API Quota Exceeded:*
```json
{
  "detail": "YouTube API quota exceeded. Please try again later."
}
```

*400 Bad Request - Access Denied:*
```json
{
  "detail": "YouTube API access denied. Please check API configuration."
}
```

*404 Not Found - Channel Not Found:*
```json
{
  "detail": "Channel not found on YouTube."
}
```

*409 Conflict - Channel Already Exists:*
```json
{
  "detail": "Channel already exists: IndyDevDan"
}
```

### 3. List Channels

**Endpoint:** `GET /api/v1/channels/`

**What it does:** Retrieves all channels stored in the database.

**Response (Success - 200 OK):**
```json
[
  {
    "id": 1,
    "youtube_id": "UC_x36zCEGilGpB1m-V4gmjg",
    "title": "IndyDevDan",
    "description": "Channel description...",
    "url": "https://www.youtube.com/@indydevdan",
    "thumbnail_url": "https://yt3.ggpht.com/...",
    "custom_url": "@indydevdan",
    "subscriber_count": 81400,
    "video_count": 155,
    "view_count": 2428770,
    "published_at": "2020-12-23T15:49:25.910686Z"
  }
]
```

### 4. Get Channel by ID

**Endpoint:** `GET /api/v1/channels/{channel_id}`

**What it does:** Retrieves a specific channel by database ID.

**Parameters:**
- `channel_id` (int): Database channel ID

**Response (Success - 200 OK):**
```json
{
  "id": 1,
  "youtube_id": "UC_x36zCEGilGpB1m-V4gmjg",
  "title": "IndyDevDan",
  // ... other channel fields
}
```

**Response (Not Found - 404):**
```json
{
  "detail": "Channel with ID 999 not found"
}
```

### 5. Delete Channel

**Endpoint:** `DELETE /api/v1/channels/{channel_id}`

**What it does:** Removes a channel and all associated data from the database.

**Parameters:**
- `channel_id` (int): Database channel ID

**Response (Success - 204 No Content):** Empty response body

**Response (Not Found - 404):**
```json
{
  "detail": "Channel with ID 999 not found"
}
```

## Error Handling

### Custom Exception Classes

#### YouTubeQuotaExceededError
- **When:** YouTube API quota is exceeded
- **HTTP Status:** 400 Bad Request
- **User Action:** Wait and try again later, or upgrade API quota

#### YouTubeAccessDeniedError
- **When:** Invalid API key or insufficient permissions
- **HTTP Status:** 400 Bad Request
- **User Action:** Check API key configuration and permissions

#### YouTubeNotFoundError
- **When:** Requested YouTube resource doesn't exist
- **HTTP Status:** 400 Bad Request
- **User Action:** Verify the channel URL or ID is correct

#### YouTubeAPIError
- **When:** Generic YouTube API error
- **HTTP Status:** 400 Bad Request
- **User Action:** Check API status and retry

### Error Response Format

All error responses follow this structure:
```json
{
  "detail": "Human-readable error message"
}
```

## Testing

### Running Tests

```bash
# Run all YouTube API tests
uv run python -m pytest tests/services/test_youtube_api.py -v

# Run with coverage
uv run python -m pytest tests/services/test_youtube_api.py --cov=app.services.youtube_api
```

### Test Coverage

The test suite includes:
- Service initialization with/without API key
- Successful API calls with mock responses
- Error handling for all exception types
- Channel lookup by ID and username
- Video retrieval and search functionality
- Edge cases and not found scenarios

### Manual Testing Script

A test script is provided for manual API connectivity testing:

```bash
# Test YouTube API connectivity
uv run python test_youtube_api.py
```

This script:
1. Validates API key configuration
2. Tests channel lookup with real API calls
3. Displays retrieved channel information
4. Reports any connectivity issues

## Usage Examples

### Basic Channel Integration

```python
from app.services.youtube_api import YouTubeAPIService

# Initialize service
youtube = YouTubeAPIService()

# Get channel by username
channel = await youtube.get_channel_by_username("indydevdan")
if channel:
    print(f"Channel: {channel['snippet']['title']}")
    print(f"Subscribers: {channel['statistics']['subscriberCount']}")

# Get channel videos
videos = await youtube.get_channel_videos(channel['id'], max_results=10)
print(f"Latest {len(videos)} videos retrieved")
```

### API Endpoint Usage

```bash
# Validate channel URL
curl -X POST "http://localhost:8001/api/v1/channels/validate" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/@indydevdan"}'

# Create channel
curl -X POST "http://localhost:8001/api/v1/channels/" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/@indydevdan"}'

# List all channels
curl -X GET "http://localhost:8001/api/v1/channels/"
```

### Error Handling Example

```python
from app.services.youtube_api import (
    YouTubeAPIService,
    YouTubeQuotaExceededError,
    YouTubeAccessDeniedError
)

try:
    youtube = YouTubeAPIService()
    channel = await youtube.get_channel_by_username("example")
except YouTubeQuotaExceededError:
    print("API quota exceeded. Please try again later.")
except YouTubeAccessDeniedError:
    print("Invalid API key. Please check configuration.")
except Exception as e:
    print(f"Unexpected error: {e}")
```

## Configuration Notes

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `YOUTUBE_API_KEY` | Yes | YouTube Data API v3 key | `AIzaSyC...` |
| `DATABASE_URL` | Yes | Database connection string | `sqlite+aiosqlite:///./yt_transcribe.db` |
| `ALLOWED_ORIGINS` | Yes | CORS allowed origins (JSON format) | `'["http://localhost:3000"]'` |
| `DEBUG` | No | Enable debug mode | `true` |
| `LOG_LEVEL` | No | Logging level | `INFO` |

### API Quotas and Limits

- Default YouTube API quota: 10,000 units/day
- Channel lookup: ~3 units per request
- Video listing: ~3-5 units per request  
- Search requests: ~100 units per request

Monitor your quota usage in the Google Cloud Console.

## Troubleshooting

### Common Issues

1. **"YouTube API key is required" error**
   - Ensure `YOUTUBE_API_KEY` is set in `.env` file
   - Verify the API key is valid and has no extra spaces

2. **"Quota exceeded" errors**
   - Check your API quota usage in Google Cloud Console
   - Consider upgrading your quota or implementing caching

3. **"Access denied" errors**
   - Verify YouTube Data API v3 is enabled in your Google Cloud project
   - Check that your API key has the correct permissions

4. **Channel not found for @username**
   - Some older channels may not be searchable by username
   - Try using the channel ID format instead

5. **Database connection errors**
   - Run database migrations: `uv run alembic upgrade head`
   - Verify database URL in environment configuration

### Debugging Tips

- Enable debug logging by setting `LOG_LEVEL=DEBUG`
- Use the manual test script to verify API connectivity
- Check the Google Cloud Console for API usage and errors
- Review server logs for detailed error information

## Security Considerations

- Keep your YouTube API key secure and never commit it to version control
- Use environment variables for all sensitive configuration
- Implement rate limiting to prevent API quota exhaustion
- Validate all user inputs before making API calls
- Monitor API usage to detect unusual patterns

## Future Enhancements

Potential improvements to consider:

- Caching mechanism to reduce API calls
- Batch processing for multiple channels
- Webhook integration for real-time updates
- Advanced search and filtering capabilities
- Channel statistics trending and analytics