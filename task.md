# Fix transcribe button not working
**Status:** Refining
**Agent PID:** 56001

## Original Todo
Fix transcribe button in SingleVideoForm.tsx not working: debug frontend API call to transcriptionJobsService.createTranscriptionJob() (line 103), verify backend /transcription/jobs endpoint processing, check background_transcribe() function execution, ensure Deepgram API key is configured, test TranscriptionService.process_transcription_job() pipeline (video download → audio extraction → Deepgram transcription), verify job status updates from PENDING to COMPLETED, and confirm transcript content is properly stored and displayed

## Description
[what we're building]

## Implementation Plan
[how we are building it]
- [ ] Code change with location(s) if applicable (src/file.ts:45-93)
- [ ] Automated test: ...
- [ ] User test: ...

## Notes
[Implementation notes]