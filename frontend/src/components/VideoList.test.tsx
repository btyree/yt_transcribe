import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test/utils';
import { VideoList } from './VideoList';
import type { Channel, Video } from '../types/api';

// Mock the videos hooks
vi.mock('../hooks/useVideos', () => ({
  useVideosByChannel: vi.fn(),
  useDiscoverVideos: vi.fn(),
}));

import { useVideosByChannel, useDiscoverVideos } from '../hooks/useVideos';

const mockChannel: Channel = {
  id: 1,
  youtube_id: 'test123',
  title: 'Test Channel',
  description: 'A test channel',
  url: 'https://www.youtube.com/@test',
  thumbnail_url: 'https://example.com/thumbnail.jpg',
  subscriber_count: 1000,
  video_count: 5,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z'
};

const mockVideos: Video[] = [
  {
    id: 1,
    youtube_id: 'video1',
    channel_id: 1,
    title: 'Test Video 1',
    description: 'First test video',
    url: 'https://www.youtube.com/watch?v=video1',
    thumbnail_url: 'https://example.com/thumb1.jpg',
    duration_seconds: 300,
    view_count: 1000,
    published_at: '2025-01-15T10:00:00Z',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z'
  },
  {
    id: 2,
    youtube_id: 'video2',
    channel_id: 1,
    title: 'Test Video 2',
    description: 'Second test video',
    url: 'https://www.youtube.com/watch?v=video2',
    thumbnail_url: 'https://example.com/thumb2.jpg',
    duration_seconds: 600,
    view_count: 2500,
    published_at: '2025-01-20T15:30:00Z',
    created_at: '2025-01-20T15:30:00Z',
    updated_at: '2025-01-20T15:30:00Z'
  }
];

describe('VideoList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    (useVideosByChannel as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null
    });
    (useDiscoverVideos as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null
    });

    render(<VideoList channel={mockChannel} />);

    expect(screen.getByText('Loading videos...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const mockError = new Error('Failed to load videos');
    (useVideosByChannel as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError
    });
    (useDiscoverVideos as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null
    });

    render(<VideoList channel={mockChannel} />);

    expect(screen.getByText('Error loading videos')).toBeInTheDocument();
    expect(screen.getByText('Failed to load videos')).toBeInTheDocument();
  });

  it('renders empty state when no videos are found', () => {
    (useVideosByChannel as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });
    (useDiscoverVideos as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null
    });

    render(<VideoList channel={mockChannel} />);

    expect(screen.getByText(`Videos from ${mockChannel.title}`)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'No videos found' })).toBeInTheDocument();
    expect(screen.getByText('No videos found', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('Click "Discover Videos" to fetch videos from this channel.')).toBeInTheDocument();
  });

  it('renders videos grid when videos are loaded', () => {
    (useVideosByChannel as any).mockReturnValue({
      data: mockVideos,
      isLoading: false,
      error: null
    });
    (useDiscoverVideos as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null
    });

    render(<VideoList channel={mockChannel} />);

    expect(screen.getByText(`Videos from ${mockChannel.title}`)).toBeInTheDocument();
    expect(screen.getByText('2 videos found')).toBeInTheDocument();
    expect(screen.getByText('Test Video 1')).toBeInTheDocument();
    expect(screen.getByText('Test Video 2')).toBeInTheDocument();
  });

  it('calls discover videos mutation when button is clicked', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue(undefined);
    (useVideosByChannel as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });
    (useDiscoverVideos as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null
    });

    const user = userEvent.setup();
    render(<VideoList channel={mockChannel} />);

    const discoverButton = screen.getByRole('button', { name: /discover videos/i });
    await user.click(discoverButton);

    expect(mockMutateAsync).toHaveBeenCalledWith(mockChannel.youtube_id);
  });

  it('shows loading state for discover videos button', () => {
    (useVideosByChannel as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });
    (useDiscoverVideos as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
      isSuccess: false,
      isError: false,
      error: null
    });

    render(<VideoList channel={mockChannel} />);

    expect(screen.getByRole('button', { name: /discovering.../i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /discovering.../i })).toBeDisabled();
  });

  it('shows success message after discovering videos', () => {
    (useVideosByChannel as any).mockReturnValue({
      data: mockVideos,
      isLoading: false,
      error: null
    });
    (useDiscoverVideos as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isSuccess: true,
      isError: false,
      error: null
    });

    render(<VideoList channel={mockChannel} />);

    expect(screen.getByText('Videos discovered successfully!')).toBeInTheDocument();
  });

  it('shows error message when discover videos fails', () => {
    const mockError = new Error('Failed to discover videos');
    (useVideosByChannel as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    });
    (useDiscoverVideos as any).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: true,
      error: mockError
    });

    render(<VideoList channel={mockChannel} />);

    expect(screen.getByText('Failed to discover videos', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Failed to discover videos', { selector: 'p' })).toBeInTheDocument();
  });
});