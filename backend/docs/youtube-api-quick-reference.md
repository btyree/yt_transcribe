# YouTube API Quick Reference

## Setup Checklist

- [ ] YouTube Data API v3 enabled in Google Cloud Console
- [ ] API key created and added to `.env` file
- [ ] Database migrations run: `uv run alembic upgrade head`
- [ ] Dependencies installed: `uv sync`

## Environment Variables

```env
YOUTUBE_API_KEY=your_api_key_here
ALLOWED_ORIGINS='["http://localhost:3000", "http://localhost:5173"]'
```

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/channels/validate` | Validate channel URL format |
| POST | `/api/v1/channels/` | Add channel with real YouTube data |
| GET | `/api/v1/channels/` | List all channels |
| GET | `/api/v1/channels/{id}` | Get specific channel |
| DELETE | `/api/v1/channels/{id}` | Remove channel |

## Service Methods Summary

| Method | Purpose | Returns |
|--------|---------|---------|
| `get_channel_info(channel_id)` | Get channel by YouTube ID | Channel dict or None |
| `get_channel_by_username(username)` | Get channel by @username | Channel dict or None |
| `get_channel_videos(channel_id)` | Get channel's videos | List of video dicts |
| `get_video_details(video_id)` | Get video details | Video dict or None |
| `search_channels(query)` | Search channels | List of channel dicts |

## Error Handling

| Exception | Cause | Action |
|-----------|-------|--------|
| `YouTubeQuotaExceededError` | API quota exceeded | Wait and retry |
| `YouTubeAccessDeniedError` | Invalid API key | Check configuration |
| `YouTubeNotFoundError` | Resource not found | Verify URL/ID |
| `YouTubeAPIError` | Generic API error | Check API status |

## Testing Commands

```bash
# Run tests
uv run python -m pytest tests/services/test_youtube_api.py -v

# Test API connectivity
uv run python test_youtube_api.py

# Start server
uv run python -m uvicorn main:app --reload --port 8001
```

## Sample Requests

### Validate Channel URL
```bash
curl -X POST "http://localhost:8001/api/v1/channels/validate" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/@indydevdan"}'
```

### Create Channel
```bash
curl -X POST "http://localhost:8001/api/v1/channels/" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/@indydevdan"}'
```

## Supported URL Formats

- `https://www.youtube.com/@username`
- `https://www.youtube.com/channel/CHANNEL_ID`
- `https://www.youtube.com/c/channelname`
- `https://www.youtube.com/user/username`

## Quota Usage

- Channel lookup: ~3 units
- Video listing: ~3-5 units
- Search: ~100 units
- Daily limit: 10,000 units (default)

## Common Issues

1. **API Key Issues**: Check `.env` file and Google Cloud Console
2. **Quota Exceeded**: Monitor usage in Google Cloud Console
3. **Channel Not Found**: Verify URL format and channel existence
4. **Database Errors**: Run migrations and check connection