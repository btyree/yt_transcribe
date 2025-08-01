// API configuration constants

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Health
  HEALTH: '/api/v1/health',
  HEALTH_READY: '/api/v1/health/ready',
  HEALTH_LIVE: '/api/v1/health/live',

  // Channels
  CHANNELS: '/api/v1/channels',
  CHANNEL_BY_ID: (id: number) => `/api/v1/channels/${id}`,
  VALIDATE_CHANNEL: '/api/v1/channels/validate',

  // Videos
  VIDEOS: '/api/v1/videos',
  VIDEO_BY_ID: (id: number) => `/api/v1/videos/${id}`,
  VIDEOS_BY_CHANNEL: (channelId: number) =>
    `/api/v1/videos/channel/${channelId}`,
  DISCOVER_VIDEOS: '/api/v1/videos/discover',
  CREATE_VIDEO_FROM_URL: '/api/v1/videos/create-from-url',

  // Transcription Jobs
  TRANSCRIPTION_JOBS: '/api/v1/transcription/jobs',
  TRANSCRIPTION_JOB_BY_ID: (id: number) => `/api/v1/transcription/jobs/${id}`,
  TRANSCRIPTION_VIDEO_INFO: (videoId: number) => `/api/v1/transcription/videos/${videoId}`,
} as const;