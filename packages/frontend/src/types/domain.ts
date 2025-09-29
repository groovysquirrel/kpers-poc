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

export interface User {
  id: string;
  email: string;
  role: 'Viewer' | 'Editor' | 'Administrator';
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
