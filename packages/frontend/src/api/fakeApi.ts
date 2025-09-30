/**
 * Fake API Service
 * 
 * Purpose: Simulate real backend API endpoints for development
 * - Matches BackendDevPlan v1.md exactly
 * - Returns promises with realistic delays
 * - Handles pagination, filtering, and search
 * - Ready to be replaced with real API calls
 * 
 * Usage: Import and use like a real API service
 * Example: const managers = await api.managers.list({ page: 1, pageSize: 10 })
 */

import mockData from './data/mockData.json';
import { 
  Manager, 
  EventRecord, 
  MeetingNote, 
  StaffMember, 
  EventType,
  DocumentItem,
  User,
  SearchResult,
  EventCreate,
  EventUpdate,
  Permission,
  Role
} from '../types/domain';

// Types for API responses
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

// Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate API errors (5% chance)
const shouldSimulateError = () => Math.random() < 0.05;

class FakeApiService {
  private managers: Manager[] = mockData.managers as Manager[];
  private events: EventRecord[] = mockData.events as EventRecord[];
  private notes: MeetingNote[] = mockData.meetingNotes as MeetingNote[];
  private staff: StaffMember[] = mockData.staff as StaffMember[];
  private eventTypes: EventType[] = mockData.eventTypes as EventType[];
  private documents: DocumentItem[] = [];
  private users: User[] = [
    { 
      id: '1', 
      email: 'admin@kpers.gov', 
      firstName: 'Admin',
      lastName: 'User',
      role: 'Administrator',
      status: 'Active',
      permissions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      lastLogin: new Date().toISOString(),
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    { 
      id: '2', 
      email: 'editor@kpers.gov', 
      firstName: 'Editor',
      lastName: 'User',
      role: 'Editor',
      status: 'Active',
      permissions: ['1', '2', '3', '4', '5', '6', '9'],
      lastLogin: new Date(Date.now() - 86400000).toISOString(),
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: new Date().toISOString()
    },
    { 
      id: '3', 
      email: 'viewer@kpers.gov', 
      firstName: 'Viewer',
      lastName: 'User',
      role: 'Viewer',
      status: 'Active',
      permissions: ['1', '3', '5', '9'],
      lastLogin: new Date(Date.now() - 172800000).toISOString(),
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: new Date().toISOString()
    }
  ];

  // -----------------------------
  // Managers API
  // -----------------------------
  async getManagers(params: {
    q?: string;
    status?: 'Active' | 'Terminated' | 'Probation';
    page?: number;
    pageSize?: number;
  } = {}): Promise<PaginatedResponse<Manager>> {
    await delay();
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }

    let filtered = [...this.managers];

    // Search filter
    if (params.q) {
      const query = params.q.toLowerCase();
      filtered = filtered.filter(manager => 
        manager.firstName.toLowerCase().includes(query) ||
        manager.lastName.toLowerCase().includes(query) ||
        manager.company.toLowerCase().includes(query) ||
        manager.email.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (params.status) {
      filtered = filtered.filter(manager => manager.status === params.status);
    }

    // Pagination
    const page = params.page || 1;
    const pageSize = params.pageSize || 25;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return {
      items,
      page,
      pageSize,
      total: filtered.length
    };
  }

  async getManager(id: string): Promise<Manager> {
    await delay();
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }
    
    const manager = this.managers.find(m => m.id === id);
    if (!manager) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Manager not found' };
    }
    return manager;
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
    await delay(800);
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }
    
    // Check for duplicate email
    const existingManager = this.managers.find(m => m.email === managerData.email);
    if (existingManager) {
      throw { status: 400, code: 'DUPLICATE_EMAIL', message: 'Manager with this email already exists' };
    }
    
    const newManager: Manager = {
      id: (this.managers.length + 1).toString(),
      ...managerData
    };
    
    this.managers.push(newManager);
    return newManager;
  }

  async updateManager(id: string, updates: Partial<Manager>): Promise<Manager> {
    await delay(600);
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }
    
    const managerIndex = this.managers.findIndex(m => m.id === id);
    if (managerIndex === -1) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Manager not found' };
    }
    
    // Check for duplicate email if email is being updated
    if (updates.email) {
      const existingManager = this.managers.find(m => m.email === updates.email && m.id !== id);
      if (existingManager) {
        throw { status: 400, code: 'DUPLICATE_EMAIL', message: 'Manager with this email already exists' };
      }
    }
    
    this.managers[managerIndex] = { ...this.managers[managerIndex], ...updates };
    return this.managers[managerIndex];
  }

  async getManagerEvents(managerId: string, params: {
    type?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<PaginatedResponse<EventRecord>> {
    await delay();
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }

    let filtered = this.events.filter(event => event.managerId === managerId);

    // Type filter
    if (params.type) {
      filtered = filtered.filter(event => event.type === params.type);
    }

    // Date range filter
    if (params.from) {
      filtered = filtered.filter(event => event.date >= params.from!);
    }
    if (params.to) {
      filtered = filtered.filter(event => event.date <= params.to!);
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Pagination
    const page = params.page || 1;
    const pageSize = params.pageSize || 25;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return {
      items,
      page,
      pageSize,
      total: filtered.length
    };
  }

  // -----------------------------
  // Events API
  // -----------------------------
  async createEvent(eventData: EventCreate): Promise<EventRecord> {
    await delay(500); // Longer delay for create operations
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }

    // Validate manager exists
    const manager = this.managers.find(m => m.id === eventData.managerId);
    if (!manager) {
      throw { status: 400, code: 'INVALID_MANAGER', message: 'Manager not found' };
    }

    // Create new event
    const newEvent: EventRecord = {
      id: (this.events.length + 1).toString(),
      managerId: eventData.managerId,
      date: eventData.date,
      type: eventData.type,
      staffAttending: eventData.staffAttending || [],
      comments: eventData.comments || ''
    };

    this.events.push(newEvent);
    return newEvent;
  }

  async getEvents(params: {
    managerId?: string;
    type?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<PaginatedResponse<EventRecord>> {
    await delay();
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }

    let filtered = [...this.events];

    // Manager filter
    if (params.managerId) {
      filtered = filtered.filter(event => event.managerId === params.managerId);
    }

    // Type filter
    if (params.type) {
      filtered = filtered.filter(event => event.type === params.type);
    }

    // Date range filter
    if (params.from) {
      filtered = filtered.filter(event => event.date >= params.from!);
    }
    if (params.to) {
      filtered = filtered.filter(event => event.date <= params.to!);
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Pagination
    const page = params.page || 1;
    const pageSize = params.pageSize || 25;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return {
      items,
      page,
      pageSize,
      total: filtered.length
    };
  }

  async getEvent(id: string): Promise<EventRecord> {
    await delay();
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }

    const event = this.events.find(e => e.id === id);
    if (!event) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Event not found' };
    }
    return event;
  }

  async updateEvent(id: string, eventData: EventUpdate): Promise<EventRecord> {
    await delay(500);
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }

    const eventIndex = this.events.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Event not found' };
    }

    // Update event
    this.events[eventIndex] = {
      ...this.events[eventIndex],
      ...eventData
    };

    return this.events[eventIndex];
  }

  async deleteEvent(id: string): Promise<{ ok: boolean }> {
    await delay(500);
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }

    const eventIndex = this.events.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Event not found' };
    }

    this.events.splice(eventIndex, 1);
    return { ok: true };
  }

  // -----------------------------
  // Documents API
  // -----------------------------
  async getDocuments(params: {
    managerId?: string;
    eventId?: string;
    q?: string;
    page?: number;
    pageSize?: number;
  } = {}): Promise<PaginatedResponse<DocumentItem>> {
    await delay();
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }

    let filtered = [...this.documents];

    // Manager filter
    if (params.managerId) {
      filtered = filtered.filter(doc => doc.managerId === params.managerId);
    }

    // Event filter
    if (params.eventId) {
      filtered = filtered.filter(doc => doc.eventId === params.eventId);
    }

    // Search filter
    if (params.q) {
      const query = params.q.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.filename.toLowerCase().includes(query)
      );
    }

    // Sort by creation date (most recent first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const page = params.page || 1;
    const pageSize = params.pageSize || 25;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return {
      items,
      page,
      pageSize,
      total: filtered.length
    };
  }

  async createDocument(documentData: {
    managerId: string;
    eventId?: string;
    filename: string;
    contentType: string;
    size: number;
  }): Promise<{ uploadUrl: string; document: DocumentItem }> {
    await delay(1000); // Longer delay for file operations
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }

    const newDocument: DocumentItem = {
      id: (this.documents.length + 1).toString(),
      managerId: documentData.managerId,
      eventId: documentData.eventId,
      title: documentData.filename,
      filename: documentData.filename,
      contentType: documentData.contentType,
      size: documentData.size,
      createdAt: new Date().toISOString()
    };

    this.documents.push(newDocument);

    return {
      uploadUrl: `https://fake-storage.example.com/upload/${newDocument.id}`,
      document: newDocument
    };
  }

  async updateDocument(id: string, updates: Partial<DocumentItem>): Promise<DocumentItem> {
    await delay(600);
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }
    
    const documentIndex = this.documents.findIndex(doc => doc.id === id);
    if (documentIndex === -1) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Document not found' };
    }
    
    this.documents[documentIndex] = { ...this.documents[documentIndex], ...updates };
    return this.documents[documentIndex];
  }

  async getDocument(id: string): Promise<DocumentItem> {
    await delay();
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }

    const document = this.documents.find(d => d.id === id);
    if (!document) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Document not found' };
    }
    return document;
  }

  async deleteDocument(id: string): Promise<{ ok: boolean }> {
    await delay(500);
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }

    const docIndex = this.documents.findIndex(d => d.id === id);
    if (docIndex === -1) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Document not found' };
    }

    this.documents.splice(docIndex, 1);
    return { ok: true };
  }

  // -----------------------------
  // Search API
  // -----------------------------
  async search(params: {
    q: string;
    types?: string; // comma-separated list
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<SearchResult>> {
    await delay(400); // Search takes a bit longer
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }

    const results: SearchResult[] = [];
    const query = params.q.toLowerCase();
    const types = params.types ? params.types.split(',') : ['manager', 'event', 'note', 'document'];

    // Search managers
    if (types.includes('manager')) {
      this.managers.forEach(manager => {
        const matches = 
          manager.firstName.toLowerCase().includes(query) ||
          manager.lastName.toLowerCase().includes(query) ||
          manager.company.toLowerCase().includes(query) ||
          manager.email.toLowerCase().includes(query);

        if (matches) {
          results.push({
            id: `manager-${manager.id}`,
            type: 'manager',
            title: `${manager.firstName} ${manager.lastName}`,
            snippet: `${manager.company} • ${manager.email}`,
            metadata: {
              company: manager.company,
              status: manager.status,
              marketValue: manager.marketValue
            }
          });
        }
      });
    }

    // Search events
    if (types.includes('event')) {
      this.events.forEach(event => {
        const manager = this.managers.find(m => m.id === event.managerId);
        const managerName = manager ? `${manager.firstName} ${manager.lastName}` : 'Unknown Manager';
        
        const matches = 
          event.comments.toLowerCase().includes(query) ||
          event.staffAttending.some(staff => staff.toLowerCase().includes(query)) ||
          event.type.toLowerCase().includes(query) ||
          managerName.toLowerCase().includes(query);

        if (matches) {
          results.push({
            id: `event-${event.id}`,
            type: 'event',
            title: `${event.type} - ${managerName}`,
            snippet: `${event.comments} • Staff: ${event.staffAttending.join(', ')}`,
            metadata: {
              date: event.date,
              manager: managerName,
              type: event.type
            }
          });
        }
      });
    }

    // Search notes
    if (types.includes('note')) {
      this.notes.forEach(note => {
        const manager = this.managers.find(m => m.id === note.managerId);
        const managerName = manager ? `${manager.firstName} ${manager.lastName}` : 'Unknown Manager';
        
        const matches = 
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          managerName.toLowerCase().includes(query);

        if (matches) {
          results.push({
            id: `note-${note.id}`,
            type: 'note',
            title: `${note.title} - ${managerName}`,
            snippet: note.content.replace(/<[^>]*>/g, '').substring(0, 200),
            metadata: {
              date: note.date,
              manager: managerName,
              createdBy: note.createdBy
            }
          });
        }
      });
    }

    // Search documents
    if (types.includes('document')) {
      this.documents.forEach(doc => {
        const manager = this.managers.find(m => m.id === doc.managerId);
        const managerName = manager ? `${manager.firstName} ${manager.lastName}` : 'Unknown Manager';
        
        const matches = 
          doc.title.toLowerCase().includes(query) ||
          doc.filename.toLowerCase().includes(query) ||
          managerName.toLowerCase().includes(query);

        if (matches) {
          results.push({
            id: `document-${doc.id}`,
            type: 'document',
            title: `${doc.title} - ${managerName}`,
            snippet: `Document: ${doc.filename} (${doc.contentType})`,
            metadata: {
              createdAt: doc.createdAt,
              manager: managerName,
              size: doc.size
            }
          });
        }
      });
    }

    // Sort by relevance (exact matches first)
    results.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      if (aTitle.includes(query) && !bTitle.includes(query)) return -1;
      if (!aTitle.includes(query) && bTitle.includes(query)) return 1;
      
      return aTitle.localeCompare(bTitle);
    });

    // Pagination
    const page = params.page || 1;
    const pageSize = params.pageSize || 25;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = results.slice(start, end);

    return {
      items,
      page,
      pageSize,
      total: results.length
    };
  }

  // -----------------------------
  // Users & RBAC API
  // -----------------------------
  async getMe(): Promise<User> {
    await delay();
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }

    // Return current user (simulate being logged in as editor)
    return this.users[1]; // editor@kpers.gov
  }

  async getUser(id: string): Promise<User> {
    await delay();
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }

    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw { status: 404, code: 'NOT_FOUND', message: 'User not found' };
    }
    return user;
  }

  async updateUserRole(id: string, role: 'Viewer' | 'Editor' | 'Administrator'): Promise<User> {
    await delay(500);
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }

    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw { status: 404, code: 'NOT_FOUND', message: 'User not found' };
    }

    this.users[userIndex].role = role;
    return this.users[userIndex];
  }

  // -----------------------------
  // Utility Methods
  // -----------------------------
  
  /**
   * Get all event types (for dropdowns)
   */
  async getEventTypes(): Promise<EventType[]> {
    await delay(100);
    return [...this.eventTypes];
  }

  /**
   * Get all staff members (for dropdowns)
   */
  async getStaff(): Promise<StaffMember[]> {
    await delay(100);
    return [...this.staff];
  }

  // -----------------------------
  // Users API
  // -----------------------------
  async getUsers(): Promise<User[]> {
    await delay(100);
    return [...this.users];
  }

  async createUser(userData: {
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'Viewer' | 'Editor' | 'Administrator';
    status: 'Active' | 'Inactive' | 'Suspended';
    permissions: string[];
  }): Promise<User> {
    await delay(800);
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }

    const existingUser = this.users.find(u => u.email === userData.email);
    if (existingUser) {
      throw { status: 400, code: 'DUPLICATE_EMAIL', message: 'User with this email already exists' };
    }

    const newUser: User = {
      id: (this.users.length + 1).toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await delay(600);
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }
    
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw { status: 404, code: 'NOT_FOUND', message: 'User not found' };
    }
    
    if (updates.email) {
      const existingUser = this.users.find(u => u.email === updates.email && u.id !== id);
      if (existingUser) {
        throw { status: 400, code: 'DUPLICATE_EMAIL', message: 'User with this email already exists' };
      }
    }
    
    this.users[userIndex] = { 
      ...this.users[userIndex], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    return this.users[userIndex];
  }

  async deleteUser(id: string): Promise<void> {
    await delay(500);
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }
    
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw { status: 404, code: 'NOT_FOUND', message: 'User not found' };
    }
    
    this.users.splice(userIndex, 1);
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
    await delay(800);
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }

    const newStaff: StaffMember = {
      id: (this.staff.length + 1).toString(),
      ...staffData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.staff.push(newStaff);
    return newStaff;
  }

  async updateStaff(id: string, updates: Partial<StaffMember>): Promise<StaffMember> {
    await delay(600);
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }
    
    const staffIndex = this.staff.findIndex(s => s.id === id);
    if (staffIndex === -1) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Staff member not found' };
    }
    
    this.staff[staffIndex] = { 
      ...this.staff[staffIndex], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    return this.staff[staffIndex];
  }

  async deleteStaff(id: string): Promise<void> {
    await delay(500);
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }
    
    const staffIndex = this.staff.findIndex(s => s.id === id);
    if (staffIndex === -1) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Staff member not found' };
    }
    
    this.staff.splice(staffIndex, 1);
  }

  // -----------------------------
  // Permissions & Roles API
  // -----------------------------
  
  private permissions: Permission[] = [
    { id: '1', name: 'View Managers', description: 'View manager information', category: 'Managers' },
    { id: '2', name: 'Edit Managers', description: 'Create and edit managers', category: 'Managers' },
    { id: '3', name: 'View Events', description: 'View event information', category: 'Events' },
    { id: '4', name: 'Edit Events', description: 'Create and edit events', category: 'Events' },
    { id: '5', name: 'View Documents', description: 'View documents', category: 'Documents' },
    { id: '6', name: 'Edit Documents', description: 'Create and edit documents', category: 'Documents' },
    { id: '7', name: 'Admin Users', description: 'Manage user accounts', category: 'Admin' },
    { id: '8', name: 'Admin Staff', description: 'Manage staff members', category: 'Admin' },
    { id: '9', name: 'View Reports', description: 'Access reporting features', category: 'Reports' },
    { id: '10', name: 'Export Data', description: 'Export data from the system', category: 'Reports' }
  ];

  private roles: Role[] = [
    { id: '1', name: 'Administrator', description: 'Full system access', permissions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], isSystem: true },
    { id: '2', name: 'Editor', description: 'Can view and edit most content', permissions: ['1', '2', '3', '4', '5', '6', '9'], isSystem: true },
    { id: '3', name: 'Viewer', description: 'Read-only access', permissions: ['1', '3', '5', '9'], isSystem: true }
  ];

  async getPermissions(): Promise<Permission[]> {
    await delay(200);
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }
    
    return [...this.permissions];
  }

  async getRoles(): Promise<Role[]> {
    await delay(200);
    
    if (shouldSimulateError()) {
      throw { status: 500, code: 'INTERNAL_ERROR', message: 'Simulated server error' };
    }
    
    return [...this.roles];
  }

  /**
   * Reset all data to initial state (useful for testing)
   */
  resetData(): void {
    this.managers = [...mockData.managers] as Manager[];
    this.events = [...mockData.events] as EventRecord[];
    this.notes = [...mockData.meetingNotes] as MeetingNote[];
    this.staff = [...mockData.staff] as StaffMember[];
    this.eventTypes = [...mockData.eventTypes] as EventType[];
    this.documents = [];
  }
}

// Export singleton instance
export const api = new FakeApiService();
