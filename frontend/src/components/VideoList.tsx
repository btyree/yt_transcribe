import { useVideosByChannel, useDiscoverVideos } from '../hooks/useVideos';
import { VideoCard } from './VideoCard';
import type { Channel } from '../types/api';

export interface VideoListProps {
  channel: Channel;
}

export function VideoList({ channel }: VideoListProps) {
  const { data: videos, isLoading, error } = useVideosByChannel(channel.id);
  const discoverVideosMutation = useDiscoverVideos();

  const handleDiscoverVideos = async () => {
    try {
      await discoverVideosMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to discover videos:', error);
    }
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Videos from {channel.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {hasVideos ? `${videos.length} videos found` : 'No videos found'}
          </p>
        </div>
        
        {/* Discover Videos Button */}
        <button
          onClick={handleDiscoverVideos}
          disabled={discoverVideosMutation.isPending}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 
                   text-white font-medium rounded-md transition-colors
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   flex items-center"
        >
          {discoverVideosMutation.isPending ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Discovering...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
              </svg>
              Discover Videos
            </>
          )}
        </button>
      </div>

      {/* Videos Grid or Empty State */}
      {hasVideos ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
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
            <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
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
            <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
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