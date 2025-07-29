import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { videosService } from '../services/videos';

export const useVideos = () => {
  return useQuery({
    queryKey: ['videos'],
    queryFn: videosService.getVideos,
  });
};

export const useVideo = (id: number) => {
  return useQuery({
    queryKey: ['videos', id],
    queryFn: () => videosService.getVideoById(id),
    enabled: !!id,
  });
};

export const useVideosByChannel = (channelId: number) => {
  return useQuery({
    queryKey: ['videos', 'channel', channelId],
    queryFn: () => videosService.getVideosByChannel(channelId),
    enabled: !!channelId,
  });
};

export const useDiscoverVideos = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (channelYoutubeId: string) => videosService.discoverVideos(channelYoutubeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });
};