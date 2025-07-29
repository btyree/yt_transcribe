import { useState } from 'react';
import { ChannelForm } from './components/ChannelForm';
import { VideoList } from './components/VideoList';
import type { Channel } from './types/api';

function App() {
  const [createdChannel, setCreatedChannel] = useState<Channel | null>(null);

  const handleChannelCreated = (channel: Channel) => {
    setCreatedChannel(channel);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            YouTube Transcription Tool
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add a YouTube channel to start transcribing videos
          </p>
        </div>

        <ChannelForm onSuccess={handleChannelCreated} />

        {createdChannel && (
          <>
            <div className="max-w-md mx-auto mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                Channel Added Successfully!
              </h3>
              <p className="text-green-700 dark:text-green-300">
                <strong>{createdChannel.title}</strong> has been added to your channels.
              </p>
            </div>
            
            <VideoList channel={createdChannel} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
