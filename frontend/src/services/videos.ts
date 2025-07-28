import { api } from './api';
import { API_ENDPOINTS } from '../constants/api';
import { Video } from '../types/api';

export const videosService = {
  // Get all videos
  getVideos: async (): Promise<Video[]> => {
    const response = await api.get<Video[]>(API_ENDPOINTS.VIDEOS);
    return response.data;
  },

  // Get video by ID
  getVideoById: async (id: number): Promise<Video> => {
    const response = await api.get<Video>(API_ENDPOINTS.VIDEO_BY_ID(id));
    return response.data;
  },

  // Get videos by channel
  getVideosByChannel: async (channelId: number): Promise<Video[]> => {
    const response = await api.get<Video[]>(
      API_ENDPOINTS.VIDEOS_BY_CHANNEL(channelId),
    );
    return response.data;
  },

  // Discover new videos from tracked channels
  discoverVideos: async (): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      API_ENDPOINTS.DISCOVER_VIDEOS,
    );
    return response.data;
  },
};