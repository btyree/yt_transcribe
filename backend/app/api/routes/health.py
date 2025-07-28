from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str
    timestamp: datetime
    service: str
    version: str
    environment: dict[str, str | bool | int]


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint that returns service status and environment info."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        service="YouTube Transcription Tool API",
        version="0.1.0",
        environment={
            "debug": settings.debug,
            "log_level": settings.log_level,
            "max_concurrent_jobs": settings.max_concurrent_jobs,
            "database_url": "***" if "://" in settings.database_url else settings.database_url,
            "has_youtube_api_key": bool(settings.youtube_api_key),
            "has_deepgram_api_key": bool(settings.deepgram_api_key),
        },
    )


@router.get("/health/ready")
async def readiness_check() -> dict[str, str]:
    """Readiness check endpoint for container orchestration."""
    return {"status": "ready"}


@router.get("/health/live")
async def liveness_check() -> dict[str, str]:
    """Liveness check endpoint for container orchestration."""
    return {"status": "alive"}