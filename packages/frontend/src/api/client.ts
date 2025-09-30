/**
 * API Client
 * 
 * Purpose: Centralized API client that can switch between fake and real APIs
 * - Currently uses fake API for development
 * - Easy to switch to real API by changing the import
 * - Provides consistent error handling and response formatting
 * 
 * Usage: Import and use like any API client
 * Example: const managers = await client.managers.list({ page: 1 })
 */

import { api as fakeApi } from './mock/mockApi';
import { managersService } from './services/managers';
import { eventsService } from './services/events';
import { eventTypesService } from './services/event-types';
import {
  Manager,
  EventRecord,
  DocumentItem,
  User,
  EventCreate,
  EventUpdate,
  StaffMember,
  Permission,
  Role,
  Note,
  NoteType,
  NoteCreateForm,
  NoteUpdateForm
} from '../types/domain';

// Configuration
const API_CONFIG = {
  useFakeApi: false, // Set to false when real API is ready
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
};

// Error handling utility
const handleApiError = (error: any): never => {
  if (error.status && error.code && error.message) {
    // Already formatted API error
    throw error;
  }
  
  // Network or other error
  throw {
    status: 500,
    code: 'NETWORK_ERROR',
    message: error.message || 'An unexpected error occurred',
    details: error
  };
};

// API Client class
class ApiClient {
  // -----------------------------
  // Managers
  // -----------------------------
  async getManagers(params: {
    q?: string;
    status?: 'Active' | 'Terminated' | 'Probation';
    page?: number;
    pageSize?: number;
  } = {}): Promise<any> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getManagers(params);
      }
      
      // Use real API
      return await managersService.list(params);
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async getManager(id: string): Promise<Manager> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getManager(id);
      }
      
      // Use real API
      return await managersService.get(id);
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async createManager(managerData: {
    firstName: string;
    lastName: string;
    company: string;
    phone: string;
    email: string;
    status: 'Active' | 'Terminated' | 'Probation';
    marketValue: number;
    asOfDate: string;
  }): Promise<Manager> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.createManager(managerData);
      }
      
      // Use real API
      return await managersService.create(managerData);
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async updateManager(id: string, updates: Partial<Manager>): Promise<Manager> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.updateManager(id, updates);
      }
      
      // Use real API
      return await managersService.update(id, updates);
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async deleteManager(id: string): Promise<{ ok: boolean; id: string }> {
    try {
      if (API_CONFIG.useFakeApi) {
        // Fake API doesn't have delete, so we'll create a dummy response
        return { ok: true, id };
      }
      
      // Use real API
      return await managersService.delete(id);
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async getManagerEvents(managerId: string, params: {
    type?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<any> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getManagerEvents(managerId, params);
      }
      
      // Use real API - delegate to getEvents with managerId filter
      return await this.getEvents({ ...params, managerId });
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  // -----------------------------
  // Events
  // -----------------------------
  async createEvent(eventData: EventCreate): Promise<EventRecord> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.createEvent(eventData);
      }
      
      // Service handles event type name lookup
      return await eventsService.create(eventData);
    } catch (error) {
      handleApiError(error);
      return {} as any;
    }
  }

  async getEvents(params: {
    managerId?: string;
    type?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<any> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getEvents(params);
      }
      
      // Service handles event type name lookup
      return await eventsService.list(params);
    } catch (error) {
      handleApiError(error);
      return {} as any;
    }
  }

  async getEvent(id: string): Promise<EventRecord> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getEvent(id);
      }
      
      // Service handles event type name lookup
      return await eventsService.get(id);
    } catch (error) {
      handleApiError(error);
      return {} as any;
    }
  }

  async updateEvent(id: string, eventData: EventUpdate): Promise<EventRecord> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.updateEvent(id, eventData);
      }
      
      // Service handles event type name lookup
      return await eventsService.update(id, eventData);
    } catch (error) {
      handleApiError(error);
      return {} as any;
    }
  }

  async deleteEvent(id: string): Promise<{ ok: boolean }> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.deleteEvent(id);
      }
      
      const result = await eventsService.delete(id);
      return { ok: result.ok };
    } catch (error) {
      handleApiError(error);
      return {} as any;
    }
  }

  // -----------------------------
  // Documents
  // -----------------------------
  async getDocuments(params: {
    managerId?: string;
    eventId?: string;
    q?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<any> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getDocuments(params);
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async createDocument(documentData: {
    managerId: string;
    eventId?: string;
    filename: string;
    contentType: string;
    size: number;
  }): Promise<{ uploadUrl: string; document: DocumentItem }> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.createDocument(documentData);
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async updateDocument(id: string, updates: Partial<DocumentItem>): Promise<DocumentItem> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.updateDocument(id, updates);
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async getDocument(id: string): Promise<DocumentItem> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getDocument(id);
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async deleteDocument(id: string): Promise<{ ok: boolean }> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.deleteDocument(id);
      }

      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  // -----------------------------
  // Notes
  // -----------------------------
  async getNotes(params: {
    q?: string;
    type?: string;
    managerId?: string;
    eventId?: string;
    staffId?: string;
    documentId?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<any> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getNotes(params);
      }

      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async getNote(id: string): Promise<Note> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getNote(id);
      }

      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async createNote(noteData: NoteCreateForm): Promise<Note> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.createNote(noteData);
      }

      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async updateNote(id: string, updates: NoteUpdateForm): Promise<Note> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.updateNote(id, updates);
      }

      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async deleteNote(id: string): Promise<{ ok: boolean }> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.deleteNote(id);
      }

      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  // -----------------------------
  // Note Types
  // -----------------------------
  async getNoteTypes(): Promise<NoteType[]> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getNoteTypes();
      }

      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return [] as any; // This will never be reached since handleApiError throws
    }
  }

  // -----------------------------
  // Search
  // -----------------------------
  async search(params: {
    q: string;
    types?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }): Promise<any> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.search(params);
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  // -----------------------------
  // Users & RBAC
  // -----------------------------
  async getMe(): Promise<User> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getMe();
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async getUser(id: string): Promise<User> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getUser(id);
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async updateUserRole(id: string, role: 'Viewer' | 'Editor' | 'Administrator'): Promise<User> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.updateUserRole(id, role);
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  // -----------------------------
  // Utility Methods
  // -----------------------------
  async getEventTypes() {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getEventTypes();
      }
      
      // Service returns the right format
      const eventTypes = await eventTypesService.list();
      return eventTypes.map(et => ({ id: et.id, name: et.name }));
    } catch (error) {
      handleApiError(error);
      return {} as any;
    }
  }

  async getStaff() {
    try {
      // Staff API not implemented yet in backend, use fake data for now
      // TODO: Replace with real API call when staff service is ready
      return await fakeApi.getStaff();
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  // -----------------------------
  // Users API
  // -----------------------------
  async getUsers(): Promise<User[]> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getUsers();
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return [] as any; // This will never be reached since handleApiError throws
    }
  }

  async createUser(userData: {
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'Viewer' | 'Editor' | 'Administrator';
    status: 'Active' | 'Inactive' | 'Suspended';
    permissions: string[];
  }): Promise<User> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.createUser(userData);
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.updateUser(id, updates);
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.deleteUser(id);
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
    }
  }

  // -----------------------------
  // Staff Management API
  // -----------------------------
  async createStaff(staffData: {
    name: string;
    role: string;
    email?: string;
    phone?: string;
    department?: string;
    status: 'Active' | 'Inactive' | 'Suspended';
    permissions: string[];
  }): Promise<StaffMember> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.createStaff(staffData);
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async updateStaff(id: string, updates: Partial<StaffMember>): Promise<StaffMember> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.updateStaff(id, updates);
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async deleteStaff(id: string): Promise<void> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.deleteStaff(id);
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
    }
  }

  // -----------------------------
  // Permissions & Roles API
  // -----------------------------
  async getPermissions(): Promise<Permission[]> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getPermissions();
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return [] as any; // This will never be reached since handleApiError throws
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getRoles();
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return [] as any; // This will never be reached since handleApiError throws
    }
  }

  // -----------------------------
  // Configuration
  // -----------------------------
  
  /**
   * Switch to real API (call this when backend is ready)
   */
  enableRealApi(): void {
    API_CONFIG.useFakeApi = false;
  }

  /**
   * Switch back to fake API (useful for testing)
   */
  enableFakeApi(): void {
    API_CONFIG.useFakeApi = true;
  }

  /**
   * Check if currently using fake API
   */
  isUsingFakeApi(): boolean {
    return API_CONFIG.useFakeApi;
  }

  /**
   * Enable error simulation in fake API (for testing)
   */
  enableErrorSimulation(): void {
    if (API_CONFIG.useFakeApi) {
      fakeApi.enableErrorSimulation();
    }
  }

  /**
   * Disable error simulation in fake API
   */
  disableErrorSimulation(): void {
    if (API_CONFIG.useFakeApi) {
      fakeApi.disableErrorSimulation();
    }
  }

  /**
   * Check if error simulation is enabled
   */
  isErrorSimulationEnabled(): boolean {
    return API_CONFIG.useFakeApi && fakeApi.isErrorSimulationEnabled();
  }
}

// Export singleton instance
export const client = new ApiClient();