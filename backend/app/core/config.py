from typing import Any

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    # Database
    database_url: str = Field(
        default="sqlite+aiosqlite:///./yt_transcribe.db",
        description="Database connection URL",
    )

    # API Keys
    youtube_api_key: str | None = Field(
        default=None, description="YouTube Data API v3 key"
    )
    deepgram_api_key: str | None = Field(
        default=None, description="Deepgram Speech-to-Text API key"
    )

    # Application
    debug: bool = Field(default=False, description="Debug mode")
    log_level: str = Field(default="INFO", description="Logging level")
    max_concurrent_jobs: int = Field(
        default=5, description="Maximum concurrent transcription jobs"
    )

    # CORS
    allowed_origins: list[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"],
        description="Allowed CORS origins",
    )

    # File Storage
    transcript_output_dir: str = Field(
        default="./transcripts", description="Directory for transcript files"
    )
    temp_audio_dir: str = Field(
        default="./temp_audio", description="Directory for temporary audio files"
    )

    # Server
    host: str = Field(default="0.0.0.0", description="Server host")
    port: int = Field(default=8000, description="Server port")

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_cors(cls, v: Any) -> list[str]:
        """Parse CORS origins from string or list."""
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )


settings = Settings()
