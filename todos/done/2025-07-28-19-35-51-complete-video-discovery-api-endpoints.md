# Complete video discovery API endpoints
**Status:** Done
**Agent PID:** 85424

## Original Todo
Complete video discovery API endpoints

## Description
Complete the implementation of video discovery API endpoints by connecting existing stub routes to the database, YouTube API service, and video parsing infrastructure that's already built.

## Implementation Plan
- [ ] Add missing service methods to VideoService (backend/app/domains/videos/services.py:1-200)
  - Add `get_all_videos()` method for listing all videos
  - Add `create_video_from_metadata()` method for storing discovered videos
  - Add `discover_videos_for_channel()` method for channel-specific discovery
- [ ] Create VideoResponse Pydantic model in videos.py routes file
- [ ] Implement GET /api/v1/videos endpoint (backend/app/api/routes/videos.py:15-25)
- [ ] Implement GET /api/v1/videos/{video_id} endpoint (backend/app/api/routes/videos.py:35-45)
- [ ] Implement GET /api/v1/videos/channel/{channel_id} endpoint (backend/app/api/routes/videos.py:25-35)
- [ ] Implement POST /api/v1/videos/discover endpoint (backend/app/api/routes/videos.py:45-55)
- [ ] Automated test: Run existing video discovery tests to verify functionality
- [ ] User test: Test all endpoints using frontend or API client

## Notes
[Implementation notes]
