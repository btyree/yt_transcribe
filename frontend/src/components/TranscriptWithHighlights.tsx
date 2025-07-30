import { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/16/solid';
import { useNotes } from '../hooks/useNotes';
import type { TranscriptionJob, WordTimestamp } from '../types/api';

interface TranscriptWithHighlightsProps {
  job: TranscriptionJob;
  words: WordTimestamp[];
  currentTime: number;
  onSeekToTime: (time: number) => void;
  onCreateNoteFromSelection?: (selectionData: { text: string; startTime: number; endTime: number }) => void;
}

export function TranscriptWithHighlights({ 
  job, 
  words, 
  currentTime, 
  onSeekToTime,
  onCreateNoteFromSelection 
}: TranscriptWithHighlightsProps) {
  const transcriptRef = useRef<HTMLDivElement>(null);
  const selectionDialogRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  const { data: notes, createNote } = useNotes(job.video?.id || 0);

  // Find active word based on current time
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
        if (time >= word.start) {
          result = mid;
        }
      }
    }
    
    return result;
  };

  // Update active word index when time changes
  useEffect(() => {
    setActiveWordIndex(findActiveWordIndex(currentTime));
  }, [currentTime, words]);

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

  // Click outside to dismiss selection dialog
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedText && selectionDialogRef.current && !selectionDialogRef.current.contains(event.target as Node)) {
        dismissSelection();
      }
    };

    if (selectedText) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [selectedText]);


  const dismissSelection = () => {
    setSelectedText('');
    setSelectionRange(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    
    if (!selectedText) return;

    // Find the word indices for the selection
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    
    // Find the corresponding word timestamps
    const startElement = startContainer.nodeType === Node.TEXT_NODE 
      ? startContainer.parentElement 
      : startContainer as Element;
    const endElement = endContainer.nodeType === Node.TEXT_NODE 
      ? endContainer.parentElement 
      : endContainer as Element;

    const startIndex = startElement?.getAttribute('data-word-index');
    const endIndex = endElement?.getAttribute('data-word-index');

    if (startIndex && endIndex) {
      const startWordIndex = parseInt(startIndex);
      const endWordIndex = parseInt(endIndex);
      
      if (startWordIndex >= 0 && endWordIndex >= 0 && words[startWordIndex] && words[endWordIndex]) {
        setSelectedText(selectedText);
        setSelectionRange({
          start: words[startWordIndex].start,
          end: words[endWordIndex].end
        });
      }
    }
  };

  const handleCreateNoteFromSelection = () => {
    if (!selectedText || !selectionRange || !onCreateNoteFromSelection) return;

    onCreateNoteFromSelection({
      text: selectedText,
      startTime: selectionRange.start,
      endTime: selectionRange.end
    });
    
    // Clear selection
    dismissSelection();
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleWordClick = (word: WordTimestamp) => {
    onSeekToTime(word.start);
  };

  // Check if a word has associated notes
  const getWordNotes = (wordTime: number) => {
    if (!notes) return [];
    return notes.filter(note => 
      Math.abs(note.start_time - wordTime) < 1 // Within 1 second
    );
  };

  // Check if a word is part of a note's selected text
  const isWordInNoteSelection = (word: WordTimestamp) => {
    if (!notes) return false;
    return notes.some(note => {
      // For notes with selected text (text selection notes)
      if (note.selected_text && note.start_time && note.end_time) {
        return word.start >= note.start_time && word.end <= note.end_time;
      }
      // For notes without selected text (single word/time notes)
      if (note.start_time && !note.end_time) {
        // Highlight the exact word that contains the note's timestamp
        return note.start_time >= word.start && note.start_time <= word.end;
      }
      return false;
    });
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 flex-shrink-0">
        <h3 className="font-medium text-zinc-900">Transcript</h3>
        <p className="text-sm text-zinc-500">
          Click words to jump, select text to create notes
        </p>
      </div>

      {/* Selection Actions */}
      {selectedText && (
        <div 
          ref={selectionDialogRef} 
          className="fixed bottom-4 left-4 right-4 mx-auto max-w-lg z-50 p-3 border border-blue-200 bg-blue-50 rounded-lg shadow-lg"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 mb-1">Text Selected</p>
              <p className="text-xs text-blue-700 line-clamp-2 break-words">
                "{selectedText.length > 100 ? selectedText.substring(0, 100) + '...' : selectedText}"
              </p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={handleCreateNoteFromSelection}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Create Note
              </button>
              <button
                onClick={dismissSelection}
                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors flex-shrink-0"
                title="Dismiss selection"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Content */}
      <div 
        ref={transcriptRef}
        className="flex-1 overflow-y-auto p-4 text-sm leading-relaxed min-h-0"
        onMouseUp={handleTextSelection}
      >
        {words.length > 0 ? (
          <div className="space-y-1">
            {words.map((word, index) => {
              const isInNoteSelection = isWordInNoteSelection(word);
              const isActive = activeWordIndex === index;
              
              return (
                <span key={index} className="relative inline-block">
                  <span
                    data-word-index={index}
                    className={`cursor-pointer inline-block px-1 py-0.5 rounded transition-colors ${
                      isActive
                        ? 'bg-blue-200 text-blue-900 font-medium'
                        : isInNoteSelection
                        ? 'bg-yellow-200 text-yellow-900'
                        : 'hover:bg-zinc-100'
                    }`}
                    onClick={() => handleWordClick(word)}
                    title={`${formatTime(word.start)} - ${formatTime(word.end)} (${Math.round(word.confidence * 100)}% confidence)`}
                  >
                    {word.punctuated_word || word.word}
                  </span>
                  {index < words.length - 1 ? ' ' : ''}
                </span>
              );
            })}
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
  );
}