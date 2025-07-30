import { useState, useRef, useEffect } from 'react';
import { Button } from './catalyst/button';
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon,
  XMarkIcon 
} from '@heroicons/react/16/solid';
import type { TranscriptionJob, WordTimestamp } from '../types/api';

interface VideoPlayerProps {
  job: TranscriptionJob;
  words: WordTimestamp[];
  onClose: () => void;
}

export function VideoPlayer({ job, words, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  // Binary search to find the active word based on current time
  const findActiveWordIndex = (time: number): number | null => {
    if (words.length === 0) return null;
    
    let left = 0;
    let right = words.length - 1;
    let result = null;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const word = words[mid];

      if (time >= word.start && time <= word.end) {
        return mid;
      } else if (time < word.start) {
        right = mid - 1;
      } else {
        left = mid + 1;
        // Keep track of the last word that started before current time
        if (time >= word.start) {
          result = mid;
        }
      }
    }
    
    return result;
  };

  // Handle video time updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      setActiveWordIndex(findActiveWordIndex(time));
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [words]);

  // Auto-scroll to active word
  useEffect(() => {
    if (activeWordIndex !== null && transcriptRef.current) {
      const activeWordElement = transcriptRef.current.querySelector(`[data-word-index="${activeWordIndex}"]`);
      if (activeWordElement) {
        activeWordElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [activeWordIndex]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = clickX / rect.width;
    const seekTime = progress * duration;
    handleSeek(seekTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleWordClick = (word: WordTimestamp) => {
    handleSeek(word.start);
  };

  if (!job.video) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <div>
            <h2 className="text-lg font-medium text-zinc-900">
              {job.video.title}
            </h2>
            {job.video.channel && (
              <p className="text-sm text-zinc-500">{job.video.channel.title}</p>
            )}
          </div>
          <Button onClick={onClose} color="zinc" outline>
            <XMarkIcon className="w-4 h-4" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 min-h-0">
          {/* Video Panel */}
          <div className="flex-1 flex flex-col bg-black">
            <div className="flex-1 flex items-center justify-center">
              <video
                ref={videoRef}
                className="max-w-full max-h-full"
                controls={false}
                preload="metadata"
              >
                <source 
                  src={`http://localhost:8000/api/videos/${job.video.id}/file`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Custom Controls */}
            <div className="p-4 bg-zinc-900 text-white">
              {/* Progress Bar */}
              <div 
                className="w-full h-2 bg-zinc-700 rounded cursor-pointer mb-4"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-2 bg-blue-500 rounded"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={togglePlayPause}
                    color="white"
                    className="p-2"
                  >
                    {isPlaying ? (
                      <PauseIcon className="w-5 h-5" />
                    ) : (
                      <PlayIcon className="w-5 h-5" />
                    )}
                  </Button>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={toggleMute}
                      color="white"
                      className="p-2"
                    >
                      {isMuted || volume === 0 ? (
                        <SpeakerXMarkIcon className="w-5 h-5" />
                      ) : (
                        <SpeakerWaveIcon className="w-5 h-5" />
                      )}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
            </div>
          </div>

          {/* Transcript Panel */}
          <div className="w-1/2 border-l border-zinc-200 flex flex-col">
            <div className="p-4 border-b border-zinc-200">
              <h3 className="font-medium text-zinc-900">Transcript</h3>
              <p className="text-sm text-zinc-500">Click on any word to jump to that moment</p>
            </div>
            
            <div 
              ref={transcriptRef}
              className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed"
            >
              {words.length > 0 ? (
                <div className="space-y-1">
                  {words.map((word, index) => (
                    <span
                      key={index}
                      data-word-index={index}
                      className={`cursor-pointer inline-block px-1 py-0.5 rounded transition-colors ${
                        activeWordIndex === index
                          ? 'bg-blue-200 text-blue-900 font-medium'
                          : 'hover:bg-zinc-100'
                      }`}
                      onClick={() => handleWordClick(word)}
                      title={`${formatTime(word.start)} - ${formatTime(word.end)} (${Math.round(word.confidence * 100)}% confidence)`}
                    >
                      {word.punctuated_word || word.word}
                      {index < words.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <p>No word-level timestamps available</p>
                  <p className="text-xs mt-2">
                    This may occur if the transcription job was completed without detailed timing data.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}