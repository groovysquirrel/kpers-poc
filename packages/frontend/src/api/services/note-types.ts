/**
 * Note Types API Service
 * 
 * Purpose: Handle all note-type-related API requests
 * - Encapsulates HTTP calls to the note-types endpoints
 * - Transforms data between frontend and backend formats
 * - Provides type-safe API methods
 * 
 * Usage: import { noteTypesService } from './services/note-types'
 */

import { httpClient } from '../utils/http';
import {
  NoteTypeRow,
  toFrontendNoteType,
  toBackendNoteTypeCreate,
  toBackendNoteTypeUpdate,
} from '../utils/transformers';
import { NoteType } from '../../types/domain';

class NoteTypesService {
  private readonly basePath = '/note-types';
  private nameCache: Map<string, string> | null = null;

  /**
   * List all note types
   */
  async list(): Promise<NoteType[]> {
    // Make API call
    const rows = await httpClient.get<NoteTypeRow[]>(this.basePath);
    
    // Transform backend data to frontend format
    return rows.map(toFrontendNoteType);
  }

  /**
   * Get a single note type by ID
   */
  async get(id: string): Promise<NoteType> {
    // Make API call
    const row = await httpClient.get<NoteTypeRow>(`${this.basePath}/${id}`);
    
    // Transform backend data to frontend format
    return toFrontendNoteType(row);
  }

  /**
   * Create a new note type
   */
  async create(data: {
    name: string;
    description?: string;
    isActive?: boolean;
    displayOrder?: number;
  }): Promise<NoteType> {
    // Transform frontend data to backend format
    const input = toBackendNoteTypeCreate(data);
    
    // Make API call
    const row = await httpClient.post<NoteTypeRow>(this.basePath, input);
    
    // Invalidate cache
    this.nameCache = null;
    
    // Transform backend response to frontend format
    return toFrontendNoteType(row);
  }

  /**
   * Update an existing note type
   */
  async update(id: string, data: Partial<{
    name: string;
    description: string;
    isActive: boolean;
    displayOrder: number;
  }>): Promise<NoteType> {
    // Transform frontend data to backend format
    const input = toBackendNoteTypeUpdate(data);
    
    // Make API call
    const row = await httpClient.put<NoteTypeRow>(`${this.basePath}/${id}`, input);
    
    // Invalidate cache
    this.nameCache = null;
    
    // Transform backend response to frontend format
    return toFrontendNoteType(row);
  }

  /**
   * Delete a note type
   */
  async delete(id: string): Promise<{ ok: boolean; id: string }> {
    // Invalidate cache
    this.nameCache = null;
    
    // Make API call
    return await httpClient.delete<{ ok: boolean; id: string }>(`${this.basePath}/${id}`);
  }

  /**
   * Get a lookup map of note type IDs to names
   */
  async getNameLookup(): Promise<Map<string, string>> {
    if (this.nameCache) {
      return this.nameCache;
    }

    const types = await this.list();
    this.nameCache = new Map(types.map(t => [t.id, t.name]));
    return this.nameCache;
  }
}

// Export singleton instance
export const noteTypesService = new NoteTypesService();

