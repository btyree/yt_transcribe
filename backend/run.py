#!/usr/bin/env python3
"""
Simple run script - just run this to start everything.
"""
import uvicorn

if __name__ == "__main__":
    print("🎬 Starting YouTube Transcription Tool...")
    print("📖 API docs: http://localhost:8000/docs")

    uvicorn.run("app.api.main:app", host="127.0.0.1", port=8000, reload=True, log_level="info")
