#!/usr/bin/env python3
"""
Script to clean up incomplete transcription jobs from the database.
Deletes jobs that are not in COMPLETED status.
"""
import asyncio
import sys
from pathlib import Path

# Add the current directory to the path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent))

from app.db.base import AsyncSessionLocal
from app.models import TranscriptionJob, JobStatus
from sqlalchemy import select, delete

async def cleanup_incomplete_jobs():
    """Delete all transcription jobs that are not completed."""
    async with AsyncSessionLocal() as db:
        # First, let's see what jobs exist
        result = await db.execute(
            select(TranscriptionJob.id, TranscriptionJob.status)
        )
        jobs = result.all()
        
        print(f"Found {len(jobs)} total jobs:")
        for job_id, status in jobs:
            print(f"  Job {job_id}: {status.value}")
        
        # Count incomplete jobs
        incomplete_result = await db.execute(
            select(TranscriptionJob)
            .where(TranscriptionJob.status != JobStatus.COMPLETED)
        )
        incomplete_jobs = incomplete_result.scalars().all()
        
        if not incomplete_jobs:
            print("\nNo incomplete jobs to delete.")
            return
        
        print(f"\nFound {len(incomplete_jobs)} incomplete jobs to delete:")
        for job in incomplete_jobs:
            print(f"  Job {job.id}: {job.status.value}")
        
        # Delete incomplete jobs
        delete_result = await db.execute(
            delete(TranscriptionJob)
            .where(TranscriptionJob.status != JobStatus.COMPLETED)
        )
        
        await db.commit()
        
        print(f"\nDeleted {delete_result.rowcount} incomplete jobs.")
        
        # Show remaining jobs
        remaining_result = await db.execute(
            select(TranscriptionJob.id, TranscriptionJob.status)
        )
        remaining_jobs = remaining_result.all()
        
        print(f"\nRemaining jobs ({len(remaining_jobs)}):")
        for job_id, status in remaining_jobs:
            print(f"  Job {job_id}: {status.value}")

if __name__ == "__main__":
    asyncio.run(cleanup_incomplete_jobs())