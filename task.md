# Fix transcribe button not working
**Status:** InProgress
**Agent PID:** 56001

## Original Todo
Fix transcribe button in SingleVideoForm.tsx not working: debug frontend API call to transcriptionJobsService.createTranscriptionJob() (line 103), verify backend /transcription/jobs endpoint processing, check background_transcribe() function execution, ensure Deepgram API key is configured, test TranscriptionService.process_transcription_job() pipeline (video download → audio extraction → Deepgram transcription), verify job status updates from PENDING to COMPLETED, and confirm transcript content is properly stored and displayed

## Description
We need to fix the transcribe button in SingleVideoForm.tsx that currently fails because it creates mock video objects with temporary IDs that don't exist in the backend database. The backend requires valid video records before creating transcription jobs.

## Implementation Plan
**Root Issue**: SingleVideoForm creates mock video objects with `Date.now()` IDs that don't exist in the database. The channel workflow works correctly because it creates real video records first.

**Solution**: Make SingleVideoForm follow the same pattern as the channel workflow.

- [ ] Create video metadata extraction endpoint - Add `POST /api/v1/videos/create-from-url` endpoint that extracts YouTube metadata and creates real video record in database (backend/app/api/routes/videos.py)
- [ ] Update SingleVideoForm to create real video records - Replace mock video creation with API call to create real video record before transcription (frontend/src/components/SingleVideoForm.tsx:85-98)
- [ ] Handle standalone videos without channels - Allow videos to exist without being associated with tracked channels (channel_id can be null)
- [ ] Ensure backend environment setup - Verify .env file exists and dependencies are installed (backend/.env, uv sync)
- [ ] Add error handling for video creation failures - Improve error messages when video extraction or transcription fails
- [ ] Test complete flow - Verify single video URL → real video record → transcription job → completion

## Notes
[Implementation notes]