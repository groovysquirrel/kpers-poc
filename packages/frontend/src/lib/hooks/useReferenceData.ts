/**
 * Custom Hook: useReferenceData
 * 
 * Purpose: Centralized data management for reference data (event types, staff, etc.)
 * - Handles loading states, error states, and data caching
 * - Provides methods for fetching reference data
 * - Implements proper error handling and user feedback
 * 
 * Usage: const { eventTypes, staff, loading, error } = useReferenceData()
 */

import { useState, useEffect, useCallback } from 'react';
import { client } from '../../api/client';
import { EventType, StaffMember } from '../../types/domain';

interface UseReferenceDataReturn {
  eventTypes: EventType[];
  staff: StaffMember[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReferenceData(): UseReferenceDataReturn {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReferenceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [eventTypesData, staffData] = await Promise.all([
        client.getEventTypes(),
        client.getStaff()
      ]);
      
      setEventTypes(eventTypesData);
      setStaff(staffData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reference data');
      console.error('Error fetching reference data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchReferenceData();
  }, [fetchReferenceData]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  return {
    eventTypes,
    staff,
    loading,
    error,
    refetch
  };
}
