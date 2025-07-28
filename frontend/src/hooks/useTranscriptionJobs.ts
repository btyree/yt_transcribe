import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  transcriptionJobsService,
  CreateTranscriptionJobRequest,
} from '../services/transcription-jobs';

export const useTranscriptionJobs = () => {
  return useQuery({
    queryKey: ['transcription-jobs'],
    queryFn: transcriptionJobsService.getTranscriptionJobs,
  });
};

export const useTranscriptionJob = (id: number) => {
  return useQuery({
    queryKey: ['transcription-jobs', id],
    queryFn: () => transcriptionJobsService.getTranscriptionJobById(id),
    enabled: !!id,
  });
};

export const useCreateTranscriptionJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTranscriptionJobRequest) =>
      transcriptionJobsService.createTranscriptionJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transcription-jobs'] });
    },
  });
};

export const useStartTranscriptionJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) =>
      transcriptionJobsService.startTranscriptionJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transcription-jobs'] });
    },
  });
};

export const useCancelTranscriptionJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) =>
      transcriptionJobsService.cancelTranscriptionJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transcription-jobs'] });
    },
  });
};

export const useTranscriptionJobStatus = (id: number) => {
  return useQuery({
    queryKey: ['transcription-jobs', id, 'status'],
    queryFn: () => transcriptionJobsService.getTranscriptionJobStatus(id),
    enabled: !!id,
    refetchInterval: 5000, // Poll every 5 seconds for status updates
  });
};