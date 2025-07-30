#!/usr/bin/env python3
"""
Script to reset stalled transcription jobs back to pending.
Jobs that are stuck in DOWNLOADING or PROCESSING status after server restart.
"""
import asyncio
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add the current directory to the path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent))

from app.db.base import AsyncSessionLocal
from app.models import TranscriptionJob, JobStatus
from sqlalchemy import select

async def reset_stalled_jobs():
    """Reset jobs that are likely stalled in downloading or processing state."""
    async with AsyncSessionLocal() as db:
        # Find jobs that are in downloading or processing state
        # These could be stalled if the server was restarted
        result = await db.execute(
            select(TranscriptionJob)
            .where(TranscriptionJob.status.in_([JobStatus.DOWNLOADING, JobStatus.PROCESSING]))
        )
        stalled_jobs = result.scalars().all()
        
        if not stalled_jobs:
            print("No stalled jobs found.")
            return
        
        print(f"Found {len(stalled_jobs)} potentially stalled jobs:")
        for job in stalled_jobs:
            started_at = job.started_at.strftime("%Y-%m-%d %H:%M:%S") if job.started_at else "Unknown"
            print(f"  Job {job.id}: {job.status.value} (started: {started_at}, progress: {job.progress_percentage}%)")
        
        # Reset them to pending state
        for job in stalled_jobs:
            job.status = JobStatus.PENDING
            job.progress_percentage = 0
            job.started_at = None
            job.error_message = None
            print(f"  Reset job {job.id} to pending")
        
        await db.commit()
        
        print(f"\nReset {len(stalled_jobs)} stalled jobs back to pending.")
        print("You can now retry these jobs from the UI.")

if __name__ == "__main__":
    asyncio.run(reset_stalled_jobs())