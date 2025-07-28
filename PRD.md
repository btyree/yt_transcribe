# YouTube Transcription Tool - Product Requirements Document

## 1. Executive Summary

The YouTube Transcription Tool is a personal productivity application designed to streamline the process of transcribing YouTube videos from specific channels. The tool integrates with the YouTube Data API v3 and Deepgram's Speech-to-Text API to provide automated transcription services with support for multiple output formats and organized local storage.

### Key Features
- Channel-based video discovery and selection
- Bulk video transcription processing
- Multiple output formats (TXT, SRT, VTT)
- Organized local file storage
- Real-time progress tracking
- Error handling and retry mechanisms

### Target Users
- Content creators and podcasters
- Researchers and academics
- Educational content curators
- Accessibility professionals
- Personal knowledge management enthusiasts

## 2. Problem Statement & Goals

### Problem Statement
Users currently face significant challenges when trying to transcribe multiple YouTube videos:
- Manual transcription is time-consuming and error-prone
- YouTube's auto-generated captions are often inaccurate or unavailable
- No efficient way to batch process multiple videos from a channel
- Existing tools lack proper organization and format flexibility
- Limited integration between video discovery and transcription services

### Goals
**Primary Goals:**
- Reduce video transcription time by 90% compared to manual methods
- Achieve 95%+ transcription accuracy using Deepgram's advanced AI models
- Enable processing of 50+ videos in a single batch operation
- Provide organized, searchable transcript storage

**Secondary Goals:**
- Support multiple transcript formats for different use cases
- Implement robust error handling for network and API failures
- Create an intuitive interface requiring minimal technical knowledge
- Establish foundation for future features (search, analysis, etc.)

## 3. User Stories & Use Cases

### Primary User Stories

**US-001: Channel Video Discovery**
```
As a content researcher,
I want to input a YouTube channel URL and see all available videos,
So that I can identify which videos need transcription.
```

**US-002: Bulk Video Selection**
```
As a content creator,
I want to select multiple videos using checkboxes,
So that I can efficiently queue videos for batch transcription.
```

**US-003: Transcription Processing**
```
As an educator,
I want to start transcription of selected videos with one click,
So that I can generate text content for my courses.
```

**US-004: Progress Monitoring**
```
As a researcher,
I want to see real-time progress of transcription jobs,
So that I can understand processing status and estimated completion time.
```

**US-005: Multiple Output Formats**
```
As an accessibility professional,
I want to choose between TXT, SRT, and VTT formats,
So that I can use transcripts in different applications and workflows.
```

### Use Cases

**UC-001: Educational Content Batch Processing**
- User inputs educational channel URL
- Selects all videos from current semester
- Chooses TXT format for note-taking
- Processes 25 videos overnight
- Reviews organized transcripts for course preparation

**UC-002: Podcast Transcription Workflow**
- User inputs podcast channel URL
- Filters videos by date range
- Selects SRT format for video editing
- Processes weekly episodes
- Integrates transcripts into video production pipeline

**UC-003: Research Data Collection**
- User inputs multiple expert channels
- Selects videos matching research keywords
- Chooses VTT format for accessibility
- Processes content for analysis
- Exports structured data for research database

## 4. Functional Requirements

### 4.1 Channel Management
**FR-001: Channel URL Input**
- Accept YouTube channel URLs in multiple formats:
  - `https://www.youtube.com/channel/UC...`
  - `https://www.youtube.com/@username`
  - `https://www.youtube.com/c/channelname`
  - `https://www.youtube.com/user/username`
- Validate URL format and channel accessibility
- Display channel metadata (name, subscriber count, video count)

**FR-002: Video Discovery**
- Retrieve all public videos from specified channel
- Display videos in paginated grid view (20 videos per page)
- Show video metadata: title, duration, upload date, view count
- Support sorting by: upload date, duration, title, view count
- Implement search/filter functionality within channel videos

### 4.2 Video Selection Interface
**FR-003: Selection Controls**
- Individual video selection via checkboxes
- "Select All" / "Deselect All" functionality
- "Select by Date Range" filter
- "Select by Duration Range" filter
- Display selected video count and estimated processing time

**FR-004: Video Information Display**
- Thumbnail preview (120x90px)
- Video title (truncated if > 60 characters)
- Duration in MM:SS format
- Upload date in user's locale format
- Processing status indicator

### 4.3 Transcription Processing
**FR-005: Transcription Configuration**
- Output format selection (TXT, SRT, VTT)
- Language detection override option
- Quality settings (accuracy vs. speed)
- Custom filename patterns
- Target folder selection

**FR-006: Batch Processing Engine**
- Process up to 50 videos per batch
- Parallel processing (max 3 concurrent jobs)
- Automatic retry on failure (max 3 attempts)
- Rate limiting compliance with API quotas
- Resume capability for interrupted batches

**FR-007: Audio Extraction**
- Extract audio from YouTube videos using youtube-dl/yt-dlp
- Support multiple audio quality levels
- Temporary file management and cleanup
- Handle age-restricted and private videos gracefully

### 4.4 Progress Tracking
**FR-008: Real-time Status Updates**
- Overall batch progress (X of Y videos completed)
- Individual video status (Queued, Processing, Completed, Failed)
- Estimated time remaining
- Processing speed metrics
- Error details for failed videos

**FR-009: Progress Persistence**
- Save progress state to local storage
- Resume interrupted batches on application restart
- Maintain processing history log
- Export processing reports

### 4.5 File Management
**FR-010: Organized Storage**
- Create folder structure: `{Channel Name}/{Upload Date}/`
- Generate consistent filenames: `{Video Title}_{Video ID}.{format}`
- Handle filename sanitization for filesystem compatibility
- Avoid overwriting existing files (append timestamp if needed)

**FR-011: Output Formats**
- **TXT**: Plain text transcript with optional timestamps
- **SRT**: SubRip subtitle format with timing and sequence numbers
- **VTT**: WebVTT format for web-based video players
- Preserve speaker identification when available
- Include metadata header with video information

## 5. Technical Requirements

### 5.1 Architecture Overview
- **Frontend**: Modern web application (React/Vue.js) or desktop app (Electron)
- **Backend**: Node.js/Python REST API
- **Database**: SQLite for local data persistence
- **File Storage**: Local filesystem with configurable root directory

### 5.2 API Integration Requirements

**TR-001: YouTube Data API v3**
- Implement OAuth 2.0 authentication flow
- Handle API quota management (10,000 units/day default)
- Use channels.list method to get channel details
- Use playlistItems.list to retrieve video lists
- Implement pagination for large channels (50 videos per request)
- Cache channel data to minimize API calls

**TR-002: Deepgram Speech-to-Text API**
- Authenticate using API key
- Use pre-recorded audio transcription endpoint
- Configure optimal model settings:
  - Model: `nova-2` (recommended for general use)
  - Language: Auto-detection with English fallback
  - Features: punctuate, paragraphs, utterances, smart_format
- Handle large file uploads (up to 2GB per file)
- Implement error handling for network timeouts

**TR-003: Audio Extraction**
- Integrate youtube-dl or yt-dlp for video/audio download
- Extract audio in MP3 format (128kbps minimum)
- Handle various video formats and qualities
- Respect YouTube's Terms of Service
- Implement proper cleanup of temporary files

### 5.3 Performance Requirements
**TR-004: Response Times**
- Channel video loading: < 3 seconds for channels with < 1000 videos
- Transcription start: < 5 seconds to begin first video
- UI responsiveness: < 100ms for all user interactions
- File operations: < 1 second for typical file saves

**TR-005: Resource Management**
- Memory usage: < 2GB during normal operation
- Disk space: Automatic cleanup of temporary files
- Network usage: Efficient API call batching
- CPU usage: < 50% during transcription processing

### 5.4 Data Storage
**TR-006: Local Database Schema**
```sql
Channels:
  - channel_id (TEXT PRIMARY KEY)
  - channel_name (TEXT)
  - channel_url (TEXT)
  - last_updated (DATETIME)
  - video_count (INTEGER)

Videos:
  - video_id (TEXT PRIMARY KEY)
  - channel_id (TEXT FOREIGN KEY)
  - title (TEXT)
  - duration (INTEGER)
  - upload_date (DATETIME)
  - transcript_status (TEXT)

Transcription_Jobs:
  - job_id (TEXT PRIMARY KEY)
  - video_ids (JSON)
  - status (TEXT)
  - created_at (DATETIME)
  - completed_at (DATETIME)
  - settings (JSON)
```

## 6. User Interface Requirements

### 6.1 Main Application Layout
**UI-001: Header Section**
- Application title and version
- Channel URL input field with validation
- Load Channel button
- Settings/preferences access

**UI-002: Channel Information Panel**
- Channel thumbnail and name
- Subscriber count and video count
- Last updated timestamp
- Channel statistics overview

**UI-003: Video Grid Layout**
- Responsive grid (4-6 videos per row on desktop)
- Video thumbnail, title, duration, upload date
- Selection checkbox on each video card
- Hover effects for better UX
- Loading skeleton for better perceived performance

### 6.2 Control Panel
**UI-004: Selection Controls**
- Bulk selection buttons (All, None, Date Range)
- Selected count display
- Processing options dropdown
- Output format selection (radio buttons)
- Start Transcription button (primary CTA)

**UI-005: Progress Interface**
- Progress bar for overall batch status
- Individual video status list with icons
- Estimated time remaining
- Cancel/pause functionality
- Detailed logs expandable section

### 6.3 Settings and Configuration
**UI-006: Settings Modal**
- API key configuration (YouTube, Deepgram)
- Default output folder selection
- Default format preferences
- Processing quality settings
- Advanced options (developer features)

**UI-007: Error Handling Interface**
- Toast notifications for quick feedback
- Error dialog with actionable options
- Retry buttons for failed operations
- Help links and troubleshooting guides

### 6.4 Responsive Design Requirements
- Mobile-first approach with desktop enhancements
- Touch-friendly interface elements
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## 7. API Requirements

### 7.1 YouTube Data API Integration

**API-001: Authentication Flow**
```javascript
// OAuth 2.0 implementation
const auth = {
  scope: ['https://www.googleapis.com/auth/youtube.readonly'],
  client_id: process.env.YOUTUBE_CLIENT_ID,
  client_secret: process.env.YOUTUBE_CLIENT_SECRET,
  redirect_uri: 'http://localhost:3000/auth/callback'
}
```

**API-002: Channel Data Retrieval**
```javascript
// Get channel information
GET https://www.googleapis.com/youtube/v3/channels
  ?part=snippet,contentDetails,statistics
  &id={CHANNEL_ID}
  &key={API_KEY}

// Get channel uploads playlist
GET https://www.googleapis.com/youtube/v3/playlistItems
  ?part=snippet,contentDetails
  &playlistId={UPLOADS_PLAYLIST_ID}
  &maxResults=50
  &pageToken={NEXT_PAGE_TOKEN}
  &key={API_KEY}
```

**API-003: Rate Limiting Management**
- Implement exponential backoff for quota exceeded errors
- Track daily quota usage (10,000 units default)
- Cache responses to minimize API calls
- Batch requests where possible

### 7.2 Deepgram API Integration

**API-004: Transcription Request**
```javascript
// Pre-recorded audio transcription
POST https://api.deepgram.com/v1/listen
Headers:
  Authorization: Token {API_KEY}
  Content-Type: audio/mp3

Query Parameters:
  model=nova-2
  language=en
  punctuate=true
  paragraphs=true
  utterances=true
  smart_format=true
  diarize=true
```

**API-005: Response Handling**
```javascript
// Expected response structure
{
  "metadata": {
    "transaction_key": "string",
    "request_id": "string",
    "sha256": "string",
    "created": "2023-10-01T12:00:00Z",
    "duration": 120.5,
    "channels": 1
  },
  "results": {
    "channels": [{
      "alternatives": [{
        "transcript": "Full transcript text...",
        "confidence": 0.99,
        "words": [...]
      }]
    }]
  }
}
```

### 7.3 Error Handling

**API-006: Error Response Management**
```javascript
// YouTube API Errors
{
  "error": {
    "code": 403,
    "message": "The request cannot be completed because you have exceeded your quota.",
    "errors": [{
      "domain": "youtube.quota",
      "reason": "quotaExceeded"
    }]
  }
}

// Deepgram API Errors
{
  "error": {
    "code": 400,
    "message": "Bad Request: Invalid audio format"
  }
}
```

## 8. Non-Functional Requirements

### 8.1 Performance Requirements
**NFR-001: Scalability**
- Support channels with up to 10,000 videos
- Handle batch processing of 50+ videos simultaneously
- Maintain responsive UI during heavy processing
- Efficient memory management for large datasets

**NFR-002: Reliability**
- 99.5% uptime for core functionality
- Automatic recovery from network failures
- Data persistence across application restarts
- Comprehensive error logging and recovery

**NFR-003: Usability**
- Intuitive interface requiring no technical knowledge
- Maximum 3 clicks to start transcription process
- Clear progress indication and status updates
- Comprehensive help documentation

### 8.2 Security Requirements
**NFR-004: Data Protection**
- Secure storage of API keys using system keychain
- No permanent storage of video content
- HTTPS for all API communications
- Local data encryption for sensitive information

**NFR-005: Privacy**
- No data transmission to third parties except APIs
- User consent for data processing
- Clear data retention policies
- Option to delete all stored data

### 8.3 Compatibility Requirements
**NFR-006: Platform Support**
- Windows 10/11 (x64)
- macOS 10.15+ (Intel and Apple Silicon)
- Linux (Ubuntu 20.04+ LTS)
- Web browsers (Chrome 90+, Firefox 88+, Safari 14+)

**NFR-007: Integration Requirements**
- YouTube Data API v3 compatibility
- Deepgram API v1 compatibility
- Standard file format support (TXT, SRT, VTT)
- Common video player integration

## 9. Development Timeline

### Phase 1: Foundation (Weeks 1-4)
**Milestone: Basic Infrastructure**
- [ ] Project setup and architecture design
- [ ] YouTube Data API integration
- [ ] Channel URL validation and video discovery
- [ ] Basic UI framework and routing
- [ ] Local database schema implementation

**Deliverables:**
- Working channel video discovery
- Basic video grid display
- API integration framework

### Phase 2: Core Functionality (Weeks 5-8)
**Milestone: Transcription Pipeline**
- [ ] Deepgram API integration
- [ ] Audio extraction from YouTube videos
- [ ] Basic transcription processing
- [ ] File output in TXT format
- [ ] Progress tracking system

**Deliverables:**
- End-to-end transcription workflow
- Basic progress monitoring
- File management system

### Phase 3: Enhanced Features (Weeks 9-12)
**Milestone: Production-Ready Features**
- [ ] Multiple output formats (SRT, VTT)
- [ ] Batch processing optimization
- [ ] Advanced UI components
- [ ] Error handling and retry logic
- [ ] Settings and configuration system

**Deliverables:**
- Full-featured application
- Comprehensive error handling
- User preference management

### Phase 4: Polish and Testing (Weeks 13-16)
**Milestone: Release Candidate**
- [ ] Comprehensive testing suite
- [ ] Performance optimization
- [ ] Documentation and help system
- [ ] Security audit and improvements
- [ ] User acceptance testing

**Deliverables:**
- Tested and optimized application
- Complete documentation
- Release-ready package

## 10. Success Metrics

### 10.1 User Experience Metrics
- **Task Completion Rate**: 95% of users successfully transcribe at least one video
- **Time to First Transcription**: < 5 minutes from app launch
- **User Satisfaction Score**: > 4.0/5.0 in user surveys
- **Error Recovery Rate**: 90% of failed transcriptions successfully retry

### 10.2 Technical Performance Metrics
- **Transcription Accuracy**: > 95% word accuracy (measured against manual transcripts)
- **Processing Speed**: < 1:1 ratio (1 minute processing per 1 minute of video)
- **System Reliability**: < 1% unrecoverable errors
- **Resource Efficiency**: < 2GB RAM usage during normal operation

### 10.3 Business Impact Metrics
- **Time Savings**: 90% reduction compared to manual transcription
- **Cost Efficiency**: < $0.05 per minute of transcribed content
- **User Retention**: 70% monthly active users after 3 months
- **Feature Adoption**: 60% of users use batch processing feature

## 11. Risk Assessment

### 11.1 Technical Risks

**Risk: YouTube API Changes**
- **Probability**: Medium
- **Impact**: High
- **Mitigation**: Implement adapter pattern, maintain API version compatibility, monitor YouTube developer updates

**Risk: Deepgram Service Reliability**
- **Probability**: Low
- **Impact**: High
- **Mitigation**: Implement fallback transcription services, robust retry logic, service status monitoring

**Risk: Video Download Restrictions**
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: Stay updated with youtube-dl/yt-dlp, implement graceful handling of restricted content

### 11.2 Business Risks

**Risk: API Cost Escalation**
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: Implement usage monitoring, optimize API calls, provide cost transparency to users

**Risk: Copyright/Legal Issues**
- **Probability**: Low
- **Impact**: High
- **Mitigation**: Clear terms of use, respect content creator rights, implement fair use guidelines

### 11.3 User Experience Risks

**Risk: Complex Setup Process**
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: Streamlined onboarding, clear documentation, automated setup where possible

**Risk: Poor Transcription Quality**
- **Probability**: Low
- **Impact**: High
- **Mitigation**: Quality testing, user feedback integration, alternative model options

## 12. Future Roadmap

### Phase 2 Enhancements (6-12 months)
**Advanced Features:**
- AI-powered transcript summarization
- Keyword extraction and tagging
- Multi-language transcription support
- Cloud storage integration (Google Drive, Dropbox)
- Advanced search within transcripts

**Integration Expansions:**
- Support for other video platforms (Vimeo, Twitch)
- Podcast platform integration (Spotify, Apple Podcasts)
- Integration with note-taking apps (Notion, Obsidian)
- API for third-party integrations

### Phase 3 Intelligence (12-18 months)
**AI-Powered Features:**
- Automatic chapter detection and segmentation
- Speaker identification and labeling
- Content categorization and themes
- Sentiment analysis of transcribed content
- Translation services integration

**Collaboration Features:**
- Team workspaces and shared libraries
- Collaborative transcript editing
- Export to presentation formats
- Integration with learning management systems

### Long-term Vision (18+ months)
**Enterprise Features:**
- Multi-user administration
- Advanced analytics and reporting
- Custom model training for domain-specific transcription
- Enterprise security and compliance features
- White-label solution for businesses

---

## Appendices

### Appendix A: API Documentation References
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Deepgram Speech-to-Text API](https://developers.deepgram.com/reference/)
- [youtube-dlp Documentation](https://github.com/yt-dlp/yt-dlp)

### Appendix B: File Format Specifications
- [SRT Subtitle Format](https://en.wikipedia.org/wiki/SubRip)
- [WebVTT Format](https://www.w3.org/TR/webvtt1/)
- [Plain Text Best Practices](https://tools.ietf.org/html/rfc7763)

### Appendix C: Security Considerations
- OAuth 2.0 implementation guidelines
- API key management best practices
- Local data encryption standards
- Privacy policy template

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-28  
**Author**: Product Requirements Team  
**Status**: Approved for Development