"""
FastAPI routes for YouTube channel management.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.domains.channels.services import channel_service


# Request/Response models
class ChannelCreateRequest(BaseModel):
    """Request model for creating a new channel."""

    url: str

    class Config:
        json_schema_extra = {"example": {"url": "https://www.youtube.com/@example"}}


class ChannelResponse(BaseModel):
    """Response model for channel data."""

    id: int
    youtube_id: str
    title: str
    description: Optional[str] = None
    url: str
    thumbnail_url: Optional[str] = None
    custom_url: Optional[str] = None
    subscriber_count: Optional[int] = None
    video_count: Optional[int] = None
    view_count: Optional[int] = None
    published_at: Optional[str] = None

    class Config:
        from_attributes = True


class ChannelValidationResponse(BaseModel):
    """Response model for channel URL validation."""

    is_valid: bool
    message: str
    type: Optional[str] = None
    identifier: Optional[str] = None
    original_url: str
    normalized_url: Optional[str] = None
    error: Optional[str] = None


router = APIRouter()


@router.post("/validate", response_model=ChannelValidationResponse)
async def validate_channel_url(request: ChannelCreateRequest):
    """
    Validate a YouTube channel URL format.

    This endpoint checks if the provided URL is a valid YouTube channel URL
    and returns information about the URL format without making API calls.
    """
    try:
        validation_result = await channel_service.validate_channel_url(request.url)
        return ChannelValidationResponse(**validation_result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation failed: {str(e)}",
        )


@router.get("/", response_model=list[ChannelResponse])
async def list_channels(db: AsyncSession = Depends(get_db)):
    """
    List all tracked YouTube channels.

    Returns a list of all channels currently being tracked in the database,
    including their metadata and statistics.
    """
    try:
        channels = await channel_service.get_all_channels(db)
        return [ChannelResponse.model_validate(channel) for channel in channels]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve channels: {str(e)}",
        )


@router.post("/", response_model=ChannelResponse, status_code=status.HTTP_201_CREATED)
async def create_channel(
    request: ChannelCreateRequest, db: AsyncSession = Depends(get_db)
):
    """
    Add a new YouTube channel to track.

    This endpoint:
    1. Validates the YouTube channel URL format
    2. Fetches channel metadata from YouTube Data API (if API key configured)
    3. Creates a new channel record in the database
    4. Returns the created channel information

    Note: Without YouTube API key, only URL validation is performed.
    """
    try:
        # Validate the YouTube channel URL format
        validation_result = await channel_service.validate_channel_url(request.url)
        if not validation_result["is_valid"]:
            raise ValueError(validation_result["error"])

        # Check if channel already exists by URL
        existing_channels = await channel_service.get_all_channels(db)
        for channel in existing_channels:
            if channel.url == validation_result["normalized_url"]:
                raise ValueError(f"Channel already exists: {channel.title}")

        # Use YouTube API to fetch real channel data
        from app.domains.channels.models import Channel
        from app.services.youtube_api import (
            YouTubeAPIService,
            YouTubeQuotaExceededError,
            YouTubeAccessDeniedError,
            YouTubeNotFoundError,
            YouTubeAPIError,
        )

        youtube_service = YouTubeAPIService()

        # Get channel data from YouTube API based on URL type
        try:
            channel_data = None
            if validation_result["type"] == "username":
                channel_data = await youtube_service.get_channel_by_username(
                    validation_result["identifier"]
                )
            elif validation_result["type"] == "channel_id":
                channel_data = await youtube_service.get_channel_info(
                    validation_result["identifier"]
                )
            else:
                # For c_format and user_format, we need to search by the identifier
                # This is a limitation of the current YouTube API - these old formats are harder to resolve
                raise ValueError(
                    f"URL format '{validation_result['type']}' requires manual conversion to channel ID"
                )

            if not channel_data:
                raise ValueError(
                    "Channel not found or could not fetch channel data from YouTube API"
                )
        except YouTubeQuotaExceededError as e:
            raise ValueError(f"YouTube API quota exceeded. Please try again later. Details: {str(e)}")
        except YouTubeAccessDeniedError as e:
            raise ValueError(f"YouTube API access denied. Please check API configuration. Details: {str(e)}")
        except YouTubeNotFoundError as e:
            raise ValueError(f"Channel not found on YouTube. Details: {str(e)}")
        except YouTubeAPIError as e:
            raise ValueError(f"YouTube API error occurred. Details: {str(e)}")

        # Extract data from YouTube API response
        snippet = channel_data.get("snippet", {})
        statistics = channel_data.get("statistics", {})

        # Create channel record with real YouTube data
        new_channel = Channel(
            youtube_id=channel_data["id"],
            title=snippet.get("title", ""),
            description=snippet.get("description", ""),
            url=validation_result["normalized_url"],
            subscriber_count=int(statistics.get("subscriberCount", 0))
            if statistics.get("subscriberCount")
            else None,
            video_count=int(statistics.get("videoCount", 0))
            if statistics.get("videoCount")
            else None,
            view_count=int(statistics.get("viewCount", 0))
            if statistics.get("viewCount")
            else None,
            thumbnail_url=snippet.get("thumbnails", {}).get("high", {}).get("url"),
            custom_url=snippet.get("customUrl"),
            published_at=snippet.get("publishedAt"),
        )

        db.add(new_channel)
        await db.commit()
        await db.refresh(new_channel)

        return ChannelResponse.model_validate(new_channel)

    except ValueError as e:
        # Handle known validation and business logic errors
        error_message = str(e)
        if "already exists" in error_message:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail=error_message
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=error_message
            )

    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create channel: {str(e)}",
        )


@router.get("/{channel_id}", response_model=ChannelResponse)
async def get_channel(channel_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get details of a specific tracked channel.

    Returns detailed information about a channel including
    current statistics and metadata.
    """
    try:
        channel = await channel_service.get_channel_by_id(db, channel_id)
        if not channel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Channel with ID {channel_id} not found",
            )

        return ChannelResponse.model_validate(channel)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve channel: {str(e)}",
        )


@router.delete("/{channel_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_channel(channel_id: int, db: AsyncSession = Depends(get_db)):
    """
    Remove a channel from tracking.

    This will delete the channel and all associated data
    including videos and transcription jobs.
    """
    try:
        channel = await channel_service.get_channel_by_id(db, channel_id)
        if not channel:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Channel with ID {channel_id} not found",
            )

        await channel_service.delete_channel(db, channel)
        return None

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete channel: {str(e)}",
        )
