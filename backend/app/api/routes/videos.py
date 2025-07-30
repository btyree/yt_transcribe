from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.services.video_service import video_service

router = APIRouter()


class VideoResponse(BaseModel):
    """Response model for video data."""

    id: int
    youtube_id: str
    channel_id: int | None
    title: str
    description: str | None = None
    url: str
    thumbnail_url: str | None = None
    duration_seconds: int | None = None
    view_count: int | None = None
    published_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VideoDiscoveryRequest(BaseModel):
    """Request model for video discovery."""

    channel_youtube_id: str
    max_results: int = 50


class CreateVideoFromUrlRequest(BaseModel):
    """Request model for creating video from URL."""

    url: str


@router.get("/", response_model=list[VideoResponse])
async def list_videos(db: AsyncSession = Depends(get_db)):
    """List all videos in the database."""
    videos = await video_service.get_all_videos(db)
    return [VideoResponse.model_validate(video) for video in videos]


@router.get("/channel/{channel_id}", response_model=list[VideoResponse])
async def list_videos_by_channel(channel_id: int, db: AsyncSession = Depends(get_db)):
    """List all videos for a specific channel."""
    videos = await video_service.get_videos_by_channel_id(db, channel_id)
    return [VideoResponse.model_validate(video) for video in videos]


@router.get("/{video_id}", response_model=VideoResponse)
async def get_video(video_id: int, db: AsyncSession = Depends(get_db)):
    """Get details of a specific video."""
    video = await video_service.get_video_by_id(db, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return VideoResponse.model_validate(video)


@router.post("/discover", response_model=list[VideoResponse])
async def discover_videos(
    request: VideoDiscoveryRequest, db: AsyncSession = Depends(get_db)
):
    """Discover new videos from a specific channel."""
    try:
        discovered_videos = await video_service.discover_videos_for_channel(
            db, request.channel_youtube_id, request.max_results
        )
        return [VideoResponse.model_validate(video) for video in discovered_videos]
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to discover videos: {str(e)}"
        )


@router.post("/create-from-url", response_model=VideoResponse)
async def create_video_from_url(
    request: CreateVideoFromUrlRequest, db: AsyncSession = Depends(get_db)
):
    """Create a video record from a YouTube URL."""
    try:
        video = await video_service.create_video_from_url(db, request.url)
        return VideoResponse.model_validate(video)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to create video from URL: {str(e)}"
        )


@router.get("/{video_id}/file")
async def serve_video_file(video_id: int, db: AsyncSession = Depends(get_db)):
    """Serve the downloaded video file for playback."""
    video = await video_service.get_video_by_id(db, video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    
    if not video.video_file_path or not Path(video.video_file_path).exists():
        raise HTTPException(status_code=404, detail="Video file not found")
    
    return FileResponse(
        path=video.video_file_path,
        media_type="video/mp4",
        filename=f"{video.youtube_id}.mp4"
    )
