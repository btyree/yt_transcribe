import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { channelsService, CreateChannelRequest } from '../services/channels';

export const useChannels = () => {
  return useQuery({
    queryKey: ['channels'],
    queryFn: channelsService.getChannels,
  });
};

export const useChannel = (id: number) => {
  return useQuery({
    queryKey: ['channels', id],
    queryFn: () => channelsService.getChannelById(id),
    enabled: !!id,
  });
};

export const useCreateChannel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateChannelRequest) =>
      channelsService.createChannel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });
};

export const useDeleteChannel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => channelsService.deleteChannel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });
};