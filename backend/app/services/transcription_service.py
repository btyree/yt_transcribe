import asyncio
import json
import os
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Optional

import ffmpeg
import yt_dlp
from deepgram import DeepgramClient, FileSource, PrerecordedOptions
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models import JobStatus, TranscriptionJob, Video


class TranscriptionService:
    """Service for handling video download, audio extraction, and transcription."""

    def __init__(self):
        """Initialize the transcription service."""
        self.deepgram_client = DeepgramClient(settings.deepgram_api_key)
        self._ensure_directories()

    def _ensure_directories(self) -> None:
        """Ensure required directories exist."""
        Path(settings.temp_audio_dir).mkdir(parents=True, exist_ok=True)
        Path(settings.transcript_output_dir).mkdir(parents=True, exist_ok=True)

    async def process_transcription_job(
        self, job: TranscriptionJob, video: Video, db: AsyncSession
    ) -> None:
        """Process a complete transcription job from video download to transcript."""
        try:
            # Update job status to downloading
            job.status = JobStatus.DOWNLOADING
            job.started_at = datetime.utcnow()
            job.progress_percentage = 10
            await db.commit()

            # Download video if not already downloaded
            if not video.video_file_path or not Path(video.video_file_path).exists():
                video_path = await self._download_video(video.url, video.youtube_id)
                video.video_file_path = video_path
                await db.commit()

            job.progress_percentage = 30
            await db.commit()

            # Extract audio if not already extracted
            if not video.audio_file_path or not Path(video.audio_file_path).exists():
                audio_path = await self._extract_audio(
                    video.video_file_path, video.youtube_id
                )
                video.audio_file_path = audio_path
                await db.commit()

            # Update job status to processing
            job.status = JobStatus.PROCESSING
            job.progress_percentage = 50
            await db.commit()

            # Transcribe audio
            transcript_result = await self._transcribe_audio(video.audio_file_path)

            # Store results
            job.transcript_content = transcript_result["transcript"]
            job.deepgram_response = json.dumps(transcript_result["full_response"])
            job.progress_percentage = 90

            # Save transcript to file if requested
            if job.output_file_path:
                await self._save_transcript_file(
                    job.transcript_content, job.output_file_path, job.format
                )

            # Mark job as completed
            job.status = JobStatus.COMPLETED
            job.completed_at = datetime.utcnow()
            job.progress_percentage = 100
            await db.commit()

        except Exception as e:
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            job.completed_at = datetime.utcnow()
            await db.commit()
            raise

    async def _download_video(self, video_url: str, youtube_id: str) -> str:
        """Download video using yt-dlp."""
        video_dir = Path(settings.temp_audio_dir) / "videos"
        video_dir.mkdir(parents=True, exist_ok=True)
        
        output_path = video_dir / f"{youtube_id}.%(ext)s"
        
        ydl_opts = {
            'outtmpl': str(output_path),
            'format': 'best[height<=720]',  # Limit quality to save space
            'noplaylist': True,
        }
        
        def download():
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([video_url])
        
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, download)
        
        # Find the downloaded file
        for file_path in video_dir.glob(f"{youtube_id}.*"):
            if file_path.is_file():
                return str(file_path)
        
        raise FileNotFoundError(f"Downloaded video file not found for {youtube_id}")

    async def _extract_audio(self, video_path: str, youtube_id: str) -> str:
        """Extract audio from video using ffmpeg."""
        audio_path = Path(settings.temp_audio_dir) / f"{youtube_id}.wav"
        
        def extract():
            (
                ffmpeg
                .input(video_path)
                .audio
                .output(
                    str(audio_path),
                    acodec='pcm_s16le',  # Uncompressed WAV
                    ac=1,  # Mono
                    ar='16000'  # 16kHz sample rate (good for speech)
                )
                .overwrite_output()
                .run(quiet=True)
            )
        
        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, extract)
        
        if not audio_path.exists():
            raise FileNotFoundError(f"Audio extraction failed for {youtube_id}")
        
        return str(audio_path)

    async def _transcribe_audio(self, audio_path: str) -> dict:
        """Transcribe audio using Deepgram."""
        if not settings.deepgram_api_key:
            raise ValueError("Deepgram API key not configured")

        with open(audio_path, "rb") as audio_file:
            buffer_data = audio_file.read()

        payload: FileSource = {"buffer": buffer_data}

        options = PrerecordedOptions(
            model="nova-2",  # Use nova-2 for good balance of speed/accuracy
            language="en",
            summarize="v2",
            topics=True,
            smart_format=True,
            punctuate=True,
            paragraphs=True,
            diarize=True,
        )

        def transcribe():
            response = self.deepgram_client.listen.rest.v("1").transcribe_file(
                payload, options
            )
            return response

        # Run in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(None, transcribe)

        # Extract transcript text
        transcript_text = ""
        if (
            hasattr(response, "results")
            and response.results.channels
            and response.results.channels[0].alternatives
        ):
            transcript_text = response.results.channels[0].alternatives[0].transcript

        return {"transcript": transcript_text, "full_response": response.to_dict()}

    async def _save_transcript_file(
        self, content: str, file_path: str, format_type: str
    ) -> None:
        """Save transcript content to file."""
        output_path = Path(settings.transcript_output_dir) / file_path
        output_path.parent.mkdir(parents=True, exist_ok=True)

        def write_file():
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(content)

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, write_file)

    async def cleanup_temp_files(self, video: Video) -> None:
        """Clean up temporary video and audio files."""
        try:
            if video.video_file_path and Path(video.video_file_path).exists():
                Path(video.video_file_path).unlink()
                video.video_file_path = None

            if video.audio_file_path and Path(video.audio_file_path).exists():
                Path(video.audio_file_path).unlink()
                video.audio_file_path = None
        except Exception:
            # Ignore cleanup errors
            pass


# Global instance
transcription_service = TranscriptionService()