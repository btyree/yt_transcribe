import { useVideosByChannel, useDiscoverVideos } from '../hooks/useVideos';
import { useTranscriptionJobs } from '../hooks/useTranscriptionJobs';
import { transcriptionJobsService } from '../services/transcription-jobs';
import type { Channel } from '../types/api';
import { Button } from './catalyst/button';
import { Heading } from './catalyst/heading';
import { Badge } from './catalyst/badge';
import { EyeIcon, CalendarIcon, DocumentTextIcon } from '@heroicons/react/16/solid';
import { useState } from 'react';

export interface VideoListProps {
  channel: Channel;
}

export function VideoList({ channel }: VideoListProps) {
  const { data: videos, isLoading, error } = useVideosByChannel(channel.id);
  const discoverVideosMutation = useDiscoverVideos();
  const { data: transcriptionJobs } = useTranscriptionJobs();
  const [transcribingVideos, setTranscribingVideos] = useState<Set<number>>(new Set());

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

  const handleDiscoverVideos = async () => {
    try {
      await discoverVideosMutation.mutateAsync(channel.youtube_id);
    } catch (error) {
      console.error('Failed to discover videos:', error);
    }
  };

  const handleTranscribeVideo = async (videoId: number) => {
    setTranscribingVideos(prev => new Set(prev).add(videoId));
    try {
      const job = await transcriptionJobsService.createTranscriptionJob({
        video_id: videoId,
        format: 'txt'
      });
      await transcriptionJobsService.startTranscriptionJob(job.id);
    } catch (error) {
      console.error('Failed to start transcription:', error);
    } finally {
      setTranscribingVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    }
  };

  const getTranscriptionStatus = (videoId: number) => {
    if (!transcriptionJobs) return null;
    return transcriptionJobs.find(job => job.video_id === videoId);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading videos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                Error loading videos
              </h3>
              <p className="text-red-700 dark:text-red-300 mt-1">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasVideos = videos && videos.length > 0;

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level={2}>Videos from {channel.title}</Heading>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {hasVideos ? `${videos.length} videos found` : 'No videos found'}
          </p>
        </div>
        
        <Button
          onClick={handleDiscoverVideos}
          disabled={discoverVideosMutation.isPending}
          color="blue"
        >
          {discoverVideosMutation.isPending ? 'Discovering...' : 'Discover Videos'}
        </Button>
      </div>

      {/* Videos Cards or Empty State */}
      {hasVideos ? (
        <div className="space-y-6">
          {videos.map((video) => (
            <div key={video.id} className="overflow-hidden rounded-lg bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700">
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex">
                  <div className="mb-4 shrink-0 sm:mr-4 sm:mb-0">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="size-16 rounded object-cover border border-zinc-300 dark:border-zinc-600"
                      />
                    ) : (
                      <svg 
                        viewBox="0 0 200 200" 
                        fill="none" 
                        stroke="currentColor" 
                        preserveAspectRatio="none" 
                        aria-hidden="true" 
                        className="size-16 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600"
                      >
                        <path d="M0 0l200 200M0 200L200 0" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-zinc-900 dark:text-white leading-6">
                      {video.title}
                    </h4>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {video.duration_seconds && (
                        <div className="flex items-center space-x-1">
                          <Badge color="zinc" className="text-xs">
                            {formatDuration(video.duration_seconds)}
                          </Badge>
                        </div>
                      )}
                      {video.view_count && (
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{formatViewCount(video.view_count)} views</span>
                        </div>
                      )}
                      {video.published_at && (
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{formatDate(video.published_at)}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        outline
                        className="text-sm"
                      >
                        Watch on YouTube
                      </Button>
                      {(() => {
                        const transcriptionJob = getTranscriptionStatus(video.id);
                        const isTranscribing = transcribingVideos.has(video.id);
                        
                        if (transcriptionJob) {
                          if (transcriptionJob.status === 'completed') {
                            return (
                              <Badge color="green" className="text-xs flex items-center gap-1">
                                <DocumentTextIcon className="w-3 h-3" />
                                Transcribed
                              </Badge>
                            );
                          } else if (transcriptionJob.status === 'failed') {
                            return (
                              <Badge color="red" className="text-xs flex items-center gap-1">
                                <DocumentTextIcon className="w-3 h-3" />
                                Failed
                              </Badge>
                            );
                          } else {
                            return (
                              <Badge color="amber" className="text-xs flex items-center gap-1">
                                <DocumentTextIcon className="w-3 h-3" />
                                {transcriptionJob.status === 'pending' ? 'Pending' : 
                                 transcriptionJob.status === 'downloading' ? 'Downloading' : 
                                 'Processing'}
                              </Badge>
                            );
                          }
                        }
                        
                        return (
                          <Button
                            onClick={() => handleTranscribeVideo(video.id)}
                            disabled={isTranscribing}
                            color="emerald"
                            className="text-sm"
                          >
                            {isTranscribing ? 'Starting...' : 'Transcribe'}
                          </Button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No videos found
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Click "Discover Videos" to fetch videos from this channel.
          </p>
        </div>
      )}

      {/* Discover Videos Success/Error Messages */}
      {discoverVideosMutation.isSuccess && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{width: '14px', height: '14px'}}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="text-green-800 dark:text-green-200 font-medium">
              Videos discovered successfully!
            </span>
          </div>
        </div>
      )}

      {discoverVideosMutation.isError && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{width: '14px', height: '14px'}}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <div>
              <span className="text-red-800 dark:text-red-200 font-medium">
                Failed to discover videos
              </span>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                {discoverVideosMutation.error instanceof Error 
                  ? discoverVideosMutation.error.message 
                  : 'An unexpected error occurred'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}