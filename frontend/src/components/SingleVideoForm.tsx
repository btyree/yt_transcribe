import { useState } from 'react';
import { Button } from './catalyst/button';
import { Input } from './catalyst/input';
import { Fieldset, Label, Field } from './catalyst/fieldset';
import { Heading } from './catalyst/heading';
import { Badge } from './catalyst/badge';
import { DocumentTextIcon, EyeIcon, CalendarIcon } from '@heroicons/react/16/solid';
import { transcriptionJobsService } from '../services/transcription-jobs';
import { useTranscriptionJobs } from '../hooks/useTranscriptionJobs';
import type { Video, TranscriptionJob } from '../types/api';

interface SingleVideoFormProps {
  onVideoTranscribed?: (video: Video, job: TranscriptionJob) => void;
}

export function SingleVideoForm({ onVideoTranscribed }: SingleVideoFormProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedVideo, setExtractedVideo] = useState<Video | null>(null);
  const [transcriptionJob, setTranscriptionJob] = useState<TranscriptionJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { refetch } = useTranscriptionJobs();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);
    setExtractedVideo(null);
    setTranscriptionJob(null);

    try {
      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        setError('Please enter a valid YouTube URL');
        return;
      }

      // For now, we'll create a mock video object since we don't have a single video endpoint
      // In a real implementation, you'd want to add an API endpoint to extract video metadata
      const mockVideo: Video = {
        id: Date.now(), // temporary ID
        youtube_id: videoId,
        channel_id: 0, // we don't have channel context
        title: 'YouTube Video',
        description: '',
        url: videoUrl,
        thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        duration_seconds: 0,
        view_count: 0,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setExtractedVideo(mockVideo);

      // Create transcription job (automatically starts)
      const job = await transcriptionJobsService.createTranscriptionJob({
        video_id: mockVideo.id,
        format: 'txt'
      });

      setTranscriptionJob(job);
      refetch();

      if (onVideoTranscribed) {
        onVideoTranscribed(mockVideo, job);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process video');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setVideoUrl('');
    setExtractedVideo(null);
    setTranscriptionJob(null);
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <Heading level={2}>Transcribe Single Video</Heading>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Enter a YouTube video URL to transcribe it directly
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Fieldset>
          <Field>
            <Label>YouTube Video URL</Label>
            <Input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              required
              disabled={isProcessing}
            />
          </Field>
        </Fieldset>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isProcessing || !videoUrl}
            color="blue"
            className="flex-1"
          >
            {isProcessing ? 'Processing...' : 'Transcribe Video'}
          </Button>
          {(extractedVideo || error) && (
            <Button
              type="button"
              onClick={handleReset}
              outline
            >
              Reset
            </Button>
          )}
        </div>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                Error
              </h3>
              <p className="text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {extractedVideo && (
        <div className="mt-6 p-6 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="shrink-0">
              {extractedVideo.thumbnail_url ? (
                <img
                  src={extractedVideo.thumbnail_url}
                  alt={extractedVideo.title}
                  className="w-32 h-24 rounded object-cover border border-zinc-300 dark:border-zinc-600"
                />
              ) : (
                <div className="w-32 h-24 bg-zinc-100 dark:bg-zinc-700 rounded border border-zinc-300 dark:border-zinc-600 flex items-center justify-center">
                  <DocumentTextIcon className="w-8 h-8 text-zinc-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                {extractedVideo.title}
              </h3>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                {extractedVideo.duration_seconds && extractedVideo.duration_seconds > 0 && (
                  <div className="flex items-center space-x-1">
                    <Badge color="zinc" className="text-xs">
                      {formatDuration(extractedVideo.duration_seconds)}
                    </Badge>
                  </div>
                )}
                {extractedVideo.view_count && extractedVideo.view_count > 0 && (
                  <div className="flex items-center space-x-1">
                    <EyeIcon className="w-4 h-4" />
                    <span>{formatViewCount(extractedVideo.view_count)} views</span>
                  </div>
                )}
                {extractedVideo.published_at && (
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(extractedVideo.published_at)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  href={extractedVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  outline
                  className="text-sm"
                >
                  Watch on YouTube
                </Button>
                
                {transcriptionJob && (
                  <Badge 
                    color={
                      transcriptionJob.status === 'completed' ? 'green' : 
                      transcriptionJob.status === 'failed' ? 'red' : 'amber'
                    } 
                    className="text-xs flex items-center gap-1"
                  >
                    <DocumentTextIcon className="w-3 h-3" />
                    {transcriptionJob.status === 'pending' ? 'Pending' : 
                     transcriptionJob.status === 'downloading' ? 'Downloading' : 
                     transcriptionJob.status === 'processing' ? 'Processing' :
                     transcriptionJob.status === 'completed' ? 'Transcribed' : 'Failed'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}