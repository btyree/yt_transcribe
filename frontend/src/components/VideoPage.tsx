import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/16/solid';
import { Button } from './catalyst/button';
import { VideoPlayer } from './VideoPlayer';
import { VideoNoteTaker } from './VideoNoteTaker';
import { TranscriptWithHighlights } from './TranscriptWithHighlights';
import { useTranscriptionJobs } from '../hooks/useTranscriptionJobs';
import { useWordTimestamps } from '../hooks/useWordTimestamps';
import type { TranscriptionJob } from '../types/api';

export function VideoPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedJob, setSelectedJob] = useState<TranscriptionJob | null>(null);
  const [selectionData, setSelectionData] = useState<{ text: string; startTime: number; endTime: number } | null>(null);

  const { data: jobs } = useTranscriptionJobs();
  const { data: words, isLoading: isLoadingWords, error: wordsError } = useWordTimestamps(
    selectedJob?.id || 0,
    !!selectedJob?.id && selectedJob.status === 'completed'
  );

  // Find the job for this video
  useEffect(() => {
    if (jobs && videoId) {
      const job = jobs.find(j => j.video?.id === parseInt(videoId));
      if (job) {
        setSelectedJob(job);
      }
    }
  }, [jobs, videoId]);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleSeekToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleCreateNoteFromSelection = (data: { text: string; startTime: number; endTime: number }) => {
    setSelectionData(data);
  };

  const handleClearSelection = () => {
    setSelectionData(null);
  };

  if (!selectedJob) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-8 py-8">
          <div className="text-center py-16">
            <h2 className="text-xl font-medium text-zinc-900 mb-2">Video not found</h2>
            <p className="text-zinc-500 mb-6">
              The requested video could not be found or has not been transcribed yet.
            </p>
            <Button onClick={() => navigate('/')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/')}
                color="zinc"
                outline
                className="flex items-center space-x-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div>
                <h1 className="text-lg font-medium text-zinc-900">
                  {selectedJob.video?.title}
                </h1>
                {selectedJob.video?.channel && (
                  <p className="text-sm text-zinc-500">
                    {selectedJob.video.channel.title}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 1/3 left column (video + transcript), 2/3 right column (notes) */}
      <main className="mx-auto max-w-7xl px-8 py-6 h-[calc(100vh-180px)] flex gap-6">
        {/* Left column - Video (top 1/3) + Transcript (bottom 2/3) */}
        <div className="w-1/3 flex flex-col gap-4 min-h-0">
          {/* Video Player - 1/3 of left column height */}
          <div className="h-1/3 min-h-0">
            <div className="bg-black rounded-lg overflow-hidden h-full">
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                controls
                preload="metadata"
                onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
              >
                <source 
                  src={`http://localhost:8000/api/v1/videos/${selectedJob.video?.id}/file`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Transcript - 2/3 of left column height */}
          <div className="flex-1 min-h-0">
            {isLoadingWords ? (
              <div className="bg-white border border-zinc-200 rounded-lg h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-zinc-600">Loading word timestamps...</p>
                </div>
              </div>
            ) : wordsError ? (
              <div className="bg-white border border-zinc-200 rounded-lg h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-red-600 mb-2">Failed to load word timestamps</p>
                  <p className="text-xs text-zinc-500">{wordsError.message}</p>
                </div>
              </div>
            ) : (
              <TranscriptWithHighlights
                job={selectedJob}
                words={words?.words || []}
                currentTime={currentTime}
                onSeekToTime={handleSeekToTime}
                onCreateNoteFromSelection={handleCreateNoteFromSelection}
              />
            )}
          </div>
        </div>

        {/* Right column - Notes full width */}
        <div className="w-2/3 min-h-0">
          <VideoNoteTaker
            videoId={selectedJob.video?.id || 0}
            currentTime={currentTime}
            onSeekToTime={handleSeekToTime}
            videoRef={videoRef}
            selectionData={selectionData}
            onClearSelection={handleClearSelection}
            words={words?.words || []}
          />
        </div>
      </main>
    </div>
  );
}