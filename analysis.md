# Analysis: Video Discovery API Endpoints Implementation

## Research Analysis: Current State of Video Discovery API Endpoints

Based on my analysis of the YouTube transcription codebase, here's the current state and what needs to be implemented:

### 1. What Video Discovery API Endpoints Currently Exist

**Current Endpoints in `/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/backend/app/api/routes/videos.py`:**

- **GET `/api/v1/videos/`** - List all videos (stub implementation)
- **GET `/api/v1/videos/channel/{channel_id}`** - List videos by channel (stub implementation)  
- **GET `/api/v1/videos/{video_id}`** - Get specific video details (stub implementation)
- **POST `/api/v1/videos/discover`** - Discover new videos from tracked channels (stub implementation)

**Current Status:** All endpoints return placeholder messages like `"Videos endpoint - implementation pending"` - no actual functionality is implemented.

### 2. What Functionality is Missing or Incomplete

**Complete Missing Implementation:**
- **Database Integration:** No endpoints connect to the database to retrieve or store video data
- **YouTube API Integration:** No endpoints use the YouTube API service to discover videos
- **Response Models:** No Pydantic response models defined for consistent API responses
- **Error Handling:** No proper HTTP error handling or status codes
- **Video Discovery Logic:** No implementation of the core video discovery functionality
- **Pagination Support:** No pagination for large result sets
- **Date Filtering:** No support for filtering videos by date ranges
- **Bulk Operations:** No batch video selection or processing endpoints

### 3. Patterns and Structures to Follow

**Based on the working channels implementation in `/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/backend/app/api/routes/channels.py`:**

**Response Models Pattern:**
```python
class VideoResponse(BaseModel):
    """Response model for video data."""
    id: int
    youtube_id: str
    channel_id: int
    title: str
    description: Optional[str] = None
    url: str
    thumbnail_url: Optional[str] = None
    duration_seconds: Optional[int] = None
    view_count: Optional[int] = None
    published_at: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
```

**Service Integration Pattern:**
- Import database dependency: `from app.db.base import get_db`
- Use async database sessions: `db: AsyncSession = Depends(get_db)`
- Import and use video service: `from app.domains.videos.services import video_service`
- Import YouTube API service: `from app.services.youtube_api import YouTubeAPIService`

**Error Handling Pattern:**
```python
try:
    # Implementation logic
    return result
except ValueError as e:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
except Exception as e:
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Operation failed: {str(e)}")
```

### 4. Specific Files That Need Modification

**Primary Implementation File:**
- **`/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/backend/app/api/routes/videos.py`** - Replace all stub implementations with full functionality

**Supporting Infrastructure (Already Available):**
- **`/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/backend/app/domains/videos/models.py`** - Contains `Video` model and `VideoMetadata` Pydantic model
- **`/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/backend/app/domains/videos/services.py`** - Contains `VideoService` with utility methods for parsing YouTube data
- **`/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/backend/app/services/youtube_api.py`** - Contains `YouTubeAPIService` with methods for fetching video data

**Service Enhancements Needed:**
- **`/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/backend/app/domains/videos/services.py`** - Add methods for:
  - `get_all_videos()`
  - `create_video_from_metadata()`
  - `discover_videos_for_channel()`
  - `bulk_discover_videos()`

**Frontend Integration (Already Configured):**
- **`/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/frontend/src/services/videos.ts`** - Frontend service expecting these exact endpoints
- **`/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/frontend/src/constants/api.ts`** - API endpoints already defined
- **`/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/frontend/src/types/api.ts`** - TypeScript `Video` interface already defined

### 5. Architecture Insights

**Database Schema:** The video model supports all necessary fields for video metadata including relationships to channels and transcription jobs.

**YouTube API Integration:** The `YouTubeAPIService` provides methods for:
- `get_channel_videos()` with pagination support
- `get_video_details()` for individual video metadata
- Error handling for quota limits and API failures

**Data Flow:** The architecture supports:
1. Channel-based video discovery using YouTube API
2. Parsing raw YouTube data into structured `VideoMetadata`
3. Storing videos in database with proper relationships
4. Frontend querying via REST API endpoints

**Testing Infrastructure:** Comprehensive test coverage exists in `/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/backend/tests/domains/videos/test_video_discovery.py` including pagination, error handling, and metadata parsing tests.

The codebase has excellent infrastructure in place - it just needs the API routes to be connected to the existing services and database models to complete the video discovery functionality.

## Analysis: Video Discovery API Endpoints - Frontend Expectations vs Backend Implementation

Based on my analysis of the frontend code and backend structure, here's what I found:

### **Frontend Expected API Endpoints**

The frontend is expecting the following video-related API endpoints:

#### **API Endpoints** (`/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/frontend/src/constants/api.ts`)
- `GET /api/v1/videos` - List all videos
- `GET /api/v1/videos/{id}` - Get video by ID  
- `GET /api/v1/videos/channel/{channelId}` - Get videos by channel
- `POST /api/v1/videos/discover` - Discover new videos from tracked channels

#### **Frontend Services** (`/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/frontend/src/services/videos.ts`)
```typescript
export const videosService = {
  getVideos: async (): Promise<Video[]>
  getVideoById: async (id: number): Promise<Video>
  getVideosByChannel: async (channelId: number): Promise<Video[]>
  discoverVideos: async (): Promise<{ message: string }>
}
```

#### **React Hooks** (`/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/frontend/src/hooks/useVideos.ts`)
- `useVideos()` - Query all videos
- `useVideo(id)` - Query specific video by ID
- `useVideosByChannel(channelId)` - Query videos by channel ID
- `useDiscoverVideos()` - Mutation to trigger video discovery

### **Expected Data Structure** (`/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/frontend/src/types/api.ts`)

The frontend expects `Video` objects with this structure:
```typescript
interface Video {
  id: number;                    // Database ID
  youtube_id: string;           // YouTube video ID
  channel_id: number;           // Foreign key to Channel
  title: string;                // Video title
  description?: string;         // Video description
  url: string;                  // YouTube video URL
  thumbnail_url?: string;       // Video thumbnail URL
  duration_seconds?: number;    // Video duration
  view_count?: number;          // View count
  published_at?: string;        // Publication date
  created_at: string;           // Database creation timestamp
  updated_at: string;           // Database update timestamp
}
```

### **Current Backend Implementation Status**

#### **Video Routes** (`/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/backend/app/api/routes/videos.py`)
✅ **Endpoints defined but NOT implemented** - All endpoints return placeholder messages:
- `GET /` - "Videos endpoint - implementation pending"
- `GET /channel/{channel_id}` - "Videos for channel {channel_id} endpoint - implementation pending"
- `GET /{video_id}` - "Get video {video_id} endpoint - implementation pending"
- `POST /discover` - "Discover videos endpoint - implementation pending"

#### **Database Models** (`/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/backend/app/domains/videos/models.py`)
✅ **Fully implemented** - The Video SQLAlchemy model matches the frontend expectations perfectly:
```python
class Video(Base):
    id: Mapped[int]                    # ✅ Matches frontend
    youtube_id: Mapped[str]           # ✅ Matches frontend  
    channel_id: Mapped[int]           # ✅ Matches frontend
    title: Mapped[str]                # ✅ Matches frontend
    description: Mapped[str | None]   # ✅ Matches frontend
    url: Mapped[str]                  # ✅ Matches frontend
    thumbnail_url: Mapped[str | None] # ✅ Matches frontend
    duration_seconds: Mapped[int | None] # ✅ Matches frontend
    view_count: Mapped[int | None]    # ✅ Matches frontend
    published_at: Mapped[datetime | None] # ✅ Matches frontend
    created_at: Mapped[datetime]      # ✅ Matches frontend
    updated_at: Mapped[datetime]      # ✅ Matches frontend
```

#### **Video Services** (`/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/backend/app/domains/videos/services.py`)
✅ **Partially implemented** - Has utility functions but missing core CRUD operations:
- ✅ `parse_youtube_video_data()` - Converts YouTube API data to VideoMetadata
- ✅ `parse_duration_string()` - Parses ISO 8601 duration formats
- ✅ `get_video_by_id()` - Database query by ID
- ✅ `get_video_by_youtube_id()` - Database query by YouTube ID
- ✅ `get_videos_by_channel_id()` - Database query by channel ID
- ❌ **Missing**: `get_all_videos()` for listing all videos
- ❌ **Missing**: Video discovery/creation logic

#### **YouTube API Service** (`/Users/m2btmacbook/dev/yt-transcribe/todos/worktrees/2025-07-28-19-35-51-complete-video-discovery-api-endpoints/backend/app/services/youtube_api.py`)
✅ **Fully implemented** - All required YouTube API functionality exists:
- ✅ `get_channel_videos()` - With pagination support
- ✅ `get_video_details()` - Get detailed video information
- ✅ `get_channel_info()` - Get channel information
- ✅ Error handling for quota/access/not found

### **Gaps Between Frontend Expectations and Backend Implementation**

#### **Critical Missing Implementation:**

1. **Video Route Handlers** - All 4 endpoints need implementation:
   - `GET /api/v1/videos` - List all videos with database queries
   - `GET /api/v1/videos/{id}` - Get single video by ID
   - `GET /api/v1/videos/channel/{channelId}` - Get videos by channel
   - `POST /api/v1/videos/discover` - Video discovery implementation

2. **Video Discovery Logic** - The `/discover` endpoint needs to:
   - Fetch all tracked channels from database
   - Use YouTube API to get latest videos for each channel
   - Parse video metadata using existing `VideoService.parse_youtube_video_data()`
   - Store new videos in database (avoiding duplicates)
   - Return success/failure message

3. **Database Session Management** - Routes need proper async database session handling

4. **Error Handling** - Proper HTTP error responses for various scenarios

#### **What's Already Working:**
- ✅ Database models match frontend expectations exactly
- ✅ YouTube API service has all required functionality
- ✅ Video metadata parsing is implemented and tested
- ✅ Database query functions exist in VideoService
- ✅ Frontend is properly structured to consume the APIs

### **Implementation Priority:**

The video discovery endpoints can be completed by implementing the route handlers that connect the existing services:

1. **High Priority**: `POST /api/v1/videos/discover` - Core functionality
2. **High Priority**: `GET /api/v1/videos` - Basic video listing  
3. **Medium Priority**: `GET /api/v1/videos/{id}` - Single video retrieval
4. **Medium Priority**: `GET /api/v1/videos/channel/{channelId}` - Channel videos

The foundation is solid - all the complex parsing, database models, and YouTube API integration already exists. The gap is purely in the API route implementations that wire these components together.