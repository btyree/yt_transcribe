import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  transcriptionJobsService,
  type CreateTranscriptionJobRequest,
} from '../services/transcription-jobs';

export const useTranscriptionJobs = () => {
  return useQuery({
    queryKey: ['transcription-jobs'],
    queryFn: transcriptionJobsService.getTranscriptionJobs,
    refetchOnWindowFocus: true, // Refetch when switching back to the tab/window
    refetchInterval: (data) => {
      // Refetch every 5 seconds if there are any jobs that are not completed/failed/cancelled
      if (data && Array.isArray(data) && data.some(job => 
        job.status === 'pending' || 
        job.status === 'downloading' || 
        job.status === 'processing'
      )) {
        return 5000; // 5 seconds
      }
      return false; // Don't poll if all jobs are done
    },
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

export const useRetryTranscriptionJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      transcriptionJobsService.retryTranscriptionJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transcription-jobs'] });
    },
  });
};

export const useTranscriptionJobStatus = (id: number) => {
  return useQuery({
    queryKey: ['transcription-jobs', id],
    queryFn: () => transcriptionJobsService.getTranscriptionJobById(id),
    enabled: !!id,
    refetchInterval: 5000, // Poll every 5 seconds for status updates
  });
};
