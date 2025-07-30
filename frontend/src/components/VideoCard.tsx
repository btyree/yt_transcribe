import { useState } from 'react';
import type { Video, TranscriptionJob } from '../types/api';
import { useTranscriptionJobs } from '../hooks/useTranscriptionJobs';
import { transcriptionJobsService } from '../services/transcription-jobs';
import { Button } from './catalyst/button';
import { Badge } from './catalyst/badge';
import { 
  DocumentTextIcon, 
  PlayIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/16/solid';

export interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const { data: transcriptionJobs, refetch } = useTranscriptionJobs();
  const [isStartingTranscription, setIsStartingTranscription] = useState(false);
  
  // Find transcription jobs for this video
  const videoTranscriptionJobs = transcriptionJobs?.filter(job => job.video_id === video.id) || [];
  const latestJob = videoTranscriptionJobs[0]; // Assuming jobs are ordered by creation date
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count?: number) => {
    if (!count) return '';
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStartTranscription = async () => {
    try {
      setIsStartingTranscription(true);
      await transcriptionJobsService.createTranscriptionJob({
        video_id: video.id,
        format: 'txt'
      });
      await refetch(); // Refresh transcription jobs
    } catch (error) {
      console.error('Failed to start transcription:', error);
    } finally {
      setIsStartingTranscription(false);
    }
  };

  const handleDownloadTranscript = async (job: TranscriptionJob) => {
    if (!job.transcript_content) return;
    
    // Create a clean filename with channel and video title
    const channelName = job.video?.channel?.title || 'Unknown Channel';
    const videoTitle = job.video?.title || video.title || 'Unknown Video';
    const cleanChannelName = channelName.replace(/[/\\?%*:|"<>]/g, '-');
    const cleanVideoTitle = videoTitle.replace(/[/\\?%*:|"<>]/g, '-');
    const filename = `[${cleanChannelName}] ${cleanVideoTitle}.${job.format}`;
    
    const blob = new Blob([job.transcript_content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getTranscriptionStatusBadge = () => {
    if (!latestJob) return null;
    
    switch (latestJob.status) {
      case 'completed':
        return (
          <Badge color="green" className="text-xs">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Transcribed
          </Badge>
        );
      case 'processing':
        return (
          <Badge color="blue" className="text-xs">
            <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
            Processing ({latestJob.progress_percentage}%)
          </Badge>
        );
      case 'downloading':
        return (
          <Badge color="yellow" className="text-xs">
            <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
            Downloading ({latestJob.progress_percentage}%)
          </Badge>
        );
      case 'pending':
        return (
          <Badge color="gray" className="text-xs">
            <DocumentTextIcon className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge color="red" className="text-xs">
            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200 dark:bg-gray-700" style={{width: '160px', height: '90px'}}>
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Duration overlay */}
        {video.duration_seconds && (
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black bg-opacity-75 text-white text-xs rounded">
            {formatDuration(video.duration_seconds)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const
        }}>
          {video.title}
        </h3>
        
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          {video.view_count && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{width: '12px', height: '12px'}}>
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
              </svg>
              {formatViewCount(video.view_count)}
            </div>
          )}
          
          {video.published_at && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{width: '12px', height: '12px'}}>
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              {formatDate(video.published_at)}
            </div>
          )}
        </div>

        {/* Transcription Status */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getTranscriptionStatusBadge()}
          </div>
          
          <div className="flex items-center space-x-2">
            {latestJob?.status === 'completed' && (
              <Button
                onClick={() => handleDownloadTranscript(latestJob)}
                color="zinc"
                className="text-xs px-2 py-1"
                outline
              >
                <ArrowDownTrayIcon className="w-3 h-3 mr-1" />
                Download
              </Button>
            )}
            
            {(!latestJob || latestJob.status === 'failed') && (
              <Button
                onClick={handleStartTranscription}
                color="blue"
                className="text-xs px-2 py-1"
                disabled={isStartingTranscription}
              >
                {isStartingTranscription ? (
                  <>
                    <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-3 h-3 mr-1" />
                    Transcribe
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Video URL link */}
        <div className="mt-3">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{width: '10px', height: '10px'}}>
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
            </svg>
            Watch on YouTube
          </a>
        </div>
      </div>
    </div>
  );
}