import { useQuery } from '@tanstack/react-query';
import { healthService } from '../services/health';

export const useHealth = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: healthService.getHealth,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });
};

export const useHealthReadiness = () => {
  return useQuery({
    queryKey: ['health', 'ready'],
    queryFn: healthService.checkReadiness,
    staleTime: 10000, // 10 seconds
  });
};

export const useHealthLiveness = () => {
  return useQuery({
    queryKey: ['health', 'live'],
    queryFn: healthService.checkLiveness,
    staleTime: 10000, // 10 seconds
  });
};