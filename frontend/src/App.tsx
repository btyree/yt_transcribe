import { useState } from 'react';
import { ChannelForm } from './components/ChannelForm';
import { VideoList } from './components/VideoList';
import { SingleVideoForm } from './components/SingleVideoForm';
import { useChannels } from './hooks/useChannels';
import { Button } from './components/catalyst/button';
import type { Channel } from './types/api';

type WorkflowTab = 'channel' | 'single-video';

function App() {
  const [activeTab, setActiveTab] = useState<WorkflowTab>('channel');
  const [createdChannel, setCreatedChannel] = useState<Channel | null>(null);
  const { data: existingChannels } = useChannels();

  const handleChannelCreated = (channel: Channel) => {
    setCreatedChannel(channel);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            YouTube Transcription Tool
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Choose your transcription workflow
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <Button
              onClick={() => setActiveTab('channel')}
              color={activeTab === 'channel' ? 'blue' : 'zinc'}
              className={`flex-1 text-sm ${activeTab === 'channel' ? '' : 'bg-transparent'}`}
            >
              Channel Workflow
            </Button>
            <Button
              onClick={() => setActiveTab('single-video')}
              color={activeTab === 'single-video' ? 'blue' : 'zinc'}
              className={`flex-1 text-sm ${activeTab === 'single-video' ? '' : 'bg-transparent'}`}
            >
              Single Video
            </Button>
          </div>
        </div>

        {/* Channel Workflow */}
        {activeTab === 'channel' && (
          <>
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

            {/* Show existing channels */}
            {existingChannels && existingChannels.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6">
                  Existing Channels
                </h2>
                {existingChannels.map((channel) => (
                  <VideoList key={channel.id} channel={channel} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Single Video Workflow */}
        {activeTab === 'single-video' && (
          <SingleVideoForm />
        )}
      </div>
    </div>
  );
}

export default App;
