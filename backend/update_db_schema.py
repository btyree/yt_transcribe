#!/usr/bin/env python3
"""
Database schema update script for transcription features.
Run this to add new columns to existing tables.
"""

import asyncio
import sqlite3
from pathlib import Path


async def update_database_schema():
    """Update the database schema to add new transcription-related columns."""
    db_path = Path("yt_transcribe.db")
    
    if not db_path.exists():
        print("Database doesn't exist yet. It will be created with the new schema.")
        return
    
    print("Updating database schema...")
    
    # Connect to SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Add video_file_path and audio_file_path to videos table
        cursor.execute("PRAGMA table_info(videos)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if "video_file_path" not in columns:
            cursor.execute("ALTER TABLE videos ADD COLUMN video_file_path VARCHAR(500)")
            print("Added video_file_path column to videos table")
        else:
            print("video_file_path column already exists in videos table")
            
        if "audio_file_path" not in columns:
            cursor.execute("ALTER TABLE videos ADD COLUMN audio_file_path VARCHAR(500)")
            print("Added audio_file_path column to videos table")
        else:
            print("audio_file_path column already exists in videos table")
        
        # Add transcript_content and deepgram_response to transcription_jobs table
        cursor.execute("PRAGMA table_info(transcription_jobs)")
        job_columns = [column[1] for column in cursor.fetchall()]
        
        if "transcript_content" not in job_columns:
            cursor.execute("ALTER TABLE transcription_jobs ADD COLUMN transcript_content TEXT")
            print("Added transcript_content column to transcription_jobs table")
        else:
            print("transcript_content column already exists in transcription_jobs table")
            
        if "deepgram_response" not in job_columns:
            cursor.execute("ALTER TABLE transcription_jobs ADD COLUMN deepgram_response TEXT")
            print("Added deepgram_response column to transcription_jobs table")
        else:
            print("deepgram_response column already exists in transcription_jobs table")
        
        # Commit changes
        conn.commit()
        print("Database schema updated successfully!")
        
    except Exception as e:
        print(f"Error updating database schema: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    asyncio.run(update_database_schema())