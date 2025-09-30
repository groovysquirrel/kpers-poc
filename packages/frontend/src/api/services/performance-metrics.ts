/**
 * Performance Metrics API Service
 * 
 * Purpose: Handle all performance-metric-related API requests
 * - Encapsulates HTTP calls to the performance-metrics endpoints
 * - Transforms data between frontend and backend formats
 * - Provides type-safe API methods
 * 
 * Usage: import { performanceMetricsService } from './services/performance-metrics'
 */

import { httpClient } from '../utils/http';
import {
  PerformanceMetricRow,
  toFrontendPerformanceMetric,
  toBackendPerformanceMetricCreate,
  toBackendPerformanceMetricUpdate,
} from '../utils/transformers';

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

export interface GetPerformanceMetricsParams {
  managerId?: string;
  metricYear?: number;
  page?: number;
  pageSize?: number;
}

export interface GetPerformanceMetricsResponse {
  items: PerformanceMetric[];
  page: number;
  pageSize: number;
  total: number;
}

class PerformanceMetricsService {
  private readonly basePath = '/performance-metrics';

  /**
   * List all performance metrics with optional filtering
   */
  async list(params: GetPerformanceMetricsParams = {}): Promise<GetPerformanceMetricsResponse> {
    // Make API call
    const rows = await httpClient.get<PerformanceMetricRow[]>(this.basePath, params);
    
    // Transform backend data to frontend format
    const metrics = rows.map(toFrontendPerformanceMetric);
    
    // For now, return all metrics without pagination
    // TODO: Backend should return pagination metadata
    return {
      items: metrics,
      page: params.page || 1,
      pageSize: params.pageSize || 25,
      total: metrics.length,
    };
  }

  /**
   * Get a single performance metric by ID
   */
  async get(id: string): Promise<PerformanceMetric> {
    // Make API call
    const row = await httpClient.get<PerformanceMetricRow>(`${this.basePath}/${id}`);
    
    // Transform backend data to frontend format
    return toFrontendPerformanceMetric(row);
  }

  /**
   * Create a new performance metric
   */
  async create(data: {
    managerId: string;
    metricYear: number;
    returnRate?: number;
    marketValue?: number;
    asOfDate: string;
    notes?: string;
  }): Promise<PerformanceMetric> {
    // Transform frontend data to backend format
    const input = toBackendPerformanceMetricCreate(data);
    
    // Make API call
    const row = await httpClient.post<PerformanceMetricRow>(this.basePath, input);
    
    // Transform backend response to frontend format
    return toFrontendPerformanceMetric(row);
  }

  /**
   * Update an existing performance metric
   */
  async update(id: string, data: Partial<{
    metricYear: number;
    returnRate: number;
    marketValue: number;
    asOfDate: string;
    notes: string;
  }>): Promise<PerformanceMetric> {
    // Transform frontend data to backend format
    const input = toBackendPerformanceMetricUpdate(data);
    
    // Make API call
    const row = await httpClient.put<PerformanceMetricRow>(`${this.basePath}/${id}`, input);
    
    // Transform backend response to frontend format
    return toFrontendPerformanceMetric(row);
  }

  /**
   * Delete a performance metric
   */
  async delete(id: string): Promise<{ ok: boolean; id: string }> {
    // Make API call
    return await httpClient.delete<{ ok: boolean; id: string }>(`${this.basePath}/${id}`);
  }
}

// Export singleton instance
export const performanceMetricsService = new PerformanceMetricsService();

