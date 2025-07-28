# YouTube Data API Integration Analysis

## Current Project State
Based on my research of the codebase, the project has been properly set up with:
- **Backend**: FastAPI with SQLAlchemy ORM, structured domain-driven architecture
- **Frontend**: React with TypeScript, Vite, feature-based organization
- **Database**: SQLite with Alembic migrations
- **Configuration**: Proper settings with environment variables including `youtube_api_key`

## Existing Architecture
The codebase already has:
- **Channel model** (`backend/app/domains/channels/models.py`) with fields for YouTube metadata
- **API routes** (`backend/app/api/routes/channels.py`) with placeholder endpoints
- **Frontend services** (`frontend/src/services/channels.ts`) with TypeScript interfaces
- **Type definitions** matching the database schema

## Required Dependencies
From `backend/pyproject.toml`, these packages are already included:
- `httpx>=0.25.0` - for HTTP requests
- `pydantic>=2.5.0` - for data validation
- `python-dotenv>=1.0.0` - for environment variables

**Missing dependencies** that need to be added:
- `google-api-python-client` - for YouTube Data API v3
- `google-auth-oauthlib` - for OAuth 2.0 authentication
- `google-auth-httplib2` - for HTTP transport

## YouTube Data API Integration Requirements

### 1. OAuth 2.0 Authentication Flow
- Set up OAuth 2.0 credentials (client_secrets.json)
- Implement authentication service for handling Google OAuth flow
- Store and refresh access tokens securely
- Handle user consent and authorization redirect

### 2. Channel URL Validation
Support these YouTube URL formats (from original todo):
- `@username` format (e.g., `@googledevelopers`)
- `/c/` format (e.g., `youtube.com/c/GoogleDevelopers`)
- `/channel/` format (e.g., `youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw`)
- `/user/` format (e.g., `youtube.com/user/GoogleDevelopers`)

### 3. YouTube API Service Layer
- Create service class for YouTube API calls
- Implement rate limiting and error handling
- Handle API quotas and throttling
- Retry logic for transient failures

### 4. Channel Metadata Retrieval
Using YouTube Data API v3 `channels.list` method to get:
- Channel ID (youtube_id)
- Channel title
- Channel description
- Thumbnail URL
- Subscriber count
- Video count

## Implementation Locations

### Backend Changes
1. **`backend/app/services/youtube_service.py`** - New YouTube API service
2. **`backend/app/core/config.py`** - Add OAuth configuration
3. **`backend/app/api/routes/channels.py`** - Implement actual endpoints
4. **`backend/app/domains/channels/`** - Add service classes
5. **`backend/pyproject.toml`** - Add missing dependencies

### Frontend Changes
1. **Frontend services** - Already structured, just need implementation
2. **OAuth flow handling** - Add redirect handling for OAuth callback
3. **Error handling** - Implement user-friendly error messages

## API Endpoints to Implement
1. `POST /channels/` - Add channel by URL (triggers OAuth if needed)
2. `GET /channels/` - List tracked channels
3. `GET /channels/{id}` - Get specific channel details
4. `DELETE /channels/{id}` - Remove channel from tracking

## Security Considerations
- Store OAuth credentials securely (not in database)
- Use environment variables for client secrets
- Implement proper CORS for OAuth redirects
- Rate limiting for API calls
- Input validation for YouTube URLs

## Error Handling Scenarios
- Invalid YouTube URLs
- Private/deleted channels
- API quota exceeded
- Network failures
- OAuth token expiration
- Channel not found

## Testing Strategy
- Unit tests for URL validation regex
- Integration tests for YouTube API calls
- Mocked API responses for testing
- OAuth flow testing (with test credentials)
EOF < /dev/null
