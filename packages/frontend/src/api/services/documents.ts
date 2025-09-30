/**
 * Documents API Service
 * 
 * Purpose: Handle all document-related API requests
 * - Encapsulates HTTP calls to the documents endpoints
 * - Transforms data between frontend and backend formats
 * - Provides type-safe API methods
 * 
 * Usage: import { documentsService } from './services/documents'
 */

import { httpClient } from '../utils/http';
import {
  DocumentRow,
  toFrontendDocument,
  toBackendDocumentCreate,
  toBackendDocumentUpdate,
} from '../utils/transformers';

export interface Document {
  id: string;
  eventId?: string;
  documentTypeId: string;
  filename: string;
  date: string;
  url?: string;
  author?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetDocumentsParams {
  eventId?: string;
  documentTypeId?: string;
  page?: number;
  pageSize?: number;
}

export interface GetDocumentsResponse {
  items: Document[];
  page: number;
  pageSize: number;
  total: number;
}

class DocumentsService {
  private readonly basePath = '/documents';

  /**
   * List all documents with optional filtering
   */
  async list(params: GetDocumentsParams = {}): Promise<GetDocumentsResponse> {
    // Make API call
    const rows = await httpClient.get<DocumentRow[]>(this.basePath, params);
    
    // Transform backend data to frontend format
    const documents = rows.map(toFrontendDocument);
    
    // For now, return all documents without pagination
    // TODO: Backend should return pagination metadata
    return {
      items: documents,
      page: params.page || 1,
      pageSize: params.pageSize || 25,
      total: documents.length,
    };
  }

  /**
   * Get a single document by ID
   */
  async get(id: string): Promise<Document> {
    // Make API call
    const row = await httpClient.get<DocumentRow>(`${this.basePath}/${id}`);
    
    // Transform backend data to frontend format
    return toFrontendDocument(row);
  }

  /**
   * Create a new document
   */
  async create(data: {
    eventId?: string;
    documentTypeId: string;
    filename: string;
    date: string;
    url?: string;
    author?: string;
    description?: string;
  }): Promise<Document> {
    // Transform frontend data to backend format
    const input = toBackendDocumentCreate(data);
    
    // Make API call
    const row = await httpClient.post<DocumentRow>(this.basePath, input);
    
    // Transform backend response to frontend format
    return toFrontendDocument(row);
  }

  /**
   * Update an existing document
   */
  async update(id: string, data: Partial<{
    eventId: string;
    documentTypeId: string;
    filename: string;
    date: string;
    url: string;
    author: string;
    description: string;
  }>): Promise<Document> {
    // Transform frontend data to backend format
    const input = toBackendDocumentUpdate(data);
    
    // Make API call
    const row = await httpClient.put<DocumentRow>(`${this.basePath}/${id}`, input);
    
    // Transform backend response to frontend format
    return toFrontendDocument(row);
  }

  /**
   * Delete a document
   */
  async delete(id: string): Promise<{ ok: boolean; id: string }> {
    // Make API call
    return await httpClient.delete<{ ok: boolean; id: string }>(`${this.basePath}/${id}`);
  }
}

// Export singleton instance
export const documentsService = new DocumentsService();

