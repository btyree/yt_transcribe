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

      {/* Main Content - Video and Transcript on top, Notes below */}
      <main className="mx-auto max-w-7xl px-8 py-6 h-[calc(100vh-180px)] flex flex-col gap-6">
        {/* Top section - Video and Transcript side by side - 1/3 of screen height */}
        <div className="h-1/3 min-h-0 grid grid-cols-12 gap-6">
          {/* Video Player - 1/3 (4 columns) */}
          <div className="col-span-4 min-h-0 h-full">
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

          {/* Transcript - 2/3 (8 columns) */}
          <div className="col-span-8 min-h-0 h-full">
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
              />
            )}
          </div>
        </div>

        {/* Bottom section - Notes full width */}
        <div className="flex-1">
          <VideoNoteTaker
            videoId={selectedJob.video?.id || 0}
            currentTime={currentTime}
            onSeekToTime={handleSeekToTime}
            videoRef={videoRef}
          />
        </div>
      </main>
    </div>
  );
}