import { useState, useEffect } from 'react';
import { useCreateChannel, useValidateChannel } from '../hooks/useChannels';
import type { Channel, ChannelValidationResponse } from '../types/api';
import { Button } from './catalyst/button';
import { Field, Label, Description, ErrorMessage } from './catalyst/fieldset';
import { Input } from './catalyst/input';
import { Heading } from './catalyst/heading';

export interface ChannelFormProps {
  onSuccess?: (channel: Channel) => void;
}

export function ChannelForm({ onSuccess }: ChannelFormProps) {
  const [url, setUrl] = useState('');
  const [validationResult, setValidationResult] = useState<ChannelValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
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
      } catch (error: unknown) {
        const errorMessage = (error as any)?.response?.data?.detail || 
                           (error as any)?.message || 
                           'Failed to validate URL';
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
      setSubmitError(null);
      onSuccess?.(channel);
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.detail || 
                         (error as any)?.message || 
                         'Failed to create channel';
      setSubmitError(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <Heading className="mb-6">Add YouTube Channel</Heading>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field>
          <Label>YouTube Channel URL</Label>
          <div className="relative">
            <Input
              type="url"
              name="channel-url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setSubmitError(null);
              }}
              placeholder="https://www.youtube.com/@channelname"
              invalid={validationResult?.is_valid === false}
              required
            />
            {isValidating && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          
          {validationResult?.is_valid === true && (
            <Description>{validationResult.message}</Description>
          )}
          
          {validationResult?.is_valid === false && (
            <ErrorMessage>{validationResult.message}</ErrorMessage>
          )}
        </Field>
        
        <Button
          type="submit"
          color="indigo"
          disabled={
            createChannelMutation.isPending || 
            !url.trim() || 
            isValidating || 
            !validationResult?.is_valid
          }
          className="w-full"
        >
          {createChannelMutation.isPending 
            ? 'Adding Channel...' 
            : isValidating 
            ? 'Validating...' 
            : 'Add Channel'
          }
        </Button>
        
        {submitError && (
          <ErrorMessage>{submitError}</ErrorMessage>
        )}
      </form>
    </div>
  );
}