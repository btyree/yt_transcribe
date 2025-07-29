# Import all models to ensure they are registered with SQLAlchemy
from app.models import (  # noqa: F401
    Channel,
    JobStatus,
    TranscriptFormat,
    TranscriptionJob,
    Video,
    VideoMetadata,
)
