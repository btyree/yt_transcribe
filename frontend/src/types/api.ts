// API types for backend integration

export interface Channel {
  id: number;
  youtube_id: string;
  title: string;
  description?: string;
  url: string;
  thumbnail_url?: string;
  subscriber_count?: number;
  video_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ChannelValidationResponse {
  is_valid: boolean;
  message: string;
  type?: string;
  identifier?: string;
  original_url: string;
  normalized_url?: string;
  error?: string;
}

export interface Video {
  id: number;
  youtube_id: string;
  channel_id: number | null;
  title: string;
  description?: string;
  url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  view_count?: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TranscriptionJob {
  id: number;
  video_id: number;
  status:
    | 'pending'
    | 'downloading'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled';
  format: 'txt' | 'srt' | 'vtt';
  output_file_path?: string;
  transcript_content?: string;
  deepgram_response?: string;
  error_message?: string;
  progress_percentage: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  video?: Video & { channel?: Channel };
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  environment: {
    debug: boolean;
    log_level: string;
    max_concurrent_jobs: number;
    database_url: string;
    has_youtube_api_key: boolean;
    has_deepgram_api_key: boolean;
  };
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  confidence: number;
  punctuated_word?: string;
  speaker?: number;
}

export interface WordTimestampsResponse {
  job_id: number;
  video_id: number;
  words: WordTimestamp[];
  total_words: number;
  duration?: number;
}
