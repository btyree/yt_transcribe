"""
Simplified configuration for single-user app.
Just set your API keys here directly or via environment variables.
"""
import os

# API Keys - set these directly or via environment
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "your-youtube-api-key-here")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY", "your-deepgram-api-key-here")

# Database - simple SQLite file
DATABASE_URL = "sqlite+aiosqlite:///./yt_transcribe.db"

# Directories
TRANSCRIPT_DIR = "./transcripts"
TEMP_AUDIO_DIR = "./temp_audio"

# Server
DEBUG = True
PORT = 8000

# CORS - allow common dev ports
ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React
    "http://localhost:5173",  # Vite
    "http://localhost:8080",  # Vue CLI
]

# Limits
MAX_CONCURRENT_JOBS = 3  # Conservative for personal use
