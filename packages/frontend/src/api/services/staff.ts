/**
 * Staff API Service
 * 
 * Purpose: Handle all staff-related API requests
 * - Encapsulates HTTP calls to the staff endpoints
 * - Transforms data between frontend and backend formats
 * - Provides type-safe API methods
 * 
 * Usage: import { staffService } from './services/staff'
 */

import { httpClient } from '../utils/http';
import {
  StaffRow,
  toFrontendStaff,
  toBackendStaffCreate,
  toBackendStaffUpdate,
} from '../utils/transformers';

export interface Staff {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: string;
  title?: string;
  isActive: boolean;
  status: 'Active' | 'Inactive';
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GetStaffParams {
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface GetStaffResponse {
  items: Staff[];
  page: number;
  pageSize: number;
  total: number;
}

class StaffService {
  private readonly basePath = '/staff';

  /**
   * List all staff members with optional filtering
   */
  async list(params: GetStaffParams = {}): Promise<GetStaffResponse> {
    // Make API call
    const rows = await httpClient.get<StaffRow[]>(this.basePath, params);
    
    // Transform backend data to frontend format
    const staff = rows.map(toFrontendStaff);
    
    // For now, return all staff without pagination
    // TODO: Backend should return pagination metadata
    return {
      items: staff,
      page: params.page || 1,
      pageSize: params.pageSize || 25,
      total: staff.length,
    };
  }

  /**
   * Get a single staff member by ID
   */
  async get(id: string): Promise<Staff> {
    // Make API call
    const row = await httpClient.get<StaffRow>(`${this.basePath}/${id}`);
    
    // Transform backend data to frontend format
    return toFrontendStaff(row);
  }

  /**
   * Create a new staff member
   */
  async create(data: {
    firstName: string;
    lastName: string;
    email?: string;
    title?: string;
    isActive?: boolean;
  }): Promise<Staff> {
    // Transform frontend data to backend format
    const input = toBackendStaffCreate(data);
    
    // Make API call
    const row = await httpClient.post<StaffRow>(this.basePath, input);
    
    // Transform backend response to frontend format
    return toFrontendStaff(row);
  }

  /**
   * Update an existing staff member
   */
  async update(id: string, data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    isActive: boolean;
  }>): Promise<Staff> {
    // Transform frontend data to backend format
    const input = toBackendStaffUpdate(data);
    
    // Make API call
    const row = await httpClient.put<StaffRow>(`${this.basePath}/${id}`, input);
    
    // Transform backend response to frontend format
    return toFrontendStaff(row);
  }

  /**
   * Delete a staff member
   */
  async delete(id: string): Promise<{ ok: boolean; id: string }> {
    // Make API call
    return await httpClient.delete<{ ok: boolean; id: string }>(`${this.basePath}/${id}`);
  }
}

// Export singleton instance
export const staffService = new StaffService();

