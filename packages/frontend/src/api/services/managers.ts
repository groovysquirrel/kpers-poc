/**
 * Managers API Service
 * 
 * Purpose: Handle all manager-related API requests
 * - Encapsulates HTTP calls to the managers endpoints
 * - Transforms data between frontend and backend formats
 * - Provides type-safe API methods
 * 
 * Pattern: This service demonstrates the pattern to follow for other entities:
 * 1. Import httpClient for HTTP requests
 * 2. Import transformers for data conversion
 * 3. Create methods for each API endpoint (list, get, create, update, delete)
 * 4. Transform request data (frontend -> backend)
 * 5. Transform response data (backend -> frontend)
 * 
 * Usage: import { managersService } from './services/managers'
 */

import { httpClient } from '../utils/http';
import { Manager } from '../../types/domain';
import {
  ManagerRow,
  toFrontendManager,
  toFrontendManagers,
  toBackendManagerCreate,
  toBackendManagerUpdate,
} from '../utils/transformers';

export interface GetManagersParams {
  q?: string;
  status?: 'Active' | 'Terminated' | 'Probation';
  page?: number;
  pageSize?: number;
}

export interface GetManagersResponse {
  items: Manager[];
  page: number;
  pageSize: number;
  total: number;
}

class ManagersService {
  private readonly basePath = '/managers';

  /**
   * List all managers with optional filtering and pagination
   */
  async list(params: GetManagersParams = {}): Promise<GetManagersResponse> {
    // Make API call
    const rows = await httpClient.get<ManagerRow[]>(this.basePath, params);
    
    // Transform backend data to frontend format
    const managers = toFrontendManagers(rows);
    
    // For now, return all managers without pagination
    // TODO: Backend should return pagination metadata
    return {
      items: managers,
      page: params.page || 1,
      pageSize: params.pageSize || 25,
      total: managers.length,
    };
  }

  /**
   * Get a single manager by ID
   */
  async get(id: string): Promise<Manager> {
    // Make API call
    const row = await httpClient.get<ManagerRow>(`${this.basePath}/${id}`);
    
    // Transform backend data to frontend format
    return toFrontendManager(row);
  }

  /**
   * Create a new manager
   */
  async create(data: {
    firstName: string;
    lastName: string;
    company: string;
    phone: string;
    email: string;
    status: 'Active' | 'Terminated' | 'Probation';
    marketValue: number;
    asOfDate: string;
  }): Promise<Manager> {
    // Transform frontend data to backend format
    const input = toBackendManagerCreate(data);
    
    // Make API call
    const row = await httpClient.post<ManagerRow>(this.basePath, input);
    
    // Transform backend response to frontend format
    return toFrontendManager(row);
  }

  /**
   * Update an existing manager
   */
  async update(id: string, data: Partial<Manager>): Promise<Manager> {
    // Transform frontend data to backend format
    const input = toBackendManagerUpdate(data);
    
    // Make API call
    const row = await httpClient.put<ManagerRow>(`${this.basePath}/${id}`, input);
    
    // Transform backend response to frontend format
    return toFrontendManager(row);
  }

  /**
   * Delete a manager
   */
  async delete(id: string): Promise<{ ok: boolean; id: string }> {
    // Make API call
    return await httpClient.delete<{ ok: boolean; id: string }>(`${this.basePath}/${id}`);
  }
}

// Export singleton instance
export const managersService = new ManagersService();

