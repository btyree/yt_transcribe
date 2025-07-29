import { useState } from 'react';
import { ChannelForm } from './ChannelForm';
import { Button } from './catalyst/button';
import { Input } from './catalyst/input';
import { MagnifyingGlassIcon, PlusIcon, UserIcon } from '@heroicons/react/16/solid';
import type { Channel } from '../types/api';

interface ChannelLibraryProps {
  channels: Channel[];
  onChannelSelect: (channel: Channel) => void;
  selectedChannel: Channel | null;
}

export function ChannelLibrary({ channels, onChannelSelect, selectedChannel }: ChannelLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredChannels = channels.filter(channel =>
    channel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChannelAdded = (channel: Channel) => {
    setShowAddForm(false);
    onChannelSelect(channel);
  };

  const formatSubscriberCount = (count?: number) => {
    if (!count) return '';
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M subscribers`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K subscribers`;
    }
    return `${count} subscribers`;
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-zinc-900">Channel Library</h2>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            color="dark"
            className="px-3 py-2"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Channel
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400 z-10" />
          <Input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 [&>input]:focus:ring-2 [&>input]:focus:ring-blue-500 [&>input]:focus:ring-inset after:hidden"
          />
        </div>
      </div>

      {/* Add Channel Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
          <h3 className="text-sm font-medium text-zinc-900 mb-3">Add New Channel</h3>
          <ChannelForm onSuccess={handleChannelAdded} />
        </div>
      )}

      {/* Channel List */}
      <div className="space-y-2">
        {filteredChannels.length === 0 ? (
          <div className="text-center py-8">
            <UserIcon className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">
              {searchQuery ? 'No channels match your search' : 'No channels added yet'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowAddForm(true)}
                className="mt-3 text-sm"
                color="zinc"
              >
                Add your first channel
              </Button>
            )}
          </div>
        ) : (
          filteredChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onChannelSelect(channel)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedChannel?.id === channel.id
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                {channel.thumbnail_url ? (
                  <img
                    src={channel.thumbnail_url}
                    alt={channel.title}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-zinc-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-medium truncate ${
                    selectedChannel?.id === channel.id ? 'text-white' : 'text-zinc-900'
                  }`}>
                    {channel.title}
                  </h3>
                  <div className="mt-1 space-y-1">
                    {channel.subscriber_count && (
                      <p className={`text-xs ${
                        selectedChannel?.id === channel.id ? 'text-zinc-300' : 'text-zinc-500'
                      }`}>
                        {formatSubscriberCount(channel.subscriber_count)}
                      </p>
                    )}
                    {channel.video_count && (
                      <p className={`text-xs ${
                        selectedChannel?.id === channel.id ? 'text-zinc-300' : 'text-zinc-500'
                      }`}>
                        {channel.video_count} videos
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}