# Project: YouTube Transcription Tool
A personal productivity application that automates the transcription of YouTube videos from specific channels using AI-powered speech-to-text technology.

## Features
- Channel-based video discovery from various YouTube URL formats
- Bulk video selection with filtering by date range, duration, and search terms
- Batch transcription processing (up to 50 videos simultaneously)
- Multiple output formats: TXT, SRT, and VTT
- Organized local file storage with structured folder hierarchy
- Real-time progress tracking with retry mechanisms
- Integration with YouTube Data API v3 and Deepgram Speech-to-Text API

## Tech Stack
**Status**: Planning phase - no code implemented yet
**Technologies**:
- Frontend: TypeScript/JavaScript (React/Vue.js or Electron)
- Backend: Python REST API
- Database: SQLite for local data persistence
- APIs: YouTube Data API v3, Deepgram Speech-to-Text API
- Audio Processing: youtube-dl/yt-dlp

## Structure
**Current**: Only PRD.md exists in repository
**Planned Structure**:
- Frontend components for channel input and video selection
- Backend API modules for YouTube and Deepgram integration
- Database layer for job tracking and metadata
- File management system for transcript organization

## Architecture
**Planned**: TypeScript/JavaScript frontend with Python REST API backend, local SQLite database, and organized filesystem storage. Will support batch processing of up to 50 videos with parallel transcription jobs.

## Commands
**None configured yet** - Project needs initialization
**Will need**:
- Frontend Build: npm run build / yarn build
- Backend: python -m uvicorn main:app --reload (FastAPI) or flask run
- Test: pytest (Python), npm test (TypeScript/JS)
- Lint: pylint/black (Python), eslint/prettier (TypeScript/JS)
- Dev: Concurrent frontend and backend development servers

## Testing
**Not configured** - No testing framework chosen yet
**Will need**: pytest for Python backend, Jest/Vitest for TypeScript/JS frontend, testing for API integrations, batch processing, file management, and UI components

## Editor
- Open folder: sesh-use
