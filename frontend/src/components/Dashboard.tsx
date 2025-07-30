import { useState } from 'react';
import { ChannelForm } from './ChannelForm';
import { VideoList } from './VideoList';
import { SingleVideoForm } from './SingleVideoForm';
import { ChannelLibrary } from './ChannelLibrary';
import { TranscribedVideos } from './TranscribedVideos';
import { useChannels } from '../hooks/useChannels';
import { Button } from './catalyst/button';
import type { Channel } from '../types/api';

type WorkflowTab = 'channels' | 'transcribed' | 'single-video';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<WorkflowTab>('channels');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const { data: existingChannels } = useChannels();

  const handleChannelSelected = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Swiss-style header with grid system */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light tracking-tight text-zinc-900">
                YouTube Transcription
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Efficiently transcribe and organize video content
              </p>
            </div>
            <div className="flex items-center space-x-1 bg-zinc-100 rounded-lg p-1">
              <Button
                onClick={() => setActiveTab('channels')}
                color={activeTab === 'channels' ? 'dark' : 'zinc'}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'channels' ? 'bg-zinc-900 shadow-sm text-white' : 'bg-transparent text-zinc-900 hover:text-zinc-800'}`}
              >
                Channels
              </Button>
              <Button
                onClick={() => setActiveTab('single-video')}
                color={activeTab === 'single-video' ? 'dark' : 'zinc'}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'single-video' ? 'bg-zinc-900 shadow-sm text-white' : 'bg-transparent text-zinc-900 hover:text-zinc-800'}`}
              >
                Single Video
              </Button>
              <Button
                onClick={() => setActiveTab('transcribed')}
                color={activeTab === 'transcribed' ? 'dark' : 'zinc'}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'transcribed' ? 'bg-zinc-900 shadow-sm text-white' : 'bg-transparent text-zinc-900 hover:text-zinc-800'}`}
              >
                Transcribed
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="mx-auto max-w-7xl px-8 py-8">
        {/* Channels Tab */}
        {activeTab === 'channels' && (
          <div className="grid grid-cols-12 gap-8">
            {/* Left sidebar - Channel library */}
            <div className="col-span-4">
              <ChannelLibrary
                channels={existingChannels || []}
                onChannelSelect={handleChannelSelected}
                selectedChannel={selectedChannel}
              />
            </div>
            
            {/* Right content - Video list or empty state */}
            <div className="col-span-8">
              {selectedChannel ? (
                <VideoList channel={selectedChannel} />
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-zinc-900 mb-2">
                    Select a channel to view videos
                  </h3>
                  <p className="text-zinc-500 mb-6">
                    Choose a channel from the library or add a new one to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Single Video Tab */}
        {activeTab === 'single-video' && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl font-medium text-zinc-900 mb-2">
                Transcribe Single Video
              </h2>
              <p className="text-zinc-500">
                Enter a YouTube video URL to transcribe it directly without adding to a channel.
              </p>
            </div>
            <SingleVideoForm />
          </div>
        )}

        {/* Transcribed Videos Tab */}
        {activeTab === 'transcribed' && (
          <TranscribedVideos />
        )}
      </main>
    </div>
  );
}