from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_videos():
    """List all videos in the database."""
    return {"message": "Videos endpoint - implementation pending"}


@router.get("/channel/{channel_id}")
async def list_videos_by_channel(channel_id: int):
    """List all videos for a specific channel."""
    return {"message": f"Videos for channel {channel_id} endpoint - implementation pending"}


@router.get("/{video_id}")
async def get_video(video_id: int):
    """Get details of a specific video."""
    return {"message": f"Get video {video_id} endpoint - implementation pending"}


@router.post("/discover")
async def discover_videos():
    """Discover new videos from tracked channels."""
    return {"message": "Discover videos endpoint - implementation pending"}