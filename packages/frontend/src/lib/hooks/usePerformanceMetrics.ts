/**
 * Custom Hook: usePerformanceMetrics
 * 
 * Purpose: Centralized data management for performance metrics
 * - Handles loading states, error states, and data caching
 * - Provides methods for fetching performance metrics with filtering
 * - Implements proper error handling and user feedback
 * - Supports filtering by manager and metric year
 * 
 * Usage: const { metrics, loading, error, createMetric } = usePerformanceMetrics({ managerId: 'mgr-1' })
 */

import { useState, useEffect, useCallback } from 'react';
import { client } from '../../api/client';

export interface PerformanceMetric {
  id: string;
  managerId: string;
  metricYear: number;
  returnRate?: number;
  marketValue?: number;
  asOfDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface UsePerformanceMetricsParams {
  managerId?: string;
  metricYear?: number;
  page?: number;
  pageSize?: number;
  autoFetch?: boolean;
}

interface UsePerformanceMetricsReturn {
  metrics: PerformanceMetric[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getMetric: (id: string) => Promise<PerformanceMetric>;
  createMetric: (metricData: {
    managerId: string;
    metricYear: number;
    returnRate?: number;
    marketValue?: number;
    asOfDate: string;
    notes?: string;
  }) => Promise<PerformanceMetric>;
  updateMetric: (id: string, updates: Partial<{
    metricYear: number;
    returnRate: number;
    marketValue: number;
    asOfDate: string;
    notes: string;
  }>) => Promise<PerformanceMetric>;
  deleteMetric: (id: string) => Promise<void>;
}

export function usePerformanceMetrics(params: UsePerformanceMetricsParams = {}): UsePerformanceMetricsReturn {
  const {
    managerId,
    metricYear,
    page = 1,
    pageSize = 25,
    autoFetch = true
  } = params;

  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await client.getPerformanceMetrics({
        managerId,
        metricYear,
        page,
        pageSize
      });
      
      setMetrics(response.items);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch performance metrics');
      console.error('Error fetching performance metrics:', err);
    } finally {
      setLoading(false);
    }
  }, [managerId, metricYear, page, pageSize]);

  const getMetric = useCallback(async (id: string): Promise<PerformanceMetric> => {
    setLoading(true);
    setError(null);
    
    try {
      const metric = await client.getPerformanceMetric(id);
      return metric;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch performance metric');
      console.error('Error fetching performance metric:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createMetric = useCallback(async (metricData: {
    managerId: string;
    metricYear: number;
    returnRate?: number;
    marketValue?: number;
    asOfDate: string;
    notes?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const newMetric = await client.createPerformanceMetric(metricData);
      // Refresh the metrics list after creating
      await fetchMetrics();
      return newMetric;
    } catch (err: any) {
      setError(err.message || 'Failed to create performance metric');
      console.error('Error creating performance metric:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMetrics]);

  const updateMetric = useCallback(async (id: string, updates: Partial<{
    metricYear: number;
    returnRate: number;
    marketValue: number;
    asOfDate: string;
    notes: string;
  }>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedMetric = await client.updatePerformanceMetric(id, updates);
      // Refresh the metrics list after updating
      await fetchMetrics();
      return updatedMetric;
    } catch (err: any) {
      setError(err.message || 'Failed to update performance metric');
      console.error('Error updating performance metric:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMetrics]);

  const deleteMetric = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await client.deletePerformanceMetric(id);
      // Refresh the metrics list after deleting
      await fetchMetrics();
    } catch (err: any) {
      setError(err.message || 'Failed to delete performance metric');
      console.error('Error deleting performance metric:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMetrics]);

  const refetch = useCallback(async () => {
    await fetchMetrics();
  }, [fetchMetrics]);

  // Auto-fetch on mount and when params change
  useEffect(() => {
    if (autoFetch) {
      fetchMetrics();
    }
  }, [fetchMetrics, autoFetch]);

  return {
    metrics,
    pagination,
    loading,
    error,
    refetch,
    getMetric,
    createMetric,
    updateMetric,
    deleteMetric
  };
}

