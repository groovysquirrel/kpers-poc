/**
 * Notes API Service
 * 
 * Purpose: Handle all note-related API requests
 * - Encapsulates HTTP calls to the notes endpoints
 * - Transforms data between frontend and backend formats
 * - Provides type-safe API methods
 * 
 * Usage: import { notesService } from './services/notes'
 */

import { httpClient } from '../utils/http';
import {
  NoteRow,
  toFrontendNote,
  toBackendNoteCreate,
  toBackendNoteUpdate,
} from '../utils/transformers';
import { noteTypesService } from './note-types';

export interface Note {
  id: string;
  title: string;
  content: string;
  type: string;
  typeId: string;
  eventId?: string;
  createdBy: string;
  author: string;
  filename?: string;
  date: string;
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetNotesParams {
  eventId?: string;
  noteTypeId?: string;
  page?: number;
  pageSize?: number;
}

export interface GetNotesResponse {
  items: Note[];
  page: number;
  pageSize: number;
  total: number;
}

class NotesService {
  private readonly basePath = '/notes';

  /**
   * Helper method to enrich notes with type names
   */
  private async enrichWithTypeNames(notes: ReturnType<typeof toFrontendNote>[]): Promise<Note[]> {
    // Get note type name lookup
    const typeNameLookup = await noteTypesService.getNameLookup();
    
    // Enrich each note with type name
    return notes.map(note => ({
      ...note,
      typeId: note.type, // Original ID from backend
      type: typeNameLookup.get(note.type) || note.type, // Name for display, fallback to ID
    }));
  }

  /**
   * List all notes with optional filtering
   */
  async list(params: GetNotesParams = {}): Promise<GetNotesResponse> {
    // Make API call
    const rows = await httpClient.get<NoteRow[]>(this.basePath, params);
    
    // Transform backend data to frontend format
    const notes = rows.map(toFrontendNote);
    
    // Enrich with type names
    const enriched = await this.enrichWithTypeNames(notes);
    
    // For now, return all notes without pagination
    // TODO: Backend should return pagination metadata
    return {
      items: enriched,
      page: params.page || 1,
      pageSize: params.pageSize || 25,
      total: enriched.length,
    };
  }

  /**
   * Get a single note by ID
   */
  async get(id: string): Promise<Note> {
    // Make API call
    const row = await httpClient.get<NoteRow>(`${this.basePath}/${id}`);
    
    // Transform backend data to frontend format
    const note = toFrontendNote(row);
    
    // Enrich with type name
    const [enriched] = await this.enrichWithTypeNames([note]);
    
    return enriched;
  }

  /**
   * Create a new note
   */
  async create(data: {
    title: string;
    content: string;
    type: string;
    eventId?: string;
    author: string;
    filename?: string;
    date: string;
    url?: string;
  }): Promise<Note> {
    // Transform frontend data to backend format
    const input = toBackendNoteCreate(data);
    
    // Make API call
    const row = await httpClient.post<NoteRow>(this.basePath, input);
    
    // Transform backend response to frontend format
    const note = toFrontendNote(row);
    
    // Enrich with type name
    const [enriched] = await this.enrichWithTypeNames([note]);
    
    return enriched;
  }

  /**
   * Update an existing note
   */
  async update(id: string, data: Partial<{
    title: string;
    content: string;
    type: string;
    eventId: string;
    author: string;
    filename: string;
    date: string;
    url: string;
  }>): Promise<Note> {
    // Transform frontend data to backend format
    const input = toBackendNoteUpdate(data);
    
    // Make API call
    const row = await httpClient.put<NoteRow>(`${this.basePath}/${id}`, input);
    
    // Transform backend response to frontend format
    const note = toFrontendNote(row);
    
    // Enrich with type name
    const [enriched] = await this.enrichWithTypeNames([note]);
    
    return enriched;
  }

  /**
   * Delete a note
   */
  async delete(id: string): Promise<{ ok: boolean; id: string }> {
    // Make API call
    return await httpClient.delete<{ ok: boolean; id: string }>(`${this.basePath}/${id}`);
  }
}

// Export singleton instance
export const notesService = new NotesService();

