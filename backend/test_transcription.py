#!/usr/bin/env python3
"""
Test script for transcription service functionality.
"""

import asyncio
from pathlib import Path

from app.core.config import settings


async def test_configuration():
    """Test that configuration is properly set up."""
    print("Testing configuration...")
    
    print(f"Deepgram API key configured: {'✓' if settings.deepgram_api_key else '✗'}")
    print(f"Temp audio directory: {settings.temp_audio_dir}")
    print(f"Transcript output directory: {settings.transcript_output_dir}")
    
    # Create directories if they don't exist
    Path(settings.temp_audio_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.transcript_output_dir).mkdir(parents=True, exist_ok=True)
    
    print("Directories created/verified ✓")


async def test_import():
    """Test that all modules can be imported."""
    print("\nTesting imports...")
    
    try:
        from app.services.transcription_service import transcription_service
        print("Transcription service import ✓")
        
        from app.api.routes.transcription import router
        print("Transcription API routes import ✓")
        
        from app.models import TranscriptionJob, Video
        print("Database models import ✓")
        
    except Exception as e:
        print(f"Import error: {e}")
        return False
    
    return True


async def main():
    """Run all tests."""
    print("Testing transcription service setup...\n")
    
    await test_configuration()
    success = await test_import()
    
    if success:
        print("\n✅ All tests passed! Transcription service is ready.")
        print("\nNext steps:")
        print("1. Set your DEEPGRAM_API_KEY environment variable")
        print("2. Start the backend server: python run.py")
        print("3. Test creating a transcription job via the API")
    else:
        print("\n❌ Some tests failed. Check the errors above.")


if __name__ == "__main__":
    asyncio.run(main())