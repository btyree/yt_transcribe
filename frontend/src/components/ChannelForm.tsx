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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const createChannelMutation = useCreateChannel();
  const validateChannelMutation = useValidateChannel();

  // Debounced validation
  useEffect(() => {
    if (!url.trim()) {
      setValidationResult(null);
      setValidationError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsValidating(true);
      setValidationError(null);
      try {
        const result = await validateChannelMutation.mutateAsync(url.trim());
        setValidationResult(result);
      } catch (error: any) {
        const errorMessage = error?.response?.data?.detail || 
                           error?.message || 
                           'Failed to validate URL';
        setValidationError(errorMessage);
        setValidationResult({
          is_valid: false,
          message: errorMessage,
          original_url: url.trim(),
          error: errorMessage
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

    setSubmitError(null);
    
    try {
      const channel = await createChannelMutation.mutateAsync({ url: url.trim() });
      setUrl('');
      setValidationResult(null);
      setValidationError(null);
      setSubmitError(null);
      onSuccess?.(channel);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || 
                         error?.message || 
                         'Failed to create channel';
      setSubmitError(errorMessage);
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
              onChange={(e) => {
                setUrl(e.target.value);
                setSubmitError(null); // Clear submit errors when user types
              }}
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
        
        {/* Submit error display */}
        {submitError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error creating channel
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {submitError}
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}