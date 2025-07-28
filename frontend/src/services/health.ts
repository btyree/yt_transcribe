import { api } from './api';
import { API_ENDPOINTS } from '../constants/api';
import { HealthResponse } from '../types/api';

export const healthService = {
  // Get detailed health information
  getHealth: async (): Promise<HealthResponse> => {
    const response = await api.get<HealthResponse>(API_ENDPOINTS.HEALTH);
    return response.data;
  },

  // Check if service is ready
  checkReadiness: async (): Promise<{ status: string }> => {
    const response = await api.get<{ status: string }>(
      API_ENDPOINTS.HEALTH_READY,
    );
    return response.data;
  },

  // Check if service is alive
  checkLiveness: async (): Promise<{ status: string }> => {
    const response = await api.get<{ status: string }>(
      API_ENDPOINTS.HEALTH_LIVE,
    );
    return response.data;
  },
};