from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, Float
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


# Enums
class JobStatus(str, Enum):
    """Transcription job status."""

    PENDING = "pending"
    DOWNLOADING = "downloading"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TranscriptFormat(str, Enum):
    """Transcript output format."""

    TXT = "txt"
    SRT = "srt"
    VTT = "vtt"


# Pydantic models
class VideoMetadata(BaseModel):
    """Pydantic model for video metadata response."""

    youtube_id: str
    title: str
    duration_seconds: Optional[int] = None
    upload_date: Optional[datetime] = None
    view_count: Optional[int] = None
    thumbnail_url: Optional[str] = None
    url: str

    class Config:
        from_attributes = True


# SQLAlchemy models
class Channel(Base):
    """YouTube channel model."""

    __tablename__ = "channels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    youtube_id: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    custom_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    subscriber_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    video_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    view_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    published_at: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    videos: Mapped[list[Video]] = relationship("Video", back_populates="channel")

    def __repr__(self) -> str:
        return f"<Channel(id={self.id}, title='{self.title}')>"


class Video(Base):
    """YouTube video model."""

    __tablename__ = "videos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    youtube_id: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    channel_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("channels.id"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    view_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    video_file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    audio_file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    channel: Mapped[Channel] = relationship("Channel", back_populates="videos")
    transcription_jobs: Mapped[list[TranscriptionJob]] = relationship(
        "TranscriptionJob", back_populates="video"
    )
    notes: Mapped[list[Note]] = relationship(
        "Note", back_populates="video", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Video(id={self.id}, title='{self.title}')>"


class TranscriptionJob(Base):
    """Transcription job model."""

    __tablename__ = "transcription_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    video_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("videos.id"), nullable=False
    )
    status: Mapped[JobStatus] = mapped_column(
        SQLEnum(JobStatus), default=JobStatus.PENDING, nullable=False, index=True
    )
    format: Mapped[TranscriptFormat] = mapped_column(
        SQLEnum(TranscriptFormat), default=TranscriptFormat.TXT, nullable=False
    )
    output_file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    transcript_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    deepgram_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    progress_percentage: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    video: Mapped[Video] = relationship("Video", back_populates="transcription_jobs")

    @property
    def duration_seconds(self) -> int | None:
        """Calculate job duration in seconds."""
        if self.started_at and self.completed_at:
            return int((self.completed_at - self.started_at).total_seconds())
        return None

    def __repr__(self) -> str:
        return f"<TranscriptionJob(id={self.id}, status='{self.status}')>"


class Note(Base):
    """Video note model for timestamp-based annotations."""

    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    video_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("videos.id"), nullable=False, index=True
    )
    start_time: Mapped[float] = mapped_column(Float, nullable=False)  # Timestamp in seconds
    end_time: Mapped[float | None] = mapped_column(Float, nullable=True)  # Optional end time
    content: Mapped[str] = mapped_column(Text, nullable=False)
    selected_text: Mapped[str | None] = mapped_column(Text, nullable=True)  # Highlighted text from transcript
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    video: Mapped[Video] = relationship("Video", back_populates="notes")

    def __repr__(self) -> str:
        return f"<Note(id={self.id}, video_id={self.video_id}, start_time={self.start_time})>"


