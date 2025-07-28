# YouTube Transcription Tool - Backend

FastAPI-based backend for the YouTube transcription tool.

## Setup

1. Install dependencies:
   ```bash
   uv sync --dev
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your API keys:
   - YouTube Data API v3 key
   - Deepgram API key

## Development

Run the development server:
```bash
uv run uvicorn main:app --reload
```

Run tests:
```bash
uv run pytest
```

Run linting:
```bash
uv run ruff check .
uv run ruff format .
```

Type checking:
```bash
uv run mypy .
```

## Project Structure

- `app/` - Main application code
  - `api/` - API routes and endpoints
  - `core/` - Core configuration and utilities
  - `domains/` - Domain-specific modules (channels, videos, transcription_jobs)
  - `services/` - Business logic services
  - `db/` - Database configuration and utilities
- `tests/` - Test files
- `alembic/` - Database migrations
