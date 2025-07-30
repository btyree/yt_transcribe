import { useQuery } from '@tanstack/react-query';
import { transcriptionJobsService } from '../services/transcription-jobs';

export function useWordTimestamps(jobId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['wordTimestamps', jobId],
    queryFn: () => transcriptionJobsService.getWordTimestamps(jobId),
    enabled: enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}