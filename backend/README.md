# YouTube Transcription Tool - Backend

FastAPI-based backend for the YouTube transcription tool.

## Setup

1. Install dependencies:
   ```bash
   uv sync --dev
   ```

2. Set up 1Password secrets:
   - Install 1Password CLI: https://developer.1password.com/docs/cli/get-started/
   - Sign in: `op signin`
   - Create a 1Password item named "YT-Transcribe" in your "Private" vault with:
     - `youtube_api_key` field
     - `deepgram_api_key` field
   - Update `.env` file vault/item names if different

3. Initialize database:
   ```bash
   python simple_db_init.py
   ```

## Development

### With 1Password (Recommended)
```bash
./start.sh
```

### Without 1Password (Development)
```bash
uv run python run.py
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
