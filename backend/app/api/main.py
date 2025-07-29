from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import channels, health, videos
from app.core.config import settings

# Create FastAPI instance
app = FastAPI(
    title="YouTube Transcription Tool API",
    description="API for transcribing YouTube videos using AI-powered speech-to-text",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(channels.router, prefix="/api/v1/channels", tags=["channels"])
app.include_router(videos.router, prefix="/api/v1/videos", tags=["videos"])
