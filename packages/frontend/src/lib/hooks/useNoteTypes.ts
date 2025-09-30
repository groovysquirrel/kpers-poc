/**
 * Custom Hook: useNoteTypes
 *
 * Purpose: Centralized data management for note types
 * - Handles loading states, error states, and data caching
 * - Provides methods for fetching note types
 * - Implements proper error handling and user feedback
 *
 * Usage: const { noteTypes, loading, error } = useNoteTypes()
 */

import { useState, useEffect, useCallback } from 'react';
import { client } from '../../api/client';
import { NoteType } from '../../types/domain';

interface UseNoteTypesReturn {
  noteTypes: NoteType[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNoteTypes(): UseNoteTypesReturn {
  const [noteTypes, setNoteTypes] = useState<NoteType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNoteTypes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const types = await client.getNoteTypes();
      setNoteTypes(types);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch note types');
      console.error('Error fetching note types:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchNoteTypes();
  }, [fetchNoteTypes]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchNoteTypes();
  }, [fetchNoteTypes]);

  return {
    noteTypes,
    loading,
    error,
    refetch
  };
}

