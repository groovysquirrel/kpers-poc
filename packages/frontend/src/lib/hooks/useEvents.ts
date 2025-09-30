/**
 * Custom Hook: useEvents
 * 
 * Purpose: Centralized data management for events
 * - Handles loading states, error states, and data caching
 * - Provides methods for CRUD operations
 * - Implements proper error handling and user feedback
 * 
 * Usage: const { events, loading, error, createEvent, updateEvent, deleteEvent } = useEvents()
 */

import { useState, useEffect, useCallback } from 'react';
import { client } from '../../api/client';
import { EventRecord, EventCreate, EventUpdate } from '../../types/domain';

interface UseEventsParams {
  managerId?: string;
  type?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  autoFetch?: boolean;
}

interface UseEventsReturn {
  events: EventRecord[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createEvent: (eventData: EventCreate) => Promise<EventRecord>;
  updateEvent: (id: string, eventData: EventUpdate) => Promise<EventRecord>;
  deleteEvent: (id: string) => Promise<void>;
}

export function useEvents(params: UseEventsParams = {}): UseEventsReturn {
  const {
    managerId,
    type,
    from,
    to,
    page = 1,
    pageSize = 25,
    autoFetch = true
  } = params;

  const [events, setEvents] = useState<EventRecord[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await client.getEvents({
        managerId,
        type,
        from,
        to,
        page,
        pageSize
      });
      
      setEvents(response.items);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [managerId, type, from, to, page, pageSize]);

  const createEvent = useCallback(async (eventData: EventCreate): Promise<EventRecord> => {
    setLoading(true);
    setError(null);
    
    try {
      const newEvent = await client.createEvent(eventData);
      // Refresh the events list after creating
      await fetchEvents();
      return newEvent;
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
      console.error('Error creating event:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEvents]);

  const updateEvent = useCallback(async (id: string, eventData: EventUpdate): Promise<EventRecord> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedEvent = await client.updateEvent(id, eventData);
      // Refresh the events list after updating
      await fetchEvents();
      return updatedEvent;
    } catch (err: any) {
      setError(err.message || 'Failed to update event');
      console.error('Error updating event:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEvents]);

  const deleteEvent = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await client.deleteEvent(id);
      // Refresh the events list after deleting
      await fetchEvents();
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
      console.error('Error deleting event:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEvents]);

  const refetch = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  // Auto-fetch on mount and when params change
  useEffect(() => {
    if (autoFetch) {
      fetchEvents();
    }
  }, [fetchEvents, autoFetch]);

  return {
    events,
    pagination,
    loading,
    error,
    refetch,
    createEvent,
    updateEvent,
    deleteEvent
  };
}

