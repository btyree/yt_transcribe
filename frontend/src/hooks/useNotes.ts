import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '../services/notes';
import type { Note, NoteCreate, NoteUpdate } from '../types/api';

export function useNotes(videoId: number) {
  const queryClient = useQueryClient();
  const queryKey = ['notes', videoId];

  const query = useQuery({
    queryKey,
    queryFn: () => notesApi.getVideoNotes(videoId),
    enabled: videoId > 0,
  });

  const createNote = useMutation({
    mutationFn: (data: NoteCreate) => notesApi.createNote(videoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateNote = useMutation({
    mutationFn: ({ noteId, updates }: { noteId: number; updates: NoteUpdate }) =>
      notesApi.updateNote(noteId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteNote = useMutation({
    mutationFn: (noteId: number) => notesApi.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    createNote,
    updateNote,
    deleteNote,
  };
}