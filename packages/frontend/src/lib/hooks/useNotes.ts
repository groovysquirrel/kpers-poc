/**
 * Custom Hook: useNotes
 *
 * Purpose: Centralized data management for notes
 * - Handles loading states, error states, and data caching
 * - Provides methods for fetching notes with filtering and pagination
 * - Implements proper error handling and user feedback
 *
 * Usage: const { notes, loading, error, createNote, updateNote, deleteNote } = useNotes()
 */

import { useState, useEffect, useCallback } from 'react';
import { client } from '../../api/client';
import { Note, NoteCreateForm, NoteUpdateForm } from '../../types/domain';

interface UseNotesParams {
  q?: string;
  type?: string;
  managerId?: string;
  eventId?: string;
  staffId?: string;
  documentId?: string;
  page?: number;
  pageSize?: number;
  autoFetch?: boolean;
}

interface UseNotesReturn {
  notes: Note[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createNote: (noteData: NoteCreateForm) => Promise<Note>;
  updateNote: (id: string, updates: NoteUpdateForm) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  getNote: (id: string) => Promise<Note>;
}

export function useNotes(params: UseNotesParams = {}): UseNotesReturn {
  const {
    q,
    type,
    managerId,
    eventId,
    staffId,
    documentId,
    page = 1,
    pageSize = 25,
    autoFetch = true
  } = params;

  const [notes, setNotes] = useState<Note[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await client.getNotes({
        q,
        type,
        managerId,
        eventId,
        staffId,
        documentId,
        page,
        pageSize
      });

      setNotes(response.items);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notes');
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  }, [q, type, managerId, eventId, staffId, documentId, page, pageSize]);

  const getNote = useCallback(async (id: string): Promise<Note> => {
    setLoading(true);
    setError(null);

    try {
      const note = await client.getNote(id);
      return note;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch note');
      console.error('Error fetching note:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createNote = useCallback(async (noteData: NoteCreateForm) => {
    setLoading(true);
    setError(null);

    try {
      const newNote = await client.createNote(noteData);
      // Refresh the notes list after creating
      await fetchNotes();
      return newNote;
    } catch (err: any) {
      setError(err.message || 'Failed to create note');
      console.error('Error creating note:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchNotes]);

  const updateNote = useCallback(async (id: string, updates: NoteUpdateForm) => {
    setLoading(true);
    setError(null);

    try {
      const updatedNote = await client.updateNote(id, updates);
      // Refresh the notes list after updating
      await fetchNotes();
      return updatedNote;
    } catch (err: any) {
      setError(err.message || 'Failed to update note');
      console.error('Error updating note:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchNotes]);

  const deleteNote = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await client.deleteNote(id);
      // Refresh the notes list after deleting
      await fetchNotes();
    } catch (err: any) {
      setError(err.message || 'Failed to delete note');
      console.error('Error deleting note:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchNotes]);

  const refetch = useCallback(async () => {
    await fetchNotes();
  }, [fetchNotes]);

  // Auto-fetch on mount and when params change
  useEffect(() => {
    if (autoFetch) {
      fetchNotes();
    }
  }, [fetchNotes, autoFetch]);

  return {
    notes,
    pagination,
    loading,
    error,
    refetch,
    createNote,
    updateNote,
    deleteNote,
    getNote
  };
}

