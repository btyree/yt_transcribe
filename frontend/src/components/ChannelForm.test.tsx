import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test/utils';
import { ChannelForm } from './ChannelForm';

// Mock the channels service
vi.mock('../services/channels', () => ({
  channelsService: {
    validateChannelUrl: vi.fn(),
    createChannel: vi.fn(),
  }
}));

// Mock the hooks
vi.mock('../hooks/useChannels', () => ({
  useValidateChannel: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      is_valid: true,
      message: 'Valid YouTube channel URL',
      original_url: 'https://www.youtube.com/@test',
      normalized_url: 'https://www.youtube.com/@test'
    }),
    isPending: false,
    error: null,
  }),
  useCreateChannel: () => ({
    mutateAsync: vi.fn().mockResolvedValue({
      id: 1,
      title: 'Test Channel',
      url: 'https://www.youtube.com/@test',
      youtube_id: 'test123',
      description: 'A test channel',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z'
    }),
    isPending: false,
    error: null,
  })
}));

describe('ChannelForm', () => {
  it('renders the form with correct elements', () => {
    render(<ChannelForm />);
    
    expect(screen.getByText('Add YouTube Channel')).toBeInTheDocument();
    expect(screen.getByLabelText('YouTube Channel URL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://www.youtube.com/@channelname')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Channel' })).toBeInTheDocument();
  });

  it('disables submit button when URL is empty', () => {
    render(<ChannelForm />);
    
    const submitButton = screen.getByRole('button', { name: 'Add Channel' });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when valid URL is entered', async () => {
    const user = userEvent.setup();
    render(<ChannelForm />);
    
    const input = screen.getByLabelText('YouTube Channel URL');
    const submitButton = screen.getByRole('button', { name: 'Add Channel' });
    
    await user.type(input, 'https://www.youtube.com/@test');
    
    // Wait for validation to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    }, { timeout: 3000 });
  });

  it('shows validation feedback for valid URL', async () => {
    const user = userEvent.setup();
    render(<ChannelForm />);
    
    const input = screen.getByLabelText('YouTube Channel URL');
    
    await user.type(input, 'https://www.youtube.com/@test');
    
    // Wait for validation message to appear
    await waitFor(() => {
      expect(screen.getByText('Valid YouTube channel URL')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('calls onSuccess callback when form is submitted successfully', async () => {
    const onSuccessMock = vi.fn();
    const user = userEvent.setup();
    render(<ChannelForm onSuccess={onSuccessMock} />);
    
    const input = screen.getByLabelText('YouTube Channel URL');
    const submitButton = screen.getByRole('button', { name: 'Add Channel' });
    
    await user.type(input, 'https://www.youtube.com/@test');
    
    // Wait for validation to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    }, { timeout: 3000 });
    
    await user.click(submitButton);
    
    // Wait for success callback to be called
    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalledWith({
        id: 1,
        title: 'Test Channel',
        url: 'https://www.youtube.com/@test',
        youtube_id: 'test123',
        description: 'A test channel',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      });
    });
  });

  it('clears form after successful submission', async () => {
    const user = userEvent.setup();
    render(<ChannelForm />);
    
    const input = screen.getByLabelText('YouTube Channel URL');
    const submitButton = screen.getByRole('button', { name: 'Add Channel' });
    
    await user.type(input, 'https://www.youtube.com/@test');
    
    // Wait for validation
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    }, { timeout: 3000 });
    
    await user.click(submitButton);
    
    // Wait for form to clear
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });
});