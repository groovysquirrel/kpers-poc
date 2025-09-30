/**
 * Document Types API Service
 * 
 * Purpose: Handle all document-type-related API requests
 * - Encapsulates HTTP calls to the document-types endpoints
 * - Transforms data between frontend and backend formats
 * - Provides type-safe API methods
 * 
 * Usage: import { documentTypesService } from './services/document-types'
 */

import { httpClient } from '../utils/http';
import {
  DocumentTypeRow,
  toFrontendDocumentType,
  toBackendDocumentTypeCreate,
  toBackendDocumentTypeUpdate,
} from '../utils/transformers';
import { DocumentType } from '../../types/domain';

class DocumentTypesService {
  private readonly basePath = '/document-types';
  private nameCache: Map<string, string> | null = null;

  /**
   * List all document types
   */
  async list(): Promise<DocumentType[]> {
    // Make API call
    const rows = await httpClient.get<DocumentTypeRow[]>(this.basePath);
    
    // Transform backend data to frontend format
    return rows.map(toFrontendDocumentType);
  }

  /**
   * Get a single document type by ID
   */
  async get(id: string): Promise<DocumentType> {
    // Make API call
    const row = await httpClient.get<DocumentTypeRow>(`${this.basePath}/${id}`);
    
    // Transform backend data to frontend format
    return toFrontendDocumentType(row);
  }

  /**
   * Create a new document type
   */
  async create(data: {
    name: string;
    description?: string;
    isActive?: boolean;
    displayOrder?: number;
  }): Promise<DocumentType> {
    // Transform frontend data to backend format
    const input = toBackendDocumentTypeCreate(data);
    
    // Make API call
    const row = await httpClient.post<DocumentTypeRow>(this.basePath, input);
    
    // Invalidate cache
    this.nameCache = null;
    
    // Transform backend response to frontend format
    return toFrontendDocumentType(row);
  }

  /**
   * Update an existing document type
   */
  async update(id: string, data: Partial<{
    name: string;
    description: string;
    isActive: boolean;
    displayOrder: number;
  }>): Promise<DocumentType> {
    // Transform frontend data to backend format
    const input = toBackendDocumentTypeUpdate(data);
    
    // Make API call
    const row = await httpClient.put<DocumentTypeRow>(`${this.basePath}/${id}`, input);
    
    // Invalidate cache
    this.nameCache = null;
    
    // Transform backend response to frontend format
    return toFrontendDocumentType(row);
  }

  /**
   * Delete a document type
   */
  async delete(id: string): Promise<{ ok: boolean; id: string }> {
    // Invalidate cache
    this.nameCache = null;
    
    // Make API call
    return await httpClient.delete<{ ok: boolean; id: string }>(`${this.basePath}/${id}`);
  }

  /**
   * Get a lookup map of document type IDs to names
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
export const documentTypesService = new DocumentTypesService();

