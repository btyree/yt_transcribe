import { useState } from 'react';
import { useCreateChannel } from '../hooks/useChannels';
import type { Channel } from '../types/api';

export interface ChannelFormProps {
  onSuccess?: (channel: Channel) => void;
}

export function ChannelForm({ onSuccess }: ChannelFormProps) {
  const [url, setUrl] = useState('');
  const createChannelMutation = useCreateChannel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      return;
    }

    try {
      const channel = await createChannelMutation.mutateAsync({ url: url.trim() });
      setUrl('');
      onSuccess?.(channel);
    } catch (error) {
      // Error handling will be improved in later steps
      console.error('Failed to create channel:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Add YouTube Channel
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="channel-url" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            YouTube Channel URL
          </label>
          <input
            type="url"
            id="channel-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/@channelname"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={createChannelMutation.isPending || !url.trim()}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                   text-white font-medium rounded-md transition-colors
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {createChannelMutation.isPending ? 'Adding Channel...' : 'Add Channel'}
        </button>
      </form>
    </div>
  );
}