from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


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


class Video(Base):
    """YouTube video model."""

    __tablename__ = "videos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    youtube_id: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    channel_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("channels.id"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    view_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    published_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    channel: Mapped[Channel] = relationship("Channel", back_populates="videos")
    transcription_jobs: Mapped[list[TranscriptionJob]] = relationship(
        "TranscriptionJob", back_populates="video"
    )

    def __repr__(self) -> str:
        return f"<Video(id={self.id}, title='{self.title}')>"
