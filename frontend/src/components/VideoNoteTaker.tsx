import { useState, useRef, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ClockIcon } from '@heroicons/react/16/solid';
import { Button } from './catalyst/button';
import { Modal } from './Modal';
import { useNotes } from '../hooks/useNotes';
import type { Note, WordTimestamp } from '../types/api';

interface VideoNoteTakerProps {
  videoId: number;
  currentTime: number;
  onSeekToTime: (time: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  selectionData?: { text: string; startTime: number; endTime: number } | null;
  onClearSelection?: () => void;
  words: WordTimestamp[];
}

export function VideoNoteTaker({ videoId, currentTime, onSeekToTime, videoRef, selectionData, onClearSelection, words }: VideoNoteTakerProps) {
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'createFromSelection'>('create');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { data: notes, createNote, updateNote, deleteNote } = useNotes(videoId);

  // Handle selection data from transcript
  useEffect(() => {
    if (selectionData) {
      setModalType('createFromSelection');
      setEditingNote(null);
      setNoteContent('');
      setIsModalOpen(true);
    }
  }, [selectionData]);

  // Auto-focus textarea when modal opens
  useEffect(() => {
    if (isModalOpen && textareaRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isModalOpen]);


  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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

  // Check if a word is part of the selected text
  const isWordInSelection = (word: WordTimestamp) => {
    if (!selectionData) return false;
    return word.start >= selectionData.startTime && word.end <= selectionData.endTime;
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return;
    
    try {
      if (modalType === 'edit' && editingNote) {
        await updateNote.mutateAsync({
          noteId: editingNote.id,
          updates: { content: noteContent.trim() }
        });
      } else if (modalType === 'createFromSelection' && selectionData) {
        await createNote.mutateAsync({
          start_time: selectionData.startTime,
          end_time: selectionData.endTime,
          content: noteContent.trim(),
          selected_text: selectionData.text
        });
        onClearSelection?.();
      } else {
        await createNote.mutateAsync({
          start_time: currentTime,
          content: noteContent.trim()
        });
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const openCreateModal = () => {
    setModalType('create');
    setEditingNote(null);
    setNoteContent('');
    setIsModalOpen(true);
    // Pause the video when starting to create a note
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  };

  const openEditModal = (note: Note) => {
    setModalType('edit');
    setEditingNote(note);
    setNoteContent(note.content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
    setNoteContent('');
    if (modalType === 'createFromSelection') {
      onClearSelection?.();
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await deleteNote.mutateAsync(noteId);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-zinc-900">Notes</h3>
          <Button
            onClick={openCreateModal}
            color="dark"
            className="text-xs px-2 py-1"
          >
            <PlusIcon className="w-3 h-3 mr-1" />
            Add Note
          </Button>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Current time: {formatTime(currentTime)}
        </p>
      </div>


      {/* Notes List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {notes && notes.length > 0 ? (
          <div className="p-2 space-y-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-3 bg-zinc-50 rounded border border-zinc-200 hover:bg-zinc-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => onSeekToTime(note.start_time)}
                    className="flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <ClockIcon className="w-3 h-3 mr-1" />
                    {formatTime(note.start_time)}
                  </button>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(note)}
                      className="p-1 text-zinc-400 hover:text-zinc-600 rounded"
                    >
                      <PencilIcon className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 text-zinc-400 hover:text-red-600 rounded"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed">
                  {note.content}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-zinc-100 rounded-lg flex items-center justify-center">
              <PlusIcon className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-600 mb-1">No notes yet</p>
            <p className="text-xs text-zinc-400">
              Click "Add Note" to capture your thoughts at specific timestamps.
            </p>
          </div>
        )}
      </div>

      {/* Note Creation/Editing Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          modalType === 'edit' 
            ? 'Edit Note' 
            : modalType === 'createFromSelection' 
            ? 'Create Note from Selection' 
            : 'Create Note'
        }
        size="2xl"
      >
        <div className="flex gap-6" style={{ height: '400px' }}>
          {/* Left side - Transcript */}
          <div className="flex flex-col w-1/2 min-w-0 h-full">
            <h4 className="text-sm font-medium text-zinc-700 mb-3">Transcript Reference</h4>
            <div 
              className="flex-1 overflow-y-auto border border-zinc-200 rounded-lg p-3 bg-zinc-50"
              style={{ 
                height: 'calc(100% - 2rem)',
                maxHeight: '350px',
                overflowY: 'auto'
              }}
            >
              {words.length > 0 ? (
                <div 
                  className="text-sm leading-relaxed"
                  style={{ 
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    maxWidth: '100%',
                    whiteSpace: 'normal'
                  }}
                >
                  {words.map((word, index) => {
                    const isInSelection = modalType === 'createFromSelection' && isWordInSelection(word);
                    const isActive = findActiveWordIndex(currentTime) === index;
                    
                    return (
                      <span key={index} className="relative">
                        <span
                          className={`cursor-pointer inline-block px-1 py-0.5 rounded transition-colors ${
                            isActive
                              ? 'bg-blue-200 text-blue-900 font-medium'
                              : isInSelection
                              ? 'bg-yellow-200 text-yellow-900 font-medium'
                              : 'hover:bg-zinc-200'
                          }`}
                          onClick={() => onSeekToTime(word.start)}
                          title={`${formatTime(word.start)} - ${formatTime(word.end)}`}
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
                  <p className="text-sm">No transcript available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Note form */}
          <div className="flex flex-col w-1/2 min-w-0 h-full">
            <div className="space-y-4">
              {/* Time information */}
              <div className="flex items-center text-sm text-zinc-600">
                <ClockIcon className="w-4 h-4 mr-2" />
                {modalType === 'edit' && editingNote
                  ? formatTime(editingNote.start_time)
                  : modalType === 'createFromSelection' && selectionData
                  ? `${formatTime(selectionData.startTime)} - ${formatTime(selectionData.endTime)}`
                  : formatTime(currentTime)}
              </div>

              {/* Selected text information */}
              {modalType === 'createFromSelection' && selectionData && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Selected text:</p>
                  <p className="text-sm text-blue-700">"{selectionData.text}"</p>
                </div>
              )}

              {/* Note content textarea */}
              <div className="flex-1">
                <label htmlFor="note-content" className="block text-sm font-medium text-zinc-700 mb-2">
                  Note content
                </label>
                <textarea
                  id="note-content"
                  ref={textareaRef}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your note..."
                  className="w-full h-40 text-sm border border-zinc-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleSaveNote();
                    }
                  }}
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  onClick={closeModal}
                  color="zinc"
                  outline
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveNote}
                  color="dark"
                  disabled={!noteContent.trim()}
                >
                  {modalType === 'edit' ? 'Update Note' : 'Save Note'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}