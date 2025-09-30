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
import { documentsService } from './services/documents';
import { documentTypesService } from './services/document-types';
import { notesService } from './services/notes';
import { noteTypesService } from './services/note-types';
import { staffService } from './services/staff';
import { performanceMetricsService } from './services/performance-metrics';
import {
  Manager,
  EventRecord,
  User,
  EventCreate,
  EventUpdate,
  StaffMember,
  Permission,
  Role,
  Note,
  NoteType,
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
      
      return await documentsService.list(params);
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async createDocument(documentData: {
    eventId?: string;
    documentTypeId: string;
    filename: string;
    date: string;
    url?: string;
    author?: string;
    description?: string;
  }): Promise<any> {
    try {
      if (API_CONFIG.useFakeApi) {
        // Fake API has a different signature, adapt it
        return await fakeApi.createDocument(documentData as any);
      }
      
      return await documentsService.create(documentData);
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async updateDocument(id: string, updates: Partial<{
    eventId: string;
    documentTypeId: string;
    filename: string;
    date: string;
    url: string;
    author: string;
    description: string;
  }>): Promise<any> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.updateDocument(id, updates as any);
      }
      
      return await documentsService.update(id, updates);
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async getDocument(id: string): Promise<any> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getDocument(id);
      }
      
      return await documentsService.get(id);
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

      const result = await documentsService.delete(id);
      return { ok: result.ok };
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  // -----------------------------
  // Document Types
  // -----------------------------
  async getDocumentTypes(): Promise<any[]> {
    try {
      if (API_CONFIG.useFakeApi) {
        // Fake API doesn't have document types, return empty array
        return [];
      }
      
      return await documentTypesService.list();
    } catch (error) {
      handleApiError(error);
      return [] as any;
    }
  }

  async createDocumentType(data: {
    name: string;
    description?: string;
    isActive?: boolean;
    displayOrder?: number;
  }): Promise<any> {
    try {
      if (API_CONFIG.useFakeApi) {
        throw new Error('Fake API does not support document type creation');
      }
      
      return await documentTypesService.create(data);
    } catch (error) {
      handleApiError(error);
      return {} as any;
    }
  }

  async updateDocumentType(id: string, updates: Partial<{
    name: string;
    description: string;
    isActive: boolean;
    displayOrder: number;
  }>): Promise<any> {
    try {
      if (API_CONFIG.useFakeApi) {
        throw new Error('Fake API does not support document type updates');
      }
      
      return await documentTypesService.update(id, updates);
    } catch (error) {
      handleApiError(error);
      return {} as any;
    }
  }

  async deleteDocumentType(id: string): Promise<{ ok: boolean }> {
    try {
      if (API_CONFIG.useFakeApi) {
        throw new Error('Fake API does not support document type deletion');
      }

      const result = await documentTypesService.delete(id);
      return { ok: result.ok };
    } catch (error) {
      handleApiError(error);
      return {} as any;
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

      return await notesService.list(params);
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

      return await notesService.get(id) as any;
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async createNote(noteData: {
    title: string;
    content: string;
    type: string;
    eventId?: string;
    author: string;
    filename?: string;
    date: string;
    url?: string;
  }): Promise<Note> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.createNote(noteData as any);
      }

      return await notesService.create(noteData) as any;
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async updateNote(id: string, updates: Partial<{
    title: string;
    content: string;
    type: string;
    eventId: string;
    author: string;
    filename: string;
    date: string;
    url: string;
  }>): Promise<Note> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.updateNote(id, updates as any);
      }

      return await notesService.update(id, updates) as any;
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

      const result = await notesService.delete(id);
      return { ok: result.ok };
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

      return await noteTypesService.list() as any;
    } catch (error) {
      handleApiError(error);
      return [] as any; // This will never be reached since handleApiError throws
    }
  }

  async createNoteType(data: {
    name: string;
    description?: string;
    isActive?: boolean;
    displayOrder?: number;
  }): Promise<any> {
    try {
      if (API_CONFIG.useFakeApi) {
        throw new Error('Fake API does not support note type creation');
      }
      
      return await noteTypesService.create(data);
    } catch (error) {
      handleApiError(error);
      return {} as any;
    }
  }

  async updateNoteType(id: string, updates: Partial<{
    name: string;
    description: string;
    isActive: boolean;
    displayOrder: number;
  }>): Promise<any> {
    try {
      if (API_CONFIG.useFakeApi) {
        throw new Error('Fake API does not support note type updates');
      }
      
      return await noteTypesService.update(id, updates);
    } catch (error) {
      handleApiError(error);
      return {} as any;
    }
  }

  async deleteNoteType(id: string): Promise<{ ok: boolean }> {
    try {
      if (API_CONFIG.useFakeApi) {
        throw new Error('Fake API does not support note type deletion');
      }

      const result = await noteTypesService.delete(id);
      return { ok: result.ok };
    } catch (error) {
      handleApiError(error);
      return {} as any;
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
      
      // Client-side search implementation (POC)
      // Fetches from all endpoints and filters client-side
      const query = params.q.toLowerCase();
      const typeFilter = params.types ? params.types.split(',') : ['manager', 'event', 'note', 'document'];
      const results: any[] = [];
      
      // Search managers
      if (typeFilter.includes('manager')) {
        const managersResponse = await managersService.list({ pageSize: 100 });
        managersResponse.items.forEach((manager: any) => {
          const searchText = `${manager.firstName} ${manager.lastName} ${manager.company} ${manager.email}`.toLowerCase();
          if (searchText.includes(query)) {
            results.push({
              id: `manager-${manager.id}`,
              type: 'manager',
              title: `${manager.firstName} ${manager.lastName}`,
              snippet: `${manager.company} - ${manager.status}`,
              metadata: {
                company: manager.company,
                status: manager.status,
                email: manager.email
              }
            });
          }
        });
      }
      
      // Search events
      if (typeFilter.includes('event')) {
        const eventsResponse = await eventsService.list({ pageSize: 100 });
        eventsResponse.items.forEach((event: any) => {
          const searchText = `${event.type} ${event.comments} ${event.staffAttending.join(' ')}`.toLowerCase();
          if (searchText.includes(query)) {
            results.push({
              id: `event-${event.id}`,
              type: 'event',
              title: `${event.type} - ${event.date}`,
              snippet: event.comments || 'No comments',
              metadata: {
                date: event.date,
                type: event.type,
                managerId: event.managerId
              }
            });
          }
        });
      }
      
      // Search notes
      if (typeFilter.includes('note')) {
        const notesResponse = await notesService.list({ pageSize: 100 });
        notesResponse.items.forEach((note: any) => {
          const searchText = `${note.title} ${note.content} ${note.author}`.toLowerCase();
          if (searchText.includes(query)) {
            results.push({
              id: `note-${note.id}`,
              type: 'note',
              title: note.title,
              snippet: note.content.substring(0, 200),
              metadata: {
                author: note.author,
                date: note.date,
                type: note.type
              }
            });
          }
        });
      }
      
      // Search documents
      if (typeFilter.includes('document')) {
        const documentsResponse = await documentsService.list({ pageSize: 100 });
        documentsResponse.items.forEach((doc: any) => {
          const searchText = `${doc.filename} ${doc.author} ${doc.description}`.toLowerCase();
          if (searchText.includes(query)) {
            results.push({
              id: `document-${doc.id}`,
              type: 'document',
              title: doc.filename,
              snippet: doc.description || 'No description',
              metadata: {
                author: doc.author,
                date: doc.date,
                url: doc.url
              }
            });
          }
        });
      }
      
      // Sort by relevance (simple: check if query is in title)
      results.sort((a, b) => {
        const aInTitle = a.title.toLowerCase().includes(query) ? 0 : 1;
        const bInTitle = b.title.toLowerCase().includes(query) ? 0 : 1;
        return aInTitle - bInTitle;
      });
      
      // Implement simple pagination
      const page = params.page || 1;
      const pageSize = params.pageSize || 25;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedResults = results.slice(startIndex, endIndex);
      
      return {
        items: paginatedResults,
        page,
        pageSize,
        total: results.length
      };
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

  async getStaff(params: {
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  } = {}) {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.getStaff();
      }
      
      return await staffService.list(params);
    } catch (error) {
      handleApiError(error);
      return {} as any; // This will never be reached since handleApiError throws
    }
  }

  async getStaffMember(id: string): Promise<StaffMember> {
    try {
      if (API_CONFIG.useFakeApi) {
        throw new Error('Fake API does not support getting individual staff');
      }
      
      return await staffService.get(id) as any;
    } catch (error) {
      handleApiError(error);
      return {} as any;
    }
  }

  async createStaffMember(data: {
    firstName: string;
    lastName: string;
    email?: string;
    title?: string;
    isActive?: boolean;
  }): Promise<StaffMember> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.createStaff(data as any);
      }
      
      return await staffService.create(data) as any;
    } catch (error) {
      handleApiError(error);
      return {} as any;
    }
  }

  async updateStaffMember(id: string, updates: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    isActive: boolean;
  }>): Promise<StaffMember> {
    try {
      if (API_CONFIG.useFakeApi) {
        return await fakeApi.updateStaff(id, updates as any);
      }
      
      return await staffService.update(id, updates) as any;
    } catch (error) {
      handleApiError(error);
      return {} as any;
    }
  }

  async deleteStaffMember(id: string): Promise<{ ok: boolean }> {
    try {
      if (API_CONFIG.useFakeApi) {
        await fakeApi.deleteStaff(id);
        return { ok: true };
      }

      const result = await staffService.delete(id);
      return { ok: result.ok };
    } catch (error) {
      handleApiError(error);
      return {} as any;
    }
  }

  // -----------------------------
  // Performance Metrics
  // -----------------------------
  async getPerformanceMetrics(params: {
    managerId?: string;
    metricYear?: number;
    page?: number;
    pageSize?: number;
  } = {}): Promise<any> {
    try {
      if (API_CONFIG.useFakeApi) {
        // Fake API doesn't have performance metrics, return empty array
        return { items: [], page: 1, pageSize: 25, total: 0 };
      }
      
      return await performanceMetricsService.list(params);
    } catch (error) {
      handleApiError(error);
      return {} as any;
    }
  }

  async getPerformanceMetric(id: string): Promise<any> {
    try {
      if (API_CONFIG.useFakeApi) {
        throw new Error('Fake API does not support performance metrics');
      }
      
      return await performanceMetricsService.get(id);
    } catch (error) {
      handleApiError(error);
      return {} as any;
    }
  }

  async createPerformanceMetric(data: {
    managerId: string;
    metricYear: number;
    returnRate?: number;
    marketValue?: number;
    asOfDate: string;
    notes?: string;
  }): Promise<any> {
    try {
      if (API_CONFIG.useFakeApi) {
        throw new Error('Fake API does not support performance metric creation');
      }
      
      return await performanceMetricsService.create(data);
    } catch (error) {
      handleApiError(error);
      return {} as any;
    }
  }

  async updatePerformanceMetric(id: string, updates: Partial<{
    metricYear: number;
    returnRate: number;
    marketValue: number;
    asOfDate: string;
    notes: string;
  }>): Promise<any> {
    try {
      if (API_CONFIG.useFakeApi) {
        throw new Error('Fake API does not support performance metric updates');
      }
      
      return await performanceMetricsService.update(id, updates);
    } catch (error) {
      handleApiError(error);
      return {} as any;
    }
  }

  async deletePerformanceMetric(id: string): Promise<{ ok: boolean }> {
    try {
      if (API_CONFIG.useFakeApi) {
        throw new Error('Fake API does not support performance metric deletion');
      }

      const result = await performanceMetricsService.delete(id);
      return { ok: result.ok };
    } catch (error) {
      handleApiError(error);
      return {} as any;
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