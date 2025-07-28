# Codebase Analysis for Project Setup and Architecture Design

## Current Codebase Structure Analysis

Perfect! Now I have a comprehensive understanding of the current codebase structure. Let me provide a detailed analysis.

## Comprehensive Codebase Analysis for YouTube Transcription Tool

Based on my analysis of the current project structure, here's what I found:

### 1. Current Files and Directory Structure

**Project Root**: `/Users/m2btmacbook/dev/yt-transcribe/`

**Current Structure**:
```
yt-transcribe/
├── .git/                    # Git repository
├── .gitignore              # Comprehensive gitignore (Python + Node.js)
├── PRD.md                  # Product Requirements Document (20,524 lines)
└── todos/                  # Todo management system
    ├── worktrees/
    │   └── 2025-07-28-08-43-25-project-setup-and-architecture-design/
    │       ├── .gitignore   # Same as root
    │       ├── PRD.md       # Same as root
    │       ├── task.md      # Current task description
    │       └── todos/
    │           ├── project-description.md
    │           └── todos.md
    ├── done/
    ├── project-description.md
    ├── todos.md
    └── work/
```

### 2. Development Setup Status

**Currently**: No development setup exists. The project is in the planning/documentation phase only.

**What's Missing**:
- No package managers configuration (`package.json`, `requirements.txt`, `pyproject.toml`)
- No Python or JavaScript/TypeScript code files
- No backend/ or frontend/ directories
- No database files or configuration
- No development tooling configuration (ESLint, Prettier, etc.)
- No testing framework setup
- No environment configuration files

### 3. Configuration Files Analysis

**Existing**:
- **`.gitignore`**: Comprehensive and well-structured, covering:
  - Python development (virtual environments, caches, build artifacts)
  - Node.js/Frontend (node_modules, build files, package lock files)
  - Environment variables and secrets
  - Audio/video processing files
  - Database files
  - IDE configurations (VS Code, PyCharm)
  - OS-specific files (macOS, Windows, Linux)
  - Project-specific exclusions (audio cache, downloads, transcripts)

**Missing**:
- `package.json` - No Node.js/React frontend setup
- `requirements.txt` or `pyproject.toml` - No Python dependencies defined
- `poetry.lock` or `Pipfile.lock` - No dependency management
- Environment configuration files (`.env.example`)
- Development tooling configs (ESLint, Prettier, TypeScript, etc.)
- Database configuration files
- Docker configuration (if needed)

### 4. Project Architecture Plan

Based on the PRD and documentation, the planned structure should be:

**Frontend**: React with TypeScript using Vite
- Modern build tooling
- Type safety with TypeScript
- Component-based architecture for video selection, progress tracking

**Backend**: Python FastAPI with SQLAlchemy ORM
- RESTful API design
- Async processing capabilities
- Database ORM for job tracking

**Database**: SQLite with planned schema:
- Channels table (channel metadata)
- Videos table (video information)
- Transcription_Jobs table (batch job tracking)

**APIs**:
- YouTube Data API v3 integration
- Deepgram Speech-to-Text API integration
- Audio extraction via yt-dlp

### 5. Current Code Status

**Python Code**: None exists
**JavaScript/TypeScript Code**: None exists
**Database Code**: None exists

### 6. Next Steps Required for Project Setup

The project needs complete initialization:

1. **Backend Setup**:
   - Create `backend/` directory structure
   - Set up FastAPI project with `pyproject.toml` or `requirements.txt`
   - Configure SQLAlchemy models
   - Set up development tooling (pylint, black, mypy)

2. **Frontend Setup**:
   - Create `frontend/` directory structure
   - Initialize React + TypeScript project with Vite
   - Configure ESLint, Prettier, TypeScript
   - Set up development and build scripts

3. **Development Environment**:
   - Create virtual environment for Python
   - Install Node.js dependencies
   - Set up concurrent development servers
   - Configure environment variables

4. **Database Initialization**:
   - Create SQLite database schema
   - Set up migration system
   - Create initial data models

### 7. Project Status Summary

**Current State**: Pre-development planning phase
**Documentation**: Comprehensive PRD completed (20,524 lines)
**Code Implementation**: 0% - No code files exist
**Development Environment**: Not configured
**Dependencies**: Not defined
**Architecture**: Well-planned but not implemented

The project has excellent planning documentation but requires complete development environment setup and initial code scaffolding before development can begin. The gitignore file shows good preparation for both Python and Node.js development, indicating readiness for the planned tech stack implementation.

The immediate task should focus on creating the basic project structure, setting up development tooling, and initializing both frontend and backend components as outlined in the current task description.

## FastAPI SQLAlchemy Setup Research

Based on my research of FastAPI and SQLAlchemy best practices, and understanding your YouTube transcription tool project, I'll provide comprehensive recommendations for setting up a production-ready FastAPI backend with SQLAlchemy ORM.

## 1. Recommended Project Structure for FastAPI + SQLAlchemy

Based on the FastAPI best practices research, here's the recommended domain-driven project structure for your YouTube transcription tool:

```
backend/
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
├── src/
│   ├── auth/                   # Authentication domain (if needed)
│   │   ├── router.py
│   │   ├── schemas.py          # Pydantic models
│   │   ├── models.py           # SQLAlchemy models
│   │   ├── service.py
│   │   └── dependencies.py
│   ├── channels/               # YouTube channels domain
│   │   ├── router.py
│   │   ├── schemas.py
│   │   ├── models.py
│   │   ├── service.py
│   │   ├── dependencies.py
│   │   └── youtube_client.py
│   ├── videos/                 # Video management domain
│   │   ├── router.py
│   │   ├── schemas.py
│   │   ├── models.py
│   │   ├── service.py
│   │   └── dependencies.py
│   ├── transcription_jobs/     # Transcription processing domain
│   │   ├── router.py
│   │   ├── schemas.py
│   │   ├── models.py
│   │   ├── service.py
│   │   ├── dependencies.py
│   │   ├── deepgram_client.py
│   │   └── workers.py          # Background task workers
│   ├── config.py               # Global configuration
│   ├── database.py             # Database connection
│   ├── models.py               # Global/shared models
│   ├── exceptions.py           # Global exceptions
│   ├── dependencies.py         # Global dependencies
│   └── main.py                 # FastAPI app initialization
├── tests/
│   ├── channels/
│   ├── videos/
│   ├── transcription_jobs/
│   └── conftest.py
├── requirements/
│   ├── base.txt
│   ├── dev.txt
│   └── prod.txt
├── .env
├── .env.example
├── alembic.ini
├── pyproject.toml
└── README.md
```

## 2. Essential Dependencies and Package Versions

### requirements/base.txt (Core dependencies)
```txt
# Core Framework
fastapi==0.115.0
uvicorn[standard]==0.30.0

# Database & ORM
sqlalchemy==2.0.25
asyncpg==0.29.0                # Async PostgreSQL driver
alembic==1.13.0               # Database migrations

# Alternative: SQLModel (combines SQLAlchemy + Pydantic)
# sqlmodel==0.0.14

# Data Validation & Serialization
pydantic==2.5.0
pydantic-settings==2.1.0

# HTTP Client for API calls
httpx==0.26.0

# Background Tasks
celery==5.3.0                 # For heavy transcription jobs
redis==5.0.0                  # Task queue backend

# File Operations
aiofiles==23.2.0
python-multipart==0.0.6      # File uploads

# Environment Configuration
python-dotenv==1.0.0

# YouTube Integration
yt-dlp==2023.12.30           # YouTube video downloading
google-api-python-client==2.110.0  # YouTube Data API

# Audio/Video Processing
ffmpeg-python==0.2.0

# Transcription Service
deepgram-sdk==3.2.0          # Deepgram Speech-to-Text

# Utilities
python-dateutil==2.8.2
```

### requirements/dev.txt (Development dependencies)
```txt
-r base.txt

# Testing
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-mock==3.12.0
httpx==0.26.0                 # For async test client

# Code Quality
ruff==0.1.8                   # Fast linter & formatter (replaces black, isort, flake8)
mypy==1.7.0                   # Type checking
pre-commit==3.6.0             # Git hooks

# Development Tools
ipython==8.18.1
```

### requirements/prod.txt (Production-specific)
```txt
-r base.txt

# Production Server
gunicorn==21.2.0

# Monitoring & Logging
sentry-sdk[fastapi]==1.39.1

# Security
cryptography==41.0.8
```

## 3. Database Model Design Patterns

### Channels Model
```python
# src/channels/models.py
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from src.database import Base

class Channel(Base):
    __tablename__ = "channels"

    id: Mapped[int] = mapped_column(primary_key=True)
    youtube_channel_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    handle: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    subscriber_count: Mapped[Optional[int]] = mapped_column(nullable=True)
    video_count: Mapped[Optional[int]] = mapped_column(nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationships
    videos: Mapped[List["Video"]] = relationship("Video", back_populates="channel")

    def __repr__(self) -> str:
        return f"Channel(id={self.id!r}, name={self.name!r})"
```

### Videos Model
```python
# src/videos/models.py
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Interval
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from src.database import Base

class Video(Base):
    __tablename__ = "videos"

    id: Mapped[int] = mapped_column(primary_key=True)
    youtube_video_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    channel_id: Mapped[int] = mapped_column(ForeignKey("channels.id"), nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration: Mapped[Optional[timedelta]] = mapped_column(Interval, nullable=True)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    view_count: Mapped[Optional[int]] = mapped_column(nullable=True)
    like_count: Mapped[Optional[int]] = mapped_column(nullable=True)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    audio_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Downloaded audio file path
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationships
    channel: Mapped["Channel"] = relationship("Channel", back_populates="videos")
    transcription_jobs: Mapped[List["TranscriptionJob"]] = relationship(
        "TranscriptionJob",
        back_populates="video"
    )

    def __repr__(self) -> str:
        return f"Video(id={self.id!r}, title={self.title!r})"
```

### Transcription Jobs Model
```python
# src/transcription_jobs/models.py
from datetime import datetime
from enum import Enum
from typing import Optional, Dict, Any
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from src.database import Base

class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class OutputFormat(str, Enum):
    TXT = "txt"
    SRT = "srt"
    VTT = "vtt"

class TranscriptionJob(Base):
    __tablename__ = "transcription_jobs"

    id: Mapped[int] = mapped_column(primary_key=True)
    video_id: Mapped[int] = mapped_column(ForeignKey("videos.id"), nullable=False)
    status: Mapped[JobStatus] = mapped_column(default=JobStatus.PENDING)
    output_formats: Mapped[List[OutputFormat]] = mapped_column(JSON, nullable=False)  # ["txt", "srt", "vtt"]

    # Processing details
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    processing_duration: Mapped[Optional[int]] = mapped_column(nullable=True)  # seconds

    # Results
    transcript_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    output_files: Mapped[Optional[Dict[str, str]]] = mapped_column(JSON, nullable=True)  # {"txt": "/path/file.txt"}

    # Error handling
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(default=0)
    max_retries: Mapped[int] = mapped_column(default=3)

    # Metadata
    deepgram_request_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    audio_duration: Mapped[Optional[int]] = mapped_column(nullable=True)  # seconds
    word_count: Mapped[Optional[int]] = mapped_column(nullable=True)
    confidence_score: Mapped[Optional[float]] = mapped_column(nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    # Relationships
    video: Mapped["Video"] = relationship("Video", back_populates="transcription_jobs")

    def __repr__(self) -> str:
        return f"TranscriptionJob(id={self.id!r}, status={self.status!r})"
```

## 4. FastAPI Configuration and Setup Patterns

### Database Configuration (src/database.py)
```python
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData
from typing import AsyncGenerator
from src.config import settings

# PostgreSQL naming conventions for better readability
POSTGRES_INDEXES_NAMING_CONVENTION = {
    "ix": "%(column_0_label)s_idx",
    "uq": "%(table_name)s_%(column_0_name)s_key",
    "ck": "%(table_name)s_%(constraint_name)s_check",
    "fk": "%(table_name)s_%(column_0_name)s_fkey",
    "pk": "%(table_name)s_pkey"
}

metadata = MetaData(naming_convention=POSTGRES_INDEXES_NAMING_CONVENTION)

class Base(DeclarativeBase):
    metadata = metadata

# Async engine for PostgreSQL
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Dependency for getting DB session
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Type alias for dependency injection
from typing import Annotated
from fastapi import Depends
SessionDep = Annotated[AsyncSession, Depends(get_session)]
```

### Configuration (src/config.py)
```python
from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: PostgresDsn

    # API Keys
    YOUTUBE_API_KEY: str
    DEEPGRAM_API_KEY: str

    # Application
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "YouTube Transcription API"

    # File Storage
    STORAGE_PATH: str = "./storage"
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB

    # Background Tasks
    REDIS_URL: str = "redis://localhost:6379"
    CELERY_BROKER_URL: str = "redis://localhost:6379"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379"

    # Transcription Settings
    MAX_CONCURRENT_JOBS: int = 50
    JOB_TIMEOUT: int = 3600  # 1 hour

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
```

### Main Application (src/main.py)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.config import settings
from src.database import engine, Base
from src.channels.router import router as channels_router
from src.videos.router import router as videos_router
from src.transcription_jobs.router import router as transcription_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(channels_router, prefix=f"{settings.API_V1_STR}/channels", tags=["channels"])
app.include_router(videos_router, prefix=f"{settings.API_V1_STR}/videos", tags=["videos"])
app.include_router(transcription_router, prefix=f"{settings.API_V1_STR}/transcription", tags=["transcription"])

@app.get("/")
async def root():
    return {"message": "YouTube Transcription API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

## 5. SQLAlchemy Async vs Sync Considerations

**Recommendation: Use Async SQLAlchemy**

For your YouTube transcription tool, async SQLAlchemy is recommended because:

### Benefits of Async SQLAlchemy:
- **Non-blocking I/O**: Perfect for handling multiple transcription jobs simultaneously
- **Better resource utilization**: Efficient handling of API calls to YouTube and Deepgram
- **Scalability**: Can handle many concurrent requests without thread exhaustion
- **FastAPI Integration**: Native async support aligns perfectly with FastAPI's async nature

### Async Implementation Example:
```python
# src/videos/service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from src.videos.models import Video
from src.channels.models import Channel

class VideoService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_videos_by_channel(
        self,
        channel_id: int,
        limit: int = 50,
        offset: int = 0
    ) -> list[Video]:
        stmt = (
            select(Video)
            .options(selectinload(Video.channel))
            .where(Video.channel_id == channel_id)
            .limit(limit)
            .offset(offset)
            .order_by(Video.published_at.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def create_video(self, video_data: dict) -> Video:
        video = Video(**video_data)
        self.session.add(video)
        await self.session.commit()
        await self.session.refresh(video)
        return video
```

## 6. Development Tooling Setup

### pyproject.toml (Modern Python packaging)
```toml
[build-system]
requires = ["setuptools>=45", "wheel", "setuptools_scm[toml]>=6.2"]

[project]
name = "youtube-transcription-api"
description = "FastAPI backend for YouTube video transcription"
authors = [{name = "Your Name", email = "your.email@example.com"}]
license = {text = "MIT"}
requires-python = ">=3.11"
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
]
dynamic = ["version"]

[tool.ruff]
target-version = "py311"
line-length = 88
select = [
    "E",  # pycodestyle errors
    "W",  # pycodestyle warnings
    "F",  # pyflakes
    "I",  # isort
    "B",  # flake8-bugbear
    "C4", # flake8-comprehensions
    "UP", # pyupgrade
]
ignore = [
    "E501",  # line too long, handled by black
    "B008",  # do not perform function calls in argument defaults
    "C901",  # too complex
]

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]

[tool.ruff.isort]
known-first-party = ["src"]

[tool.mypy]
python_version = "3.11"
check_untyped_defs = true
disallow_any_generics = true
disallow_incomplete_defs = true
disallow_untyped_defs = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true

[[tool.mypy.overrides]]
module = [
    "deepgram.*",
    "yt_dlp.*",
    "google.oauth2.*",
    "googleapiclient.*",
]
ignore_missing_imports = true

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_functions = ["test_*"]
addopts = "-v --tb=short --strict-markers"
markers = [
    "slow: marks tests as slow (deselect with '-m \"not slow\"')",
    "integration: marks tests as integration tests",
]
asyncio_mode = "auto"
```

### Pre-commit Configuration (.pre-commit-config.yaml)
```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.8
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.7.0
    hooks:
      - id: mypy
        additional_dependencies: [types-all]
        args: [--strict]

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
```

### Development Scripts
Create a `scripts/` directory with useful development commands:

**scripts/format.sh**
```bash
#!/bin/bash
set -e

echo "Running ruff check and format..."
ruff check --fix src tests
ruff format src tests

echo "Running mypy..."
mypy src
```

**scripts/test.sh**
```bash
#!/bin/bash
set -e

echo "Running tests..."
pytest tests/ -v

echo "Running integration tests..."
pytest tests/ -m integration -v
```

This comprehensive setup provides a solid foundation for a production-ready FastAPI backend with SQLAlchemy ORM, following modern Python development practices and specifically tailored for your YouTube transcription tool requirements.

## React TypeScript Vite Setup Research

Based on my research of the latest documentation and best practices, I'll provide you with comprehensive recommendations for setting up a React/TypeScript frontend using Vite for your YouTube transcription tool.

## 1. Recommended Project Structure for React + TypeScript + Vite

Here's a scalable project structure that follows current best practices:

```
youtube-transcriber-frontend/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── manifest.json
├── src/
│   ├── assets/                    # Static assets (images, icons, fonts)
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── components/                # Reusable UI components
│   │   ├── ui/                   # Basic UI components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   ├── Button.module.css
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   └── Spinner/
│   │   └── layout/               # Layout components
│   │       ├── Header/
│   │       ├── Sidebar/
│   │       └── Footer/
│   ├── features/                 # Feature-based organization
│   │   ├── transcription/
│   │   │   ├── components/       # Feature-specific components
│   │   │   │   ├── TranscriptionPlayer/
│   │   │   │   ├── TranscriptionEditor/
│   │   │   │   └── TranscriptionList/
│   │   │   ├── hooks/           # Feature-specific hooks
│   │   │   │   ├── useTranscription.ts
│   │   │   │   └── useTranscriptionPlayer.ts
│   │   │   ├── services/        # Feature API services
│   │   │   │   └── transcriptionApi.ts
│   │   │   └── types/           # Feature type definitions
│   │   │       └── transcription.types.ts
│   │   ├── youtube/
│   │   │   ├── components/
│   │   │   │   ├── VideoInput/
│   │   │   │   └── VideoPreview/
│   │   │   ├── hooks/
│   │   │   │   └── useYouTubeApi.ts
│   │   │   ├── services/
│   │   │   │   └── youtubeApi.ts
│   │   │   └── types/
│   │   │       └── youtube.types.ts
│   │   └── auth/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── types/
│   ├── hooks/                    # Global custom hooks
│   │   ├── useAuth.ts
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   ├── pages/                    # Route-level components
│   │   ├── Home/
│   │   │   ├── Home.tsx
│   │   │   ├── Home.test.tsx
│   │   │   └── index.ts
│   │   ├── Dashboard/
│   │   ├── Transcribe/
│   │   └── Profile/
│   ├── services/                 # Global API services
│   │   ├── api.ts               # Base API configuration
│   │   ├── httpClient.ts        # HTTP client setup
│   │   └── endpoints.ts         # API endpoints
│   ├── store/                    # State management (if using Redux/Zustand)
│   │   ├── index.ts
│   │   ├── authSlice.ts
│   │   └── transcriptionSlice.ts
│   ├── styles/                   # Global styles
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── components.css
│   ├── types/                    # Global type definitions
│   │   ├── index.ts
│   │   ├── api.types.ts
│   │   └── common.types.ts
│   ├── utils/                    # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── config/                   # Configuration files
│   │   ├── env.ts
│   │   └── constants.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── eslint.config.js
├── prettier.config.js
├── package.json
└── README.md
```

## 2. Essential Dependencies and DevDependencies

### Dependencies (package.json):
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.1",
    "axios": "^1.7.7",
    "clsx": "^2.1.1",
    "lucide-react": "^0.445.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "typescript": "~5.6.2",
    "vite": "^5.4.10",
    "@typescript-eslint/eslint-plugin": "^8.15.0",
    "@typescript-eslint/parser": "^8.15.0",
    "eslint": "^9.14.0",
    "eslint-plugin-react": "^7.37.2",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.14",
    "prettier": "^3.3.3",
    "eslint-config-prettier": "^9.1.0",
    "@testing-library/react": "^16.0.1",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/user-event": "^14.5.2",
    "vitest": "^2.1.4",
    "jsdom": "^25.0.1"
  }
}
```

## 3. Vite Configuration

### vite.config.ts:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/config': path.resolve(__dirname, './src/config'),
    }
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  }
})
```

## 4. TypeScript Configuration

### tsconfig.json:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "allowJs": false,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/features/*": ["./src/features/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/services/*": ["./src/services/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/pages/*": ["./src/pages/*"],
      "@/assets/*": ["./src/assets/*"],
      "@/config/*": ["./src/config/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### tsconfig.node.json:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts"]
}
```

## 5. Development Tooling Setup

### ESLint Configuration (eslint.config.js):
```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: '18.3'
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      react,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
)
```

### Prettier Configuration (prettier.config.js):
```javascript
/** @type {import("prettier").Config} */
const config = {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 80,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  importOrder: [
    '^react$',
    '^react-dom$',
    '<THIRD_PARTY_MODULES>',
    '^@/(.*)$',
    '^[./]'
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}

export default config
```

## 6. Folder Organization Guidelines

### Components Structure:
- **ui/**: Basic, reusable UI components (Button, Input, Modal)
- **layout/**: Layout-specific components (Header, Sidebar, Footer)
- **feature-specific**: Components that belong to specific features

### Features Structure:
Each feature should be self-contained with its own:
- `components/`: Feature-specific components
- `hooks/`: Feature-specific custom hooks
- `services/`: Feature-specific API calls
- `types/`: Feature-specific TypeScript types

### Best Practices:
1. Use index files for clean imports: `export { Button } from './Button'`
2. Co-locate tests with components: `Button.test.tsx` next to `Button.tsx`
3. Use CSS Modules or styled-components for styling
4. Keep components small and focused on a single responsibility

## 7. Integration Patterns with FastAPI Backend

### API Service Layer:
```typescript
// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

class ApiService {
  private client: AxiosInstance

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor for auth tokens
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('authToken')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }
}

export const apiService = new ApiService(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000')
```

### Type-Safe API Integration:
```typescript
// src/types/api.types.ts
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

export interface TranscriptionRequest {
  youtube_url: string
  language?: string
}

export interface TranscriptionResponse {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  text?: string
  created_at: string
  updated_at: string
}

// src/features/transcription/services/transcriptionApi.ts
import { apiService } from '@/services/api'
import type { ApiResponse, TranscriptionRequest, TranscriptionResponse } from '@/types/api.types'

export const transcriptionApi = {
  create: (data: TranscriptionRequest): Promise<ApiResponse<TranscriptionResponse>> =>
    apiService.post('/api/transcriptions', data),

  getById: (id: string): Promise<ApiResponse<TranscriptionResponse>> =>
    apiService.get(`/api/transcriptions/${id}`),

  getAll: (): Promise<ApiResponse<TranscriptionResponse[]>> =>
    apiService.get('/api/transcriptions'),

  delete: (id: string): Promise<ApiResponse<void>> =>
    apiService.delete(`/api/transcriptions/${id}`),
}
```

### Environment Variables Setup:
```typescript
// src/config/env.ts
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_YOUTUBE_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  appTitle: import.meta.env.VITE_APP_TITLE || 'YouTube Transcriber',
  youtubeApiKey: import.meta.env.VITE_YOUTUBE_API_KEY || '',
} as const
```

This structure provides a solid foundation for your YouTube transcription tool that's scalable, maintainable, and follows current React/TypeScript/Vite best practices. The feature-based organization will help keep related code together as your application grows, while the clear separation of concerns makes testing and maintenance much easier.
