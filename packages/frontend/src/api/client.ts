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

import { api as fakeApi } from './fakeApi';
import { 
  Manager, 
  EventRecord, 
  DocumentItem,
  User,
  EventCreate,
  EventUpdate
} from '../types/domain';

// Configuration
const API_CONFIG = {
  useFakeApi: true, // Set to false when real API is ready
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
      
      // TODO: Replace with real API call
      // const response = await fetch(`${API_CONFIG.baseUrl}/managers?${new URLSearchParams(params)}`);
      // return await response.json();
      
      throw new Error('Real API not implemented yet');
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
      
      // TODO: Replace with real API call
      // const response = await fetch(`${API_CONFIG.baseUrl}/managers/${id}`);
      // return await response.json();
      
      throw new Error('Real API not implemented yet');
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
      
      // TODO: Replace with real API call
      // const response = await fetch(`${API_CONFIG.baseUrl}/managers`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(managerData)
      // });
      // return await response.json();
      
      throw new Error('Real API not implemented yet');
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
      
      // TODO: Replace with real API call
      // const response = await fetch(`${API_CONFIG.baseUrl}/managers/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates)
      // });
      // return await response.json();
      
      throw new Error('Real API not implemented yet');
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
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
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
      
      // TODO: Replace with real API call
      // const response = await fetch(`${API_CONFIG.baseUrl}/events`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(eventData)
      // });
      // return await response.json();
      
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
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
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async getEvent(id: string): Promise<EventRecord> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getEvent(id);
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async updateEvent(id: string, eventData: EventUpdate): Promise<EventRecord> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.updateEvent(id, eventData);
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async deleteEvent(id: string): Promise<{ ok: boolean }> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.deleteEvent(id);
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
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
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async getStaff() {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getStaff();
      }
      
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
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
}

// Export singleton instance
export const client = new ApiClient();