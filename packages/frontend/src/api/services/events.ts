/**
 * Events API Service
 * 
 * Purpose: Handle all event-related API requests
 * - Encapsulates HTTP calls to the events endpoints
 * - Transforms data between frontend and backend formats
 * - Provides type-safe API methods
 * 
 * Usage: import { eventsService } from './services/events'
 */

import { httpClient } from '../utils/http';
import { EventRow, toFrontendEvent, toBackendEventCreate, toBackendEventUpdate } from '../utils/transformers';
import { eventTypesService } from './event-types';

export interface Event {
  id: string;
  managerId: string;
  typeId: string; // event type ID (for backend calls)
  type: string; // event type name (for display)
  date: string;
  staffAttending: string[];
  comments: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetEventsParams {
  managerId?: string;
  type?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface GetEventsResponse {
  items: Event[];
  page: number;
  pageSize: number;
  total: number;
}

class EventsService {
  private readonly basePath = '/events';

  /**
   * Helper method to enrich events with type names
   */
  private async enrichWithTypeNames(events: ReturnType<typeof toFrontendEvent>[]): Promise<Event[]> {
    // Get event type name lookup
    const typeNameLookup = await eventTypesService.getNameLookup();
    
    // Enrich each event with type name
    return events.map(event => ({
      ...event,
      typeId: event.type, // Original ID from backend
      type: typeNameLookup.get(event.type) || event.type, // Name for display, fallback to ID
    }));
  }

  /**
   * List all events with optional filtering
   */
  async list(params: GetEventsParams = {}): Promise<GetEventsResponse> {
    // Make API call
    const rows = await httpClient.get<EventRow[]>(this.basePath, params);
    
    // Transform backend data to frontend format
    const events = rows.map(toFrontendEvent);
    
    // Filter by managerId if provided (client-side for now)
    let filtered = events;
    if (params.managerId) {
      filtered = events.filter(e => e.managerId === params.managerId);
    }
    
    // Enrich with type names
    const enriched = await this.enrichWithTypeNames(filtered);
    
    // For now, return all events without pagination
    // TODO: Backend should return pagination metadata
    return {
      items: enriched,
      page: params.page || 1,
      pageSize: params.pageSize || 25,
      total: enriched.length,
    };
  }

  /**
   * Get a single event by ID
   */
  async get(id: string): Promise<Event> {
    // Make API call
    const row = await httpClient.get<EventRow>(`${this.basePath}/${id}`);
    
    // Transform backend data to frontend format
    const event = toFrontendEvent(row);
    
    // Enrich with type name
    const [enriched] = await this.enrichWithTypeNames([event]);
    
    return enriched;
  }

  /**
   * Create a new event
   */
  async create(data: {
    managerId: string;
    type: string; // event type ID or name (we'll handle both)
    date: string;
    staffAttending?: string[];
    comments?: string;
  }): Promise<Event> {
    // Transform frontend data to backend format
    const input = toBackendEventCreate(data);
    
    // Make API call
    const row = await httpClient.post<EventRow>(this.basePath, input);
    
    // Transform backend response to frontend format
    const event = toFrontendEvent(row);
    
    // Enrich with type name
    const [enriched] = await this.enrichWithTypeNames([event]);
    
    return enriched;
  }

  /**
   * Update an existing event
   */
  async update(id: string, data: {
    type?: string; // event type ID or name (we'll handle both)
    date?: string;
    staffAttending?: string[];
    comments?: string;
  }): Promise<Event> {
    // Transform frontend data to backend format
    const input = toBackendEventUpdate(data);
    
    // Make API call
    const row = await httpClient.put<EventRow>(`${this.basePath}/${id}`, input);
    
    // Transform backend response to frontend format
    const event = toFrontendEvent(row);
    
    // Enrich with type name
    const [enriched] = await this.enrichWithTypeNames([event]);
    
    return enriched;
  }

  /**
   * Delete an event
   */
  async delete(id: string): Promise<{ ok: boolean; id: string }> {
    // Make API call
    return await httpClient.delete<{ ok: boolean; id: string }>(`${this.basePath}/${id}`);
  }
}

// Export singleton instance
export const eventsService = new EventsService();

