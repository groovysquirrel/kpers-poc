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
// Staff Transformers
// ============================================

export interface StaffRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  title: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffCreateInput {
  firstName: string;
  lastName: string;
  email?: string;
  title?: string;
  isActive?: boolean;
}

export interface StaffUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  title?: string;
  isActive?: boolean;
}

export function toFrontendStaff(row: StaffRow) {
  return {
    id: row.id,
    name: `${row.first_name} ${row.last_name}`,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email || undefined,
    role: row.title || '',
    title: row.title || undefined,
    isActive: row.is_active,
    status: row.is_active ? 'Active' as const : 'Inactive' as const,
    permissions: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toBackendStaffCreate(data: {
  firstName: string;
  lastName: string;
  email?: string;
  title?: string;
  isActive?: boolean;
}): StaffCreateInput {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email || undefined,
    title: data.title || undefined,
    isActive: data.isActive !== undefined ? data.isActive : true,
  };
}

export function toBackendStaffUpdate(data: Partial<{
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  isActive: boolean;
}>): StaffUpdateInput {
  const update: StaffUpdateInput = {};
  
  if (data.firstName !== undefined) update.firstName = data.firstName;
  if (data.lastName !== undefined) update.lastName = data.lastName;
  if (data.email !== undefined) update.email = data.email || undefined;
  if (data.title !== undefined) update.title = data.title || undefined;
  if (data.isActive !== undefined) update.isActive = data.isActive;

  return update;
}

// ============================================
// Note Type Transformers
// ============================================

export interface NoteTypeRow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface NoteTypeCreateInput {
  name: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface NoteTypeUpdateInput {
  name?: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export function toFrontendNoteType(row: NoteTypeRow) {
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

export function toBackendNoteTypeCreate(data: {
  name: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
}): NoteTypeCreateInput {
  return {
    name: data.name,
    description: data.description || undefined,
    isActive: data.isActive !== undefined ? data.isActive : true,
    displayOrder: data.displayOrder || undefined,
  };
}

export function toBackendNoteTypeUpdate(data: Partial<{
  name: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
}>): NoteTypeUpdateInput {
  const update: NoteTypeUpdateInput = {};
  
  if (data.name !== undefined) update.name = data.name;
  if (data.description !== undefined) update.description = data.description || undefined;
  if (data.isActive !== undefined) update.isActive = data.isActive;
  if (data.displayOrder !== undefined) update.displayOrder = data.displayOrder;

  return update;
}

// ============================================
// Note Transformers
// ============================================

export interface NoteRow {
  id: string;
  event_id: string | null;
  note_type_id: string;
  subject: string;
  content: string;
  author: string;
  filename: string | null;
  date: string;
  url: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteCreateInput {
  eventId?: string;
  noteTypeId: string;
  subject: string;
  content: string;
  author: string;
  filename?: string;
  date: string;
  url?: string;
}

export interface NoteUpdateInput {
  eventId?: string;
  noteTypeId?: string;
  subject?: string;
  content?: string;
  author?: string;
  filename?: string;
  date?: string;
  url?: string;
}

export function toFrontendNote(row: NoteRow) {
  return {
    id: row.id,
    title: row.subject,
    content: row.content,
    type: row.note_type_id,
    eventId: row.event_id || undefined,
    createdBy: row.author,
    author: row.author,
    filename: row.filename || undefined,
    date: row.date,
    url: row.url || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toBackendNoteCreate(data: {
  title: string;
  content: string;
  type: string;
  eventId?: string;
  author: string;
  filename?: string;
  date: string;
  url?: string;
}): NoteCreateInput {
  return {
    eventId: data.eventId || undefined,
    noteTypeId: data.type,
    subject: data.title,
    content: data.content,
    author: data.author,
    filename: data.filename || undefined,
    date: data.date,
    url: data.url || undefined,
  };
}

export function toBackendNoteUpdate(data: Partial<{
  title: string;
  content: string;
  type: string;
  eventId: string;
  author: string;
  filename: string;
  date: string;
  url: string;
}>): NoteUpdateInput {
  const update: NoteUpdateInput = {};
  
  if (data.title !== undefined) update.subject = data.title;
  if (data.content !== undefined) update.content = data.content;
  if (data.type !== undefined) update.noteTypeId = data.type;
  if (data.eventId !== undefined) update.eventId = data.eventId || undefined;
  if (data.author !== undefined) update.author = data.author;
  if (data.filename !== undefined) update.filename = data.filename || undefined;
  if (data.date !== undefined) update.date = data.date;
  if (data.url !== undefined) update.url = data.url || undefined;

  return update;
}

// ============================================
// Document Type Transformers
// ============================================

export interface DocumentTypeRow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentTypeCreateInput {
  name: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface DocumentTypeUpdateInput {
  name?: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export function toFrontendDocumentType(row: DocumentTypeRow) {
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

export function toBackendDocumentTypeCreate(data: {
  name: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
}): DocumentTypeCreateInput {
  return {
    name: data.name,
    description: data.description || undefined,
    isActive: data.isActive !== undefined ? data.isActive : true,
    displayOrder: data.displayOrder || undefined,
  };
}

export function toBackendDocumentTypeUpdate(data: Partial<{
  name: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
}>): DocumentTypeUpdateInput {
  const update: DocumentTypeUpdateInput = {};
  
  if (data.name !== undefined) update.name = data.name;
  if (data.description !== undefined) update.description = data.description || undefined;
  if (data.isActive !== undefined) update.isActive = data.isActive;
  if (data.displayOrder !== undefined) update.displayOrder = data.displayOrder;

  return update;
}

// ============================================
// Document Transformers
// ============================================

export interface DocumentRow {
  id: string;
  event_id: string | null;
  document_type_id: string;
  filename: string;
  date: string;
  url: string | null;
  author: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentCreateInput {
  eventId?: string;
  documentTypeId: string;
  filename: string;
  date: string;
  url?: string;
  author?: string;
  description?: string;
}

export interface DocumentUpdateInput {
  eventId?: string;
  documentTypeId?: string;
  filename?: string;
  date?: string;
  url?: string;
  author?: string;
  description?: string;
}

export function toFrontendDocument(row: DocumentRow) {
  return {
    id: row.id,
    eventId: row.event_id || undefined,
    documentTypeId: row.document_type_id,
    filename: row.filename,
    date: row.date,
    url: row.url || undefined,
    author: row.author || undefined,
    description: row.description || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toBackendDocumentCreate(data: {
  eventId?: string;
  documentTypeId: string;
  filename: string;
  date: string;
  url?: string;
  author?: string;
  description?: string;
}): DocumentCreateInput {
  return {
    eventId: data.eventId || undefined,
    documentTypeId: data.documentTypeId,
    filename: data.filename,
    date: data.date,
    url: data.url || undefined,
    author: data.author || undefined,
    description: data.description || undefined,
  };
}

export function toBackendDocumentUpdate(data: Partial<{
  eventId: string;
  documentTypeId: string;
  filename: string;
  date: string;
  url: string;
  author: string;
  description: string;
}>): DocumentUpdateInput {
  const update: DocumentUpdateInput = {};
  
  if (data.eventId !== undefined) update.eventId = data.eventId || undefined;
  if (data.documentTypeId !== undefined) update.documentTypeId = data.documentTypeId;
  if (data.filename !== undefined) update.filename = data.filename;
  if (data.date !== undefined) update.date = data.date;
  if (data.url !== undefined) update.url = data.url || undefined;
  if (data.author !== undefined) update.author = data.author || undefined;
  if (data.description !== undefined) update.description = data.description || undefined;

  return update;
}

// ============================================
// Performance Metric Transformers
// ============================================

export interface PerformanceMetricRow {
  id: string;
  manager_id: string;
  metric_year: number;
  return_rate: number | null;
  market_value: number | null;
  as_of_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PerformanceMetricCreateInput {
  managerId: string;
  metricYear: number;
  returnRate?: number;
  marketValue?: number;
  asOfDate: string;
  notes?: string;
}

export interface PerformanceMetricUpdateInput {
  metricYear?: number;
  returnRate?: number;
  marketValue?: number;
  asOfDate?: string;
  notes?: string;
}

export function toFrontendPerformanceMetric(row: PerformanceMetricRow) {
  return {
    id: row.id,
    managerId: row.manager_id,
    metricYear: row.metric_year,
    returnRate: row.return_rate || undefined,
    marketValue: row.market_value || undefined,
    asOfDate: row.as_of_date,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toBackendPerformanceMetricCreate(data: {
  managerId: string;
  metricYear: number;
  returnRate?: number;
  marketValue?: number;
  asOfDate: string;
  notes?: string;
}): PerformanceMetricCreateInput {
  return {
    managerId: data.managerId,
    metricYear: data.metricYear,
    returnRate: data.returnRate || undefined,
    marketValue: data.marketValue || undefined,
    asOfDate: data.asOfDate,
    notes: data.notes || undefined,
  };
}

export function toBackendPerformanceMetricUpdate(data: Partial<{
  metricYear: number;
  returnRate: number;
  marketValue: number;
  asOfDate: string;
  notes: string;
}>): PerformanceMetricUpdateInput {
  const update: PerformanceMetricUpdateInput = {};
  
  if (data.metricYear !== undefined) update.metricYear = data.metricYear;
  if (data.returnRate !== undefined) update.returnRate = data.returnRate || undefined;
  if (data.marketValue !== undefined) update.marketValue = data.marketValue || undefined;
  if (data.asOfDate !== undefined) update.asOfDate = data.asOfDate;
  if (data.notes !== undefined) update.notes = data.notes || undefined;

  return update;
}

