import { api } from './api';
import { API_ENDPOINTS } from '../constants/api';
import { type TranscriptionJob, type WordTimestampsResponse } from '../types/api';

export interface CreateTranscriptionJobRequest {
  video_id: number;
  format: 'txt' | 'srt' | 'vtt';
  output_file_name?: string;
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

  // Cancel transcription job
  cancelTranscriptionJob: async (
    id: number,
  ): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(
      API_ENDPOINTS.TRANSCRIPTION_JOB_BY_ID(id),
    );
    return response.data;
  },

  // Retry transcription job
  retryTranscriptionJob: async (
    id: number,
  ): Promise<TranscriptionJob> => {
    const response = await api.post<TranscriptionJob>(
      `${API_ENDPOINTS.TRANSCRIPTION_JOB_BY_ID(id)}/retry`,
    );
    return response.data;
  },

  // Get word-level timestamps for a transcription job
  getWordTimestamps: async (
    jobId: number,
  ): Promise<WordTimestampsResponse> => {
    const response = await api.get<WordTimestampsResponse>(
      `${API_ENDPOINTS.TRANSCRIPTION_JOB_BY_ID(jobId)}/words`,
    );
    return response.data;
  },
};
