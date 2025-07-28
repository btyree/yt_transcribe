from __future__ import annotations

from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


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
