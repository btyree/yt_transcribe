import { useVideosByChannel, useDiscoverVideos } from '../hooks/useVideos';
import { useTranscriptionJobs } from '../hooks/useTranscriptionJobs';
import { transcriptionJobsService } from '../services/transcription-jobs';
import type { Channel } from '../types/api';
import { Button } from './catalyst/button';
import { Input } from './catalyst/input';
import { Heading } from './catalyst/heading';
import { Badge } from './catalyst/badge';
import { EyeIcon, CalendarIcon, DocumentTextIcon, MagnifyingGlassIcon } from '@heroicons/react/16/solid';
import { useState, useMemo } from 'react';

export interface VideoListProps {
  channel: Channel;
}

export function VideoList({ channel }: VideoListProps) {
  const { data: videos, isLoading, error } = useVideosByChannel(channel.id);
  const discoverVideosMutation = useDiscoverVideos();
  const { data: transcriptionJobs } = useTranscriptionJobs();
  const [transcribingVideos, setTranscribingVideos] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

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
      await transcriptionJobsService.createTranscriptionJob({
        video_id: videoId,
        format: 'txt'
      });
      // Job automatically starts when created
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

  const filteredVideos = useMemo(() => {
    if (!videos || !searchQuery.trim()) return videos || [];
    
    return videos.filter(video =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [videos, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-zinc-500 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-zinc-600">Loading videos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="h-6 w-6 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-lg font-medium text-red-800">
              Error loading videos
            </h3>
            <p className="text-red-700 mt-1">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasVideos = videos && videos.length > 0;
  const hasFilteredVideos = filteredVideos && filteredVideos.length > 0;

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-medium text-zinc-900">{channel.title}</h2>
            <p className="text-sm text-zinc-500 mt-1">
              {hasVideos ? (
                searchQuery ? 
                  `${filteredVideos.length} of ${videos.length} videos` :
                  `${videos.length} videos available`
              ) : 'No videos discovered yet'}
            </p>
          </div>
          
          <Button
            onClick={handleDiscoverVideos}
            disabled={discoverVideosMutation.isPending}
            color="dark"
            className="px-4 py-2"
          >
            {discoverVideosMutation.isPending ? 'Discovering...' : 'Discover Videos'}
          </Button>
        </div>
        
        {/* Search Input - only show if there are videos */}
        {hasVideos && (
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400 z-10" />
            <Input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 [&>input]:focus:ring-2 [&>input]:focus:ring-blue-500 [&>input]:focus:ring-inset after:hidden"
            />
          </div>
        )}
      </div>

      {/* Videos List */}
      {hasVideos ? (
        hasFilteredVideos ? (
          <div className="space-y-3">
            {filteredVideos.map((video) => (
            <div key={video.id} className="bg-white border border-zinc-200 rounded-lg p-4 hover:border-zinc-300 transition-colors">
              <div className="flex items-start space-x-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-20 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-20 h-12 rounded bg-zinc-100 flex items-center justify-center">
                      <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-zinc-900 mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  
                  {/* Metadata */}
                  <div className="flex items-center space-x-4 text-sm text-zinc-500 mb-3">
                    {video.duration_seconds && (
                      <span className="px-2 py-1 bg-zinc-100 rounded text-xs font-medium">
                        {formatDuration(video.duration_seconds)}
                      </span>
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
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <Button
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      outline
                      className="text-sm px-3 py-1"
                    >
                      Watch
                    </Button>
                    
                    {(() => {
                      const transcriptionJob = getTranscriptionStatus(video.id);
                      const isTranscribing = transcribingVideos.has(video.id);
                      
                      if (transcriptionJob) {
                        if (transcriptionJob.status === 'completed') {
                          return (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <DocumentTextIcon className="w-3 h-3 mr-1" />
                              Transcribed
                            </span>
                          );
                        } else if (transcriptionJob.status === 'failed') {
                          return (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <DocumentTextIcon className="w-3 h-3 mr-1" />
                              Failed
                            </span>
                          );
                        } else {
                          return (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              <DocumentTextIcon className="w-3 h-3 mr-1" />
                              {transcriptionJob.status === 'pending' ? 'Pending' : 
                               transcriptionJob.status === 'downloading' ? 'Downloading' : 
                               'Processing'}
                            </span>
                          );
                        }
                      }
                      
                      return (
                        <Button
                          onClick={() => handleTranscribeVideo(video.id)}
                          disabled={isTranscribing}
                          color="dark"
                          className="text-sm px-3 py-1"
                        >
                          {isTranscribing ? 'Starting...' : 'Transcribe'}
                        </Button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 rounded-lg flex items-center justify-center">
              <MagnifyingGlassIcon className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 mb-2">
              No videos match your search
            </h3>
            <p className="text-zinc-500 mb-4">
              Try different keywords or clear your search to see all videos.
            </p>
            <Button
              onClick={() => setSearchQuery('')}
              color="zinc"
              className="px-4 py-2"
            >
              Clear Search
            </Button>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-zinc-900 mb-2">
            No videos discovered yet
          </h3>
          <p className="text-zinc-500 mb-4">
            Click "Discover Videos" to fetch the latest videos from this channel.
          </p>
          <Button
            onClick={handleDiscoverVideos}
            disabled={discoverVideosMutation.isPending}
            color="dark"
            className="px-4 py-2"
          >
            {discoverVideosMutation.isPending ? 'Discovering...' : 'Discover Videos'}
          </Button>
        </div>
      )}

      {/* Discover Videos Success/Error Messages */}
      {discoverVideosMutation.isSuccess && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="text-green-800 text-sm font-medium">
              Videos discovered successfully!
            </span>
          </div>
        </div>
      )}

      {discoverVideosMutation.isError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <div>
              <span className="text-red-800 text-sm font-medium">
                Failed to discover videos
              </span>
              <p className="text-red-700 text-xs mt-1">
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