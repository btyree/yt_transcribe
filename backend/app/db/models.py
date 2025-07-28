# Import all models to ensure they are registered with SQLAlchemy
from app.domains.channels.models import Channel  # noqa: F401
from app.domains.transcription_jobs.models import (  # noqa: F401
    JobStatus,
    TranscriptFormat,
    TranscriptionJob,
)
from app.domains.videos.models import Video  # noqa: F401
