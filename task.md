# Simplify the current codebase
**Status:** InProgress
**Agent PID:** 8453

## Original Todo
Simplify the current codebase

## Description
Simplify the current codebase by removing over-engineering and unnecessary complexity. The codebase currently has enterprise-level infrastructure patterns for a personal transcription tool, with duplicate configuration systems, unused dependencies, excessive abstractions, and complex database migrations for a simple SQLite database. The goal is to streamline the codebase to match its actual scope while preserving the working YouTube API integration.

## Implementation Plan
How we are building it:
- [x] Remove pre-commit hooks configuration
- [x] Clean up unused dependencies from pyproject.toml (yt-dlp, deepgram-sdk, greenlet)
- [x] Remove Alembic migration system and files (use simple database creation)
- [x] Consolidate domain architecture (merge models into single models.py)
- [x] Remove redundant entry points (keep only run.py, remove main.py and quick_setup.py)
- [x] Remove placeholder transcription job routes until actual implementation needed
- [x] Consolidate duplicate dev dependencies in pyproject.toml
- [x] Remove root-level test files (keep only tests/ directory structure)
- [ ] Simplify TypeScript configuration (single tsconfig.json)
- [ ] Update imports and dependencies after consolidation
- [ ] Test that YouTube API functionality still works after simplification
- [ ] User test: Verify backend starts and can fetch YouTube channel data

## Notes
[Implementation notes]