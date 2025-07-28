import { api } from './api';
import { API_ENDPOINTS } from '../constants/api';
import { type TranscriptionJob } from '../types/api';

export interface CreateTranscriptionJobRequest {
  video_id: number;
  format: 'txt' | 'srt' | 'vtt';
}

export const transcriptionJobsService = {
  // Get all transcription jobs
  getTranscriptionJobs: async (): Promise<TranscriptionJob[]> => {
    const response = await api.get<TranscriptionJob[]>(
      API_ENDPOINTS.TRANSCRIPTION_JOBS,
    );
    return response.data;
  },

  // Get transcription job by ID
  getTranscriptionJobById: async (id: number): Promise<TranscriptionJob> => {
    const response = await api.get<TranscriptionJob>(
      API_ENDPOINTS.TRANSCRIPTION_JOB_BY_ID(id),
    );
    return response.data;
  },

  // Create new transcription job
  createTranscriptionJob: async (
    data: CreateTranscriptionJobRequest,
  ): Promise<TranscriptionJob> => {
    const response = await api.post<TranscriptionJob>(
      API_ENDPOINTS.TRANSCRIPTION_JOBS,
      data,
    );
    return response.data;
  },

  // Start transcription job
  startTranscriptionJob: async (
    id: number,
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      API_ENDPOINTS.START_TRANSCRIPTION_JOB(id),
    );
    return response.data;
  },

  // Cancel transcription job
  cancelTranscriptionJob: async (
    id: number,
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      API_ENDPOINTS.CANCEL_TRANSCRIPTION_JOB(id),
    );
    return response.data;
  },

  // Get transcription job status
  getTranscriptionJobStatus: async (
    id: number,
  ): Promise<TranscriptionJob> => {
    const response = await api.get<TranscriptionJob>(
      API_ENDPOINTS.TRANSCRIPTION_JOB_STATUS(id),
    );
    return response.data;
  },
};
