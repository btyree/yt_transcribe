import { api } from './api';
import type { Note, NoteCreate, NoteUpdate } from '../types/api';

export const notesApi = {
  createNote: async (videoId: number, data: NoteCreate): Promise<Note> => {
    const response = await api.post(`/api/v1/videos/${videoId}/notes`, data);
    return response.data;
  },

  getVideoNotes: async (videoId: number): Promise<Note[]> => {
    const response = await api.get(`/api/v1/videos/${videoId}/notes`);
    return response.data;
  },

  updateNote: async (noteId: number, data: NoteUpdate): Promise<Note> => {
    const response = await api.put(`/api/v1/notes/${noteId}`, data);
    return response.data;
  },

  deleteNote: async (noteId: number): Promise<void> => {
    await api.delete(`/api/v1/notes/${noteId}`);
  },
};