/**
 * Custom Hook: useManagers
 * 
 * Purpose: Centralized data management for managers
 * - Handles loading states, error states, and data caching
 * - Provides methods for fetching managers and individual manager details
 * - Implements proper error handling and user feedback
 * 
 * Usage: const { managers, loading, error, getManager } = useManagers()
 */

import { useState, useEffect, useCallback } from 'react';
import { client } from '../../api/client';
import { Manager } from '../../types/domain';

interface UseManagersParams {
  q?: string;
  status?: 'Active' | 'Terminated' | 'Probation';
  page?: number;
  pageSize?: number;
  autoFetch?: boolean;
}

interface UseManagersReturn {
  managers: Manager[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getManager: (id: string) => Promise<Manager>;
  createManager: (managerData: {
    firstName: string;
    lastName: string;
    company: string;
    phone: string;
    email: string;
    status: 'Active' | 'Terminated' | 'Probation';
    marketValue: number;
    asOfDate: string;
  }) => Promise<Manager>;
  updateManager: (id: string, updates: Partial<Manager>) => Promise<Manager>;
  deleteManager: (id: string) => Promise<void>;
}

export function useManagers(params: UseManagersParams = {}): UseManagersReturn {
  const {
    q,
    status,
    page = 1,
    pageSize = 25,
    autoFetch = true
  } = params;

  const [managers, setManagers] = useState<Manager[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchManagers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await client.getManagers({
        q,
        status,
        page,
        pageSize
      });
      
      setManagers(response.items);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch managers');
      console.error('Error fetching managers:', err);
    } finally {
      setLoading(false);
    }
  }, [q, status, page, pageSize]);

  const getManager = useCallback(async (id: string): Promise<Manager> => {
    setLoading(true);
    setError(null);
    
    try {
      const manager = await client.getManager(id);
      return manager;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch manager');
      console.error('Error fetching manager:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createManager = useCallback(async (managerData: {
    firstName: string;
    lastName: string;
    company: string;
    phone: string;
    email: string;
    status: 'Active' | 'Terminated' | 'Probation';
    marketValue: number;
    asOfDate: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const newManager = await client.createManager(managerData);
      // Refresh the managers list after creating
      await fetchManagers();
      return newManager;
    } catch (err: any) {
      setError(err.message || 'Failed to create manager');
      console.error('Error creating manager:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchManagers]);

  const updateManager = useCallback(async (id: string, updates: Partial<Manager>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedManager = await client.updateManager(id, updates);
      // Refresh the managers list after updating
      await fetchManagers();
      return updatedManager;
    } catch (err: any) {
      setError(err.message || 'Failed to update manager');
      console.error('Error updating manager:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchManagers]);

  const deleteManager = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await client.deleteManager(id);
      // Refresh the managers list after deleting
      await fetchManagers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete manager');
      console.error('Error deleting manager:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchManagers]);

  const refetch = useCallback(async () => {
    await fetchManagers();
  }, [fetchManagers]);

  // Auto-fetch on mount and when params change
  useEffect(() => {
    if (autoFetch) {
      fetchManagers();
    }
  }, [fetchManagers, autoFetch]);

  return {
    managers,
    pagination,
    loading,
    error,
    refetch,
    getManager,
    createManager,
    updateManager,
    deleteManager
  };
}
