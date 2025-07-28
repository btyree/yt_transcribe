from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_transcription_jobs():
    """List all transcription jobs."""
    return {"message": "Transcription jobs endpoint - implementation pending"}


@router.post("/")
async def create_transcription_job():
    """Create a new transcription job."""
    return {"message": "Create transcription job endpoint - implementation pending"}


@router.get("/{job_id}")
async def get_transcription_job(job_id: int):
    """Get details of a specific transcription job."""
    return {"message": f"Get transcription job {job_id} endpoint - implementation pending"}


@router.post("/{job_id}/start")
async def start_transcription_job(job_id: int):
    """Start processing a transcription job."""
    return {"message": f"Start transcription job {job_id} endpoint - implementation pending"}


@router.post("/{job_id}/cancel")
async def cancel_transcription_job(job_id: int):
    """Cancel a running transcription job."""
    return {"message": f"Cancel transcription job {job_id} endpoint - implementation pending"}


@router.get("/{job_id}/status")
async def get_transcription_job_status(job_id: int):
    """Get the current status of a transcription job."""
    return {"message": f"Get status for transcription job {job_id} endpoint - implementation pending"}