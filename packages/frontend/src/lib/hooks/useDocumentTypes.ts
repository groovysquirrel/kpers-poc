/**
 * Custom Hook: useDocumentTypes
 *
 * Purpose: Centralized data management for document types
 * - Handles loading states, error states, and data caching
 * - Provides methods for fetching document types
 * - Implements proper error handling and user feedback
 *
 * Usage: const { documentTypes, loading, error } = useDocumentTypes()
 */

import { useState, useEffect, useCallback } from 'react';
import { client } from '../../api/client';
import { DocumentType } from '../../types/domain';

interface UseDocumentTypesReturn {
  documentTypes: DocumentType[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDocumentTypes(): UseDocumentTypesReturn {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentTypes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const types = await client.getDocumentTypes();
      setDocumentTypes(types);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch document types');
      console.error('Error fetching document types:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchDocumentTypes();
  }, [fetchDocumentTypes]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchDocumentTypes();
  }, [fetchDocumentTypes]);

  return {
    documentTypes,
    loading,
    error,
    refetch
  };
}

