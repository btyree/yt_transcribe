from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_channels():
    """List all channels in the database."""
    return {"message": "Channels endpoint - implementation pending"}


@router.post("/")
async def create_channel():
    """Add a new YouTube channel to track."""
    return {"message": "Create channel endpoint - implementation pending"}


@router.get("/{channel_id}")
async def get_channel(channel_id: int):
    """Get details of a specific channel."""
    return {"message": f"Get channel {channel_id} endpoint - implementation pending"}


@router.delete("/{channel_id}")
async def delete_channel(channel_id: int):
    """Remove a channel from tracking."""
    return {"message": f"Delete channel {channel_id} endpoint - implementation pending"}