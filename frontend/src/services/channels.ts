import { api } from './api';
import { API_ENDPOINTS } from '../constants/api';
import { Channel } from '../types/api';

export interface CreateChannelRequest {
  url: string;
}

export const channelsService = {
  // Get all channels
  getChannels: async (): Promise<Channel[]> => {
    const response = await api.get<Channel[]>(API_ENDPOINTS.CHANNELS);
    return response.data;
  },

  // Get channel by ID
  getChannelById: async (id: number): Promise<Channel> => {
    const response = await api.get<Channel>(API_ENDPOINTS.CHANNEL_BY_ID(id));
    return response.data;
  },

  // Create new channel
  createChannel: async (data: CreateChannelRequest): Promise<Channel> => {
    const response = await api.post<Channel>(API_ENDPOINTS.CHANNELS, data);
    return response.data;
  },

  // Delete channel
  deleteChannel: async (id: number): Promise<void> => {
    await api.delete(API_ENDPOINTS.CHANNEL_BY_ID(id));
  },
};