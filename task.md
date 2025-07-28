# Video Discovery Backend
**Status:** InProgress
**Agent PID:** 91868

## Original Todo
### Video Discovery Backend
- [ ] Create Pydantic model for video metadata (title, duration, upload_date, view_count)
- [ ] Implement channel uploads playlist retrieval function
- [ ] Add async function to fetch video list with 50-video pagination
- [ ] Create video metadata parsing service
- [ ] Add error handling for invalid channel URLs
- [ ] Test video discovery with various channel types

## Description
We're building a comprehensive video discovery backend system that leverages the existing YouTube API infrastructure to provide metadata-rich video discovery capabilities. The system will create Pydantic models for video metadata, enhance existing YouTube API pagination, implement video metadata parsing services, and ensure robust error handling for various channel types.

## Implementation Plan
Based on the analysis, here's how we'll build the video discovery backend:

- [ ] **Add Pydantic VideoMetadata model** (backend/app/domains/videos/models.py:existing) - Create response model alongside SQLAlchemy model with youtube_id, title, duration_seconds, upload_date, view_count, thumbnail_url fields
- [ ] **Create VideoService class** (backend/app/domains/videos/services.py:new) - Implement video metadata parsing service with parse_youtube_video_data() and parse_duration_string() methods  
- [ ] **Enhance YouTube API pagination** (backend/app/services/youtube_api.py:enhance get_channel_videos) - Add page_token parameter support and return dict with nextPageToken for 50-video pagination
- [ ] **Add channel uploads playlist method** (backend/app/services/youtube_api.py:add method) - Create dedicated get_channel_uploads_playlist() method for uploads playlist ID retrieval
- [ ] **Fix Channel-Video relationship** (backend/app/domains/channels/models.py:add back_populates) - Add videos relationship mapping to Channel model
- [ ] **Create comprehensive tests** (backend/tests/domains/videos/test_video_discovery.py:new) - Test video discovery with various channel types including validation, parsing, and error scenarios
- [ ] **Automated test**: Run pytest backend/tests/domains/videos/test_video_discovery.py
- [ ] **User test**: Verify video metadata parsing works with real YouTube channels, test pagination with large channels, confirm error handling for invalid URLs

## Notes
[Implementation notes]