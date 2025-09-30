/**
 * Data Transformers
 * 
 * Purpose: Convert between backend (snake_case) and frontend (camelCase) data formats
 * - Handles Manager entity transformations
 * - Can be extended for other entities (Events, Notes, etc.)
 * - Ensures type safety with TypeScript
 * 
 * Pattern:
 * - toFrontend*: Converts backend snake_case to frontend camelCase
 * - toBackend*: Converts frontend camelCase to backend snake_case
 */

import { Manager } from '../../types/domain';

// ============================================
// Backend Types (snake_case from API)
// ============================================

export interface ManagerRow {
  id: string;
  first_name: string;
  last_name: string;
  company: string;
  phone: string | null;
  email: string | null;
  status: 'Active' | 'Terminated' | 'Probation';
  market_value: number;
  as_of_date: string;
}

export interface ManagerCreateInput {
  firstName: string;
  lastName: string;
  company: string;
  phone?: string;
  email?: string;
  status: 'Active' | 'Terminated' | 'Probation';
  marketValue: number;
  asOfDate: string;
}

export interface ManagerUpdateInput {
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  email?: string;
  status?: 'Active' | 'Terminated' | 'Probation';
  marketValue?: number;
  asOfDate?: string;
}

// ============================================
// Manager Transformers
// ============================================

/**
 * Convert backend ManagerRow to frontend Manager
 */
export function toFrontendManager(row: ManagerRow): Manager {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    company: row.company,
    phone: row.phone || '',
    email: row.email || '',
    status: row.status,
    marketValue: row.market_value,
    asOfDate: row.as_of_date,
  };
}

/**
 * Convert array of backend ManagerRows to frontend Managers
 */
export function toFrontendManagers(rows: ManagerRow[]): Manager[] {
  return rows.map(toFrontendManager);
}

/**
 * Convert frontend Manager data to backend ManagerCreateInput
 */
export function toBackendManagerCreate(data: {
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  status: 'Active' | 'Terminated' | 'Probation';
  marketValue: number;
  asOfDate: string;
}): ManagerCreateInput {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    company: data.company,
    phone: data.phone || undefined,
    email: data.email || undefined,
    status: data.status,
    marketValue: data.marketValue,
    asOfDate: data.asOfDate,
  };
}

/**
 * Convert frontend Manager partial updates to backend ManagerUpdateInput
 */
export function toBackendManagerUpdate(data: Partial<Manager>): ManagerUpdateInput {
  const update: ManagerUpdateInput = {};

  if (data.firstName !== undefined) update.firstName = data.firstName;
  if (data.lastName !== undefined) update.lastName = data.lastName;
  if (data.company !== undefined) update.company = data.company;
  if (data.phone !== undefined) update.phone = data.phone || undefined;
  if (data.email !== undefined) update.email = data.email || undefined;
  if (data.status !== undefined) update.status = data.status;
  if (data.marketValue !== undefined) update.marketValue = data.marketValue;
  if (data.asOfDate !== undefined) update.asOfDate = data.asOfDate;

  return update;
}

// ============================================
// Event Type Transformers
// ============================================

export interface EventTypeRow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export function toFrontendEventType(row: EventTypeRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    isActive: row.is_active,
    displayOrder: row.display_order || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================
// Event Transformers
// ============================================

export interface EventRow {
  id: string;
  manager_id: string;
  event_type_id: string;
  event_date: string;
  staff_attending: string | null;
  comments: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventCreateInput {
  managerId: string;
  eventTypeId: string;
  eventDate: string;
  staffAttending?: string[];
  comments?: string;
}

export interface EventUpdateInput {
  eventTypeId?: string;
  eventDate?: string;
  staffAttending?: string[];
  comments?: string;
}

export function toFrontendEvent(row: EventRow) {
  return {
    id: row.id,
    managerId: row.manager_id,
    type: row.event_type_id, // Will be looked up to get name
    date: row.event_date,
    staffAttending: row.staff_attending ? row.staff_attending.split(';') : [],
    comments: row.comments || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toBackendEventCreate(data: {
  managerId: string;
  type: string; // event type ID
  date: string;
  staffAttending?: string[];
  comments?: string;
}): EventCreateInput {
  return {
    managerId: data.managerId,
    eventTypeId: data.type,
    eventDate: data.date,
    staffAttending: data.staffAttending || [],
    comments: data.comments || undefined,
  };
}

export function toBackendEventUpdate(data: {
  type?: string;
  date?: string;
  staffAttending?: string[];
  comments?: string;
}): EventUpdateInput {
  const update: EventUpdateInput = {};
  
  if (data.type !== undefined) update.eventTypeId = data.type;
  if (data.date !== undefined) update.eventDate = data.date;
  if (data.staffAttending !== undefined) update.staffAttending = data.staffAttending;
  if (data.comments !== undefined) update.comments = data.comments;

  return update;
}

// ============================================
// Note Transformers (Template for future use)
// ============================================

// TODO: Add note transformers when notes API is integrated
// export function toFrontendNote(row: NoteRow): Note { ... }
// export function toBackendNoteCreate(data: NoteCreateForm): NoteCreateInput { ... }

