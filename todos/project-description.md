# Project: YouTube Transcription Tool
A simple, single-user internal application that automates the transcription of YouTube videos from specific channels using AI-powered speech-to-text technology.

## Features
✅ **Implemented**:
- Channel-based video discovery from YouTube URLs
- Channel library with add/manage functionality
- Video list display with metadata (title, duration, views, upload date)
- Single video transcription via direct URL input
- RESTful API with FastAPI backend
- SQLite database for local data persistence
- React frontend with TypeScript
- Health checking and API integration
- Job status tracking for transcription workflows

🚧 **In Progress/Planned**:
- Batch transcription processing
- Multiple output formats: TXT, SRT, and VTT
- Progress tracking for transcription jobs
- File management for transcript organization

*Note: This is designed as a simple, single-user internal tool - prioritizing ease of use over complex features.*

## Tech Stack
**Status**: Core functionality implemented, transcription features in progress
**Technologies**:
- Frontend: React + TypeScript with Vite, TailwindCSS, React Query
- Backend: FastAPI (Python) with uvicorn
- Database: SQLite with SQLAlchemy ORM
- APIs: YouTube Data API v3, Deepgram Speech-to-Text API
- Audio Processing: yt-dlp + ffmpeg

## Structure
**Current Implementation**:
- Frontend: React components for channel/video management, modern UI with Catalyst components
- Backend: FastAPI with modular route structure (health, channels, videos, transcription)
- Database: SQLAlchemy models for channels, videos, transcription jobs
- Services: YouTube API integration, video discovery, transcription service
- File storage: Local filesystem for video/audio/transcript files

## Architecture
**Current**: React/TypeScript frontend communicating with FastAPI backend via REST APIs. SQLite database handles metadata and job tracking. Local filesystem storage for media files. Simple, maintainable architecture optimized for single-user operation.

## Commands
**Backend**:
- Start: `cd backend && python run.py` (starts FastAPI with uvicorn)
- Database init: `cd backend && python simple_db_init.py`
- Test: `cd backend && python -m pytest tests/`
- Lint: `cd backend && ruff check .` and `ruff format .`

**Frontend**:
- Start: `cd frontend && npm run dev` (Vite dev server)
- Build: `cd frontend && npm run build`
- Test: `cd frontend && npm run test` (Vitest)
- Lint: `cd frontend && npm run lint` (ESLint + Prettier)
- Type check: `cd frontend && npm run type-check`

## Testing
**Configured**:
- Backend: pytest with async support, integration tests for YouTube API
- Frontend: Vitest + React Testing Library + jsdom
- Test coverage includes API routes, service functions, and React components

## Editor
- Open folder: sesh connect
