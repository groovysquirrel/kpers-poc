// Domain types based on actual sample data structure

export interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  status: 'Active' | 'Terminated' | 'Probation';
  marketValue: number;        // USD
  asOfDate: string;          // ISO date string
  probationDetails?: ProbationDetails;
}

export interface ProbationDetails {
  id: string;
  managerId: string;
  startDate: string;          // ISO date string
  endDate?: string;           // ISO date string (optional)
  reason: string;
  checklist: ProbationChecklistItem[];
  documents: string[];       // Array of document IDs
  createdBy: string;
  createdAt: string;          // ISO date string
  updatedAt: string;          // ISO date string
}

export interface ProbationChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;       // ISO date string
  notes?: string;
}

export interface EventRecord {
  id: string;
  managerId: string;
  date: string;              // ISO date string
  type: string;              // Event type from EventTypes table
  staffAttending: string[];  // Array of staff member names
  comments: string;
}

export interface MeetingNote {
  id: string;
  eventId: string;
  managerId: string;
  date: string;              // ISO date string
  title: string;
  content: string;
  createdBy: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  department?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  permissions: string[];
  lastLogin?: string;          // ISO date string
  createdAt: string;           // ISO date string
  updatedAt: string;           // ISO date string
}

export interface EventType {
  id: string;
  name: string;
}

export interface DocumentItem {
  id: string;
  managerId: string;
  eventId?: string;
  title: string;
  filename: string;
  contentType: string;
  size: number;
  createdAt: string;           // ISO
}

export interface NoteType {
  id: string;
  name: string;
  description?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: string;              // Note type ID
  managerId?: string;        // Optional association with manager
  eventId?: string;          // Optional association with event
  staffId?: string;          // Optional association with staff member
  documentId?: string;       // Optional association with document
  createdBy: string;
  createdAt: string;         // ISO date string
  updatedAt: string;         // ISO date string
  tags?: string[];           // Optional tags for categorization
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'Viewer' | 'Editor' | 'Administrator';
  status: 'Active' | 'Inactive' | 'Suspended';
  permissions: string[];
  lastLogin?: string;          // ISO date string
  createdAt: string;           // ISO date string
  updatedAt: string;           // ISO date string
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'Managers' | 'Events' | 'Documents' | 'Admin' | 'Reports';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];       // Array of permission IDs
  isSystem: boolean;          // System roles cannot be deleted
}

// Extended types for UI components
export interface ManagerWithEvents extends Manager {
  events?: EventRecord[];
  recentNotes?: MeetingNote[];
}

export interface EventWithDetails extends EventRecord {
  manager?: Manager;
  notes?: MeetingNote[];
}

// Search result types
export interface SearchResult {
  id: string;
  type: 'manager' | 'event' | 'note' | 'document';
  title: string;
  snippet?: string;
  metadata?: Record<string, unknown>;
}

// Note form types
export interface NoteCreateForm {
  title: string;
  content: string;
  type: string;              // Note type ID
  managerId?: string;        // Optional association with manager
  eventId?: string;          // Optional association with event
  staffId?: string;          // Optional association with staff member
  documentId?: string;       // Optional association with document
  tags?: string[];
}

export interface NoteUpdateForm extends Partial<NoteCreateForm> {
  id: string;
}

// Form types
export interface EventCreateForm {
  managerId: string;
  date: string;
  type: string;              // Event type from EventTypes table
  staffAttending: string[];
  comments: string;
}

export interface EventUpdateForm extends Partial<EventCreateForm> {
  id: string;
}

// API-specific interfaces (matching BackendDevPlan)
export interface EventCreate {
  managerId: string;
  date: string;
  type: string;                // Event type from EventTypes table
  staffAttending?: string[];
  comments?: string;
}

export interface EventUpdate extends Partial<EventCreate> {}
