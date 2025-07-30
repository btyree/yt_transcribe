import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ClockIcon } from '@heroicons/react/16/solid';
import { Button } from './catalyst/button';
import { useNotes } from '../hooks/useNotes';
import type { Note } from '../types/api';

interface VideoNoteTakerProps {
  videoId: number;
  currentTime: number;
  onSeekToTime: (time: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function VideoNoteTaker({ videoId, currentTime, onSeekToTime, videoRef }: VideoNoteTakerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState('');
  
  const { data: notes, createNote, updateNote, deleteNote } = useNotes(videoId);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCreateNote = async () => {
    if (!noteContent.trim()) return;
    
    try {
      await createNote.mutateAsync({
        start_time: currentTime,
        content: noteContent.trim()
      });
      setNoteContent('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !noteContent.trim()) return;
    
    try {
      await updateNote.mutateAsync({
        noteId: editingNote.id,
        updates: { content: noteContent.trim() }
      });
      setEditingNote(null);
      setNoteContent('');
    } catch (error) {
      console.error('Failed to update note:', error);
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

  const startEditing = (note: Note) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setNoteContent('');
    setIsCreating(false);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-zinc-900">Notes</h3>
          <Button
            onClick={() => {
              // Pause the video when starting to create a note
              if (videoRef.current && !videoRef.current.paused) {
                videoRef.current.pause();
              }
              setIsCreating(true);
              setEditingNote(null);
              setNoteContent('');
            }}
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

      {/* Note Creation/Editing Form */}
      {(isCreating || editingNote) && (
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex-shrink-0">
          <div className="mb-3">
            <div className="flex items-center text-xs text-zinc-600 mb-2">
              <ClockIcon className="w-3 h-3 mr-1" />
              {editingNote ? formatTime(editingNote.start_time) : formatTime(currentTime)}
            </div>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write your note..."
              className="w-full h-20 text-sm border border-zinc-200 rounded px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={editingNote ? handleUpdateNote : handleCreateNote}
              color="dark"
              disabled={!noteContent.trim()}
              className="text-xs px-2 py-1 flex-1"
            >
              {editingNote ? 'Update' : 'Save'}
            </Button>
            <Button
              onClick={cancelEditing}
              color="zinc"
              outline
              className="text-xs px-2 py-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

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
                      onClick={() => startEditing(note)}
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
    </div>
  );
}