/**
 * Custom Hook: useDocuments
 * 
 * Purpose: Centralized data management for documents
 * - Handles loading states, error states, and data caching
 * - Provides methods for fetching documents, creating, updating, and deleting
 * - Implements proper error handling and user feedback
 * - Supports filtering by manager, event, and search terms
 * 
 * Usage: const { documents, loading, error, createDocument, deleteDocument } = useDocuments()
 */

import { useState, useEffect, useCallback } from 'react';
import { client } from '../../api/client';
import { DocumentItem } from '../../types/domain';

interface UseDocumentsParams {
  managerId?: string;
  eventId?: string;
  q?: string;
  page?: number;
  pageSize?: number;
  autoFetch?: boolean;
}

interface UseDocumentsReturn {
  documents: DocumentItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getDocument: (id: string) => Promise<DocumentItem>;
  createDocument: (documentData: {
    managerId: string;
    eventId?: string;
    filename: string;
    contentType: string;
    size: number;
    title: string;
  }) => Promise<{ uploadUrl: string; document: DocumentItem }>;
  updateDocument: (id: string, updates: Partial<DocumentItem>) => Promise<DocumentItem>;
  deleteDocument: (id: string) => Promise<{ ok: boolean }>;
}

export function useDocuments(params: UseDocumentsParams = {}): UseDocumentsReturn {
  const {
    managerId,
    eventId,
    q,
    page = 1,
    pageSize = 25,
    autoFetch = true
  } = params;

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await client.getDocuments({
        managerId,
        eventId,
        q,
        page,
        pageSize
      });
      
      setDocuments(response.items);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch documents');
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  }, [managerId, eventId, q, page, pageSize]);

  const getDocument = useCallback(async (id: string): Promise<DocumentItem> => {
    setLoading(true);
    setError(null);
    
    try {
      const document = await client.getDocument(id);
      return document;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch document');
      console.error('Error fetching document:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createDocument = useCallback(async (documentData: {
    managerId: string;
    eventId?: string;
    filename: string;
    contentType: string;
    size: number;
    title: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await client.createDocument(documentData);
      // Refresh the documents list after creating
      await fetchDocuments();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to create document');
      console.error('Error creating document:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchDocuments]);

  const updateDocument = useCallback(async (id: string, updates: Partial<DocumentItem>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedDocument = await client.updateDocument(id, updates);
      // Refresh the documents list after updating
      await fetchDocuments();
      return updatedDocument;
    } catch (err: any) {
      setError(err.message || 'Failed to update document');
      console.error('Error updating document:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchDocuments]);

  const deleteDocument = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await client.deleteDocument(id);
      // Refresh the documents list after deleting
      await fetchDocuments();
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
      console.error('Error deleting document:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchDocuments]);

  const refetch = useCallback(async () => {
    await fetchDocuments();
  }, [fetchDocuments]);

  // Auto-fetch on mount and when params change
  useEffect(() => {
    if (autoFetch) {
      fetchDocuments();
    }
  }, [fetchDocuments, autoFetch]);

  return {
    documents,
    pagination,
    loading,
    error,
    refetch,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument
  };
}
