import { useState, useEffect } from 'react';
import { useCreateChannel, useValidateChannel } from '../hooks/useChannels';
import type { Channel, ChannelValidationResponse } from '../types/api';

export interface ChannelFormProps {
  onSuccess?: (channel: Channel) => void;
}

export function ChannelForm({ onSuccess }: ChannelFormProps) {
  const [url, setUrl] = useState('');
  const [validationResult, setValidationResult] = useState<ChannelValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const createChannelMutation = useCreateChannel();
  const validateChannelMutation = useValidateChannel();

  // Debounced validation
  useEffect(() => {
    if (!url.trim()) {
      setValidationResult(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsValidating(true);
      try {
        const result = await validateChannelMutation.mutateAsync(url.trim());
        setValidationResult(result);
      } catch (error) {
        setValidationResult({
          is_valid: false,
          message: 'Failed to validate URL',
          original_url: url.trim(),
          error: 'Validation request failed'
        });
      } finally {
        setIsValidating(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [url, validateChannelMutation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim() || !validationResult?.is_valid) {
      return;
    }

    try {
      const channel = await createChannelMutation.mutateAsync({ url: url.trim() });
      setUrl('');
      setValidationResult(null);
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
          <div className="relative">
            <input
              type="url"
              id="channel-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/@channelname"
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                         validationResult?.is_valid === false 
                           ? 'border-red-300 dark:border-red-600' 
                           : validationResult?.is_valid === true
                           ? 'border-green-300 dark:border-green-600'
                           : 'border-gray-300 dark:border-gray-600'
                       }`}
              required
            />
            {isValidating && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          
          {/* Validation feedback */}
          {validationResult && (
            <div className={`mt-2 text-sm ${
              validationResult.is_valid 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {validationResult.message}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={
            createChannelMutation.isPending || 
            !url.trim() || 
            isValidating || 
            !validationResult?.is_valid
          }
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                   text-white font-medium rounded-md transition-colors
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {createChannelMutation.isPending 
            ? 'Adding Channel...' 
            : isValidating 
            ? 'Validating...' 
            : 'Add Channel'
          }
        </button>
      </form>
    </div>
  );
}