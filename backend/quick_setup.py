#!/usr/bin/env python3
"""
Quick setup script for personal use.
Run this once to get everything working.
"""
import asyncio
import os
from pathlib import Path


async def setup():
    """Set up the app for first use."""
    print("🚀 Setting up YouTube Transcription Tool...")

    # Create directories
    Path("transcripts").mkdir(exist_ok=True)
    Path("temp_audio").mkdir(exist_ok=True)
    print("✓ Created directories")

    # Initialize database
    from simple_db_init import init_db

    await init_db()

    # Check API keys
    youtube_key = os.getenv("YOUTUBE_API_KEY")
    if not youtube_key or youtube_key == "your-youtube-api-key-here":
        print(
            "⚠️  Set your YOUTUBE_API_KEY environment variable or edit app/core/simple_config.py"
        )
    else:
        print("✓ YouTube API key found")

    deepgram_key = os.getenv("DEEPGRAM_API_KEY")
    if not deepgram_key or deepgram_key == "your-deepgram-api-key-here":
        print(
            "⚠️  Set your DEEPGRAM_API_KEY environment variable or edit app/core/simple_config.py"
        )
    else:
        print("✓ Deepgram API key found")

    print("\n✅ Setup complete!")
    print("\nTo start the server:")
    print("  uvicorn main:app --reload")
    print("\nAPI docs: http://localhost:8000/docs")


if __name__ == "__main__":
    asyncio.run(setup())
