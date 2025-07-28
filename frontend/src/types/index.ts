// Re-export all types
export * from './api';

// Common UI types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}