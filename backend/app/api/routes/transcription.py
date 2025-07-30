from datetime import datetime
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.base import get_db
from app.models import Channel, JobStatus, TranscriptFormat, TranscriptionJob, Video
from app.services.transcription_service import transcription_service

router = APIRouter(prefix="/transcription", tags=["transcription"])


class TranscriptionJobCreate(BaseModel):
    """Request model for creating a transcription job."""

    video_id: int
    format: TranscriptFormat = TranscriptFormat.TXT
    output_file_name: Optional[str] = None


class ChannelInfo(BaseModel):
    """Channel information for responses."""
    id: int
    title: str
    youtube_id: str
    url: str
    
    class Config:
        from_attributes = True


class VideoInfo(BaseModel):
    """Video information for transcription response."""
    id: int
    youtube_id: str
    title: str
    url: str
    thumbnail_url: Optional[str] = None
    duration_seconds: Optional[int] = None
    view_count: Optional[int] = None
    published_at: Optional[datetime] = None
    channel: Optional[ChannelInfo] = None

    class Config:
        from_attributes = True


class TranscriptionJobResponse(BaseModel):
    """Response model for transcription job."""

    id: int
    video_id: int
    status: JobStatus
    format: TranscriptFormat
    output_file_path: Optional[str] = None
    transcript_content: Optional[str] = None
    deepgram_response: Optional[str] = None
    error_message: Optional[str] = None
    progress_percentage: int
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    video: Optional[VideoInfo] = None

    class Config:
        from_attributes = True


class VideoTranscriptionInfo(BaseModel):
    """Video info with transcription jobs."""

    id: int
    youtube_id: str
    title: str
    url: str
    transcription_jobs: list[TranscriptionJobResponse]

    class Config:
        from_attributes = True


def background_transcribe(job_id: int) -> None:
    """Background task to process transcription job."""
    import asyncio
    from app.db.base import AsyncSessionLocal
    
    print(f"Starting background transcription for job {job_id}")
    
    async def process_job():
        try:
            print(f"Creating database session for job {job_id}")
            # Create a new database session for the background task
            async with AsyncSessionLocal() as db:
                # Get job and video with channel relationship
                result = await db.execute(
                    select(TranscriptionJob)
                    .options(
                        selectinload(TranscriptionJob.video).selectinload(Video.channel)
                    )
                    .where(TranscriptionJob.id == job_id)
                )
                job = result.scalar_one_or_none()

                if not job:
                    print(f"Job {job_id} not found")
                    return
                
                print(f"Found job {job_id}, video: {job.video.title if job.video else 'No video'}")
                await transcription_service.process_transcription_job(job, job.video, db)
                print(f"Transcription completed for job {job_id}")

        except Exception as e:
            print(f"Background transcription failed for job {job_id}: {e}")
            import traceback
            traceback.print_exc()
    
    # Run the async function synchronously
    try:
        asyncio.run(process_job())
    except Exception as e:
        print(f"Failed to run background task for job {job_id}: {e}")
        import traceback
        traceback.print_exc()


@router.post("/jobs", response_model=TranscriptionJobResponse)
async def create_transcription_job(
    job_data: TranscriptionJobCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Create a new transcription job."""
    # Verify video exists
    result = await db.execute(select(Video).where(Video.id == job_data.video_id))
    video = result.scalar_one_or_none()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Create output file path if requested
    output_file_path = None
    if job_data.output_file_name:
        output_file_path = f"{video.youtube_id}_{job_data.output_file_name}.{job_data.format.value}"

    # Create transcription job
    job = TranscriptionJob(
        video_id=job_data.video_id,
        format=job_data.format,
        output_file_path=output_file_path,
        status=JobStatus.PENDING,
    )

    db.add(job)
    await db.commit()
    await db.refresh(job)

    # Load the video relationship and its channel for the response
    result = await db.execute(
        select(TranscriptionJob)
        .options(
            selectinload(TranscriptionJob.video).selectinload(Video.channel)
        )
        .where(TranscriptionJob.id == job.id)
    )
    job_with_video = result.scalar_one()

    # Start background transcription
    background_tasks.add_task(background_transcribe, job.id)

    return job_with_video


@router.get("/jobs/{job_id}", response_model=TranscriptionJobResponse)
async def get_transcription_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get transcription job by ID."""
    result = await db.execute(
        select(TranscriptionJob)
        .options(
            selectinload(TranscriptionJob.video).selectinload(Video.channel)
        )
        .where(TranscriptionJob.id == job_id)
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(status_code=404, detail="Transcription job not found")

    return job


@router.get("/jobs", response_model=list[TranscriptionJobResponse])
async def list_transcription_jobs(
    status: Optional[JobStatus] = None,
    video_id: Optional[int] = None,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    """List transcription jobs with optional filtering."""
    query = (
        select(TranscriptionJob)
        .options(
            selectinload(TranscriptionJob.video).selectinload(Video.channel)
        )
        .order_by(TranscriptionJob.created_at.desc())
    )

    if status:
        query = query.where(TranscriptionJob.status == status)
    if video_id:
        query = query.where(TranscriptionJob.video_id == video_id)

    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    jobs = result.scalars().all()

    return jobs


@router.delete("/jobs/{job_id}")
async def cancel_transcription_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Cancel a transcription job."""
    result = await db.execute(
        select(TranscriptionJob).where(TranscriptionJob.id == job_id)
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(status_code=404, detail="Transcription job not found")

    if job.status in [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED]:
        raise HTTPException(
            status_code=400, detail=f"Cannot cancel job with status: {job.status}"
        )

    job.status = JobStatus.CANCELLED
    job.completed_at = datetime.utcnow()
    await db.commit()

    return {"message": "Job cancelled successfully"}


@router.post("/jobs/{job_id}/retry", response_model=TranscriptionJobResponse)
async def retry_transcription_job(
    job_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Retry a failed transcription job."""
    result = await db.execute(
        select(TranscriptionJob)
        .options(
            selectinload(TranscriptionJob.video).selectinload(Video.channel)
        )
        .where(TranscriptionJob.id == job_id)
    )
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(status_code=404, detail="Transcription job not found")

    if job.status not in [JobStatus.FAILED, JobStatus.CANCELLED]:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot retry job with status: {job.status}. Only failed or cancelled jobs can be retried."
        )

    # Reset job to pending state
    job.status = JobStatus.PENDING
    job.error_message = None
    job.progress_percentage = 0
    job.started_at = None
    job.completed_at = None
    job.transcript_content = None
    job.deepgram_response = None
    
    await db.commit()
    await db.refresh(job)

    # Start background transcription
    background_tasks.add_task(background_transcribe, job.id)

    return job


@router.get("/videos/{video_id}", response_model=VideoTranscriptionInfo)
async def get_video_transcription_info(
    video_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get video information with all transcription jobs."""
    result = await db.execute(
        select(Video)
        .options(selectinload(Video.transcription_jobs))
        .where(Video.id == video_id)
    )
    video = result.scalar_one_or_none()

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    return video