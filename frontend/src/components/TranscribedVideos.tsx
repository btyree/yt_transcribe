import { useState, useMemo } from 'react';
import { useTranscriptionJobs } from '../hooks/useTranscriptionJobs';
import { useChannels } from '../hooks/useChannels';
import { Input } from './catalyst/input';
import { Button } from './catalyst/button';
import { Badge } from './catalyst/badge';
import { Select } from './catalyst/select';
import { 
  MagnifyingGlassIcon, 
  DocumentTextIcon, 
  CalendarIcon, 
  EyeIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/16/solid';
import type { TranscriptionJob } from '../types/api';

export function TranscribedVideos() {
  const { data: transcriptionJobs, isLoading, error } = useTranscriptionJobs();
  const { data: channels } = useChannels();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  const allJobs = transcriptionJobs || [];

  const filteredJobs = useMemo(() => {
    return allJobs.filter(job => {
      const matchesSearch = searchQuery === '' || 
        job.video?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.video?.channel?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      
      const matchesChannel = channelFilter === 'all' || 
        job.video?.channel_id?.toString() === channelFilter;

      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [allJobs, searchQuery, statusFilter, channelFilter]);

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
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
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

  const getStatusBadge = (job: TranscriptionJob) => {
    switch (job.status) {
      case 'completed':
        return (
          <Badge color="green" className="text-xs">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'processing':
        return (
          <Badge color="blue" className="text-xs">
            <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
            Processing ({job.progress_percentage}%)
          </Badge>
        );
      case 'downloading':
        return (
          <Badge color="yellow" className="text-xs">
            <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
            Downloading ({job.progress_percentage}%)
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
      case 'cancelled':
        return (
          <Badge color="red" className="text-xs">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge color="gray" className="text-xs">
            {job.status}
          </Badge>
        );
    }
  };

  const handleDownload = async (job: TranscriptionJob) => {
    if (!job.transcript_content) return;
    
    try {
      // Create a clean filename with channel and video title
      const channelName = job.video?.channel?.title || 'Unknown Channel';
      const videoTitle = job.video?.title || 'Unknown Video';
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
    } catch (error) {
      console.error('Failed to download transcription:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-zinc-500 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-zinc-600">Loading transcribed videos...</span>
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
              Error loading transcribed videos
            </h3>
            <p className="text-red-700 mt-1">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-xl font-medium text-zinc-900 mb-2">
          Transcription Jobs
        </h2>
        <p className="text-zinc-500">
          {allJobs.length} transcription jobs in progress or completed
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Search videos or channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="col-span-3">
          <Select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
          >
            <option value="all">All Channels</option>
            {channels?.map(channel => (
              <option key={channel.id} value={channel.id.toString()}>
                {channel.title}
              </option>
            ))}
          </Select>
        </div>
        <div className="col-span-3">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="downloading">Downloading</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      {/* Video Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16">
          <DocumentTextIcon className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 mb-2">
            {searchQuery || statusFilter !== 'all' || channelFilter !== 'all' 
              ? 'No jobs match your filters' 
              : 'No transcription jobs yet'}
          </h3>
          <p className="text-zinc-500">
            {searchQuery || statusFilter !== 'all' || channelFilter !== 'all'
              ? 'Try adjusting your search criteria'
              : 'Transcribe some videos to see them here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white border border-zinc-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Thumbnail */}
                  {job.video?.thumbnail_url ? (
                    <img
                      src={job.video.thumbnail_url}
                      alt={job.video.title}
                      className="w-20 h-12 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-12 rounded bg-zinc-100 flex items-center justify-center flex-shrink-0">
                      <DocumentTextIcon className="w-6 h-6 text-zinc-400" />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-zinc-900 mb-2">
                      {job.video?.title || 'Untitled Video'}
                    </h3>
                    
                    <div className="flex items-center space-x-4 text-sm text-zinc-500 mb-3">
                      {job.video?.channel && (
                        <span>{job.video.channel.title}</span>
                      )}
                      {job.video?.duration_seconds && (
                        <div className="flex items-center space-x-1">
                          <Badge color="zinc" className="text-xs">
                            {formatDuration(job.video.duration_seconds)}
                          </Badge>
                        </div>
                      )}
                      {job.video?.view_count && (
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="w-4 h-4" />
                          <span>{formatViewCount(job.video.view_count)} views</span>
                        </div>
                      )}
                      {job.completed_at && (
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Transcribed {formatDate(job.completed_at)}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(job)}
                        <Badge color="zinc" className="text-xs">
                          {job.format.toUpperCase()} Format
                        </Badge>
                      </div>

                      {/* Progress bar for active jobs */}
                      {(job.status === 'downloading' || job.status === 'processing') && (
                        <div className="w-full bg-zinc-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${job.progress_percentage}%` }}
                          ></div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3">
                        {job.status === 'completed' && (
                          <Button
                            onClick={() => handleDownload(job)}
                            color="zinc"
                            className="text-sm px-3 py-1"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                        
                        {job.video?.url && (
                          <Button
                            href={job.video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            outline
                            className="text-sm px-3 py-1"
                          >
                            Watch Original
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}