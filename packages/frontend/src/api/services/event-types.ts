/**
 * Event Types API Service
 * 
 * Purpose: Handle all event-type-related API requests
 * - Encapsulates HTTP calls to the event-types endpoints
 * - Transforms data between frontend and backend formats
 * - Provides type-safe API methods
 * 
 * Usage: import { eventTypesService } from './services/event-types'
 */

import { httpClient } from '../utils/http';
import { EventTypeRow, toFrontendEventType } from '../utils/transformers';

export interface EventType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}

class EventTypesService {
  private readonly basePath = '/event-types';
  private cache: EventType[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * List all event types (with caching since they rarely change)
   */
  async list(): Promise<EventType[]> {
    // Return cached data if still valid
    const now = Date.now();
    if (this.cache && (now - this.cacheTimestamp) < this.CACHE_TTL) {
      return this.cache;
    }

    // Make API call
    const rows = await httpClient.get<EventTypeRow[]>(this.basePath);
    
    // Transform backend data to frontend format
    this.cache = rows.map(toFrontendEventType);
    this.cacheTimestamp = now;
    
    return this.cache;
  }

  /**
   * Get a lookup map of event type ID -> name
   * Useful for converting IDs to names
   */
  async getNameLookup(): Promise<Map<string, string>> {
    const eventTypes = await this.list();
    return new Map(eventTypes.map(et => [et.id, et.name]));
  }

  /**
   * Clear the cache (call when event types are modified)
   */
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Get a single event type by ID
   */
  async get(id: string): Promise<EventType> {
    // Make API call
    const row = await httpClient.get<EventTypeRow>(`${this.basePath}/${id}`);
    
    // Transform backend data to frontend format
    return toFrontendEventType(row);
  }

  /**
   * Create a new event type
   */
  async create(data: {
    name: string;
    description?: string;
    isActive?: boolean;
    displayOrder?: number;
  }): Promise<EventType> {
    // Transform to backend format
    const input = {
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? true,
      displayOrder: data.displayOrder,
    };
    
    // Make API call
    const row = await httpClient.post<EventTypeRow>(this.basePath, input);
    
    // Clear cache since we added a new event type
    this.clearCache();
    
    // Transform backend response to frontend format
    return toFrontendEventType(row);
  }

  /**
   * Update an existing event type
   */
  async update(id: string, data: Partial<{
    name: string;
    description?: string;
    isActive: boolean;
    displayOrder?: number;
  }>): Promise<EventType> {
    // Make API call
    const row = await httpClient.put<EventTypeRow>(`${this.basePath}/${id}`, data);
    
    // Clear cache since we modified an event type
    this.clearCache();
    
    // Transform backend response to frontend format
    return toFrontendEventType(row);
  }

  /**
   * Delete an event type
   */
  async delete(id: string): Promise<{ ok: boolean; id: string }> {
    // Make API call
    const result = await httpClient.delete<{ ok: boolean; id: string }>(`${this.basePath}/${id}`);
    
    // Clear cache since we deleted an event type
    this.clearCache();
    
    return result;
  }
}

// Export singleton instance
export const eventTypesService = new EventTypesService();

