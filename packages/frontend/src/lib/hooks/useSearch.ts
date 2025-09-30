/**
 * Custom Hook: useSearch
 * 
 * Purpose: Centralized search functionality across all data types
 * - Handles loading states, error states, and data caching
 * - Provides methods for searching across managers, events, notes, and documents
 * - Implements proper error handling and user feedback
 * 
 * Usage: const { searchResults, loading, error, performSearch } = useSearch()
 */

import { useState, useCallback } from 'react';
import { client } from '../../api/client';
import { SearchResult } from '../../types/domain';

interface UseSearchParams {
  q: string;
  types?: string; // comma-separated list
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

interface UseSearchReturn {
  searchResults: SearchResult[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
  performSearch: (params: UseSearchParams) => Promise<void>;
  clearResults: () => void;
}

export function useSearch(): UseSearchReturn {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (params: UseSearchParams) => {
    // Don't search if query is empty
    if (!params.q.trim()) {
      setSearchResults([]);
      setPagination({ page: 1, pageSize: 25, total: 0 });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await client.search({
        q: params.q,
        types: params.types,
        from: params.from,
        to: params.to,
        page: params.page || 1,
        pageSize: params.pageSize || 25
      });
      
      setSearchResults(response.items);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total
      });
    } catch (err: any) {
      setError(err.message || 'Failed to perform search');
      console.error('Error performing search:', err);
      setSearchResults([]);
      setPagination({ page: 1, pageSize: 25, total: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setPagination({ page: 1, pageSize: 25, total: 0 });
    setError(null);
  }, []);

  return {
    searchResults,
    pagination,
    loading,
    error,
    performSearch,
    clearResults
  };
}

