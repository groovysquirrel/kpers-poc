import { useState, useEffect, useCallback } from 'react';
import { client } from '../../api/client';
import { StaffMember } from '../../types/domain';

interface UseStaffParams {
  autoFetch?: boolean;
}

interface UseStaffReturn {
  staff: StaffMember[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createStaff: (staffData: {
    name: string;
    role: string;
    email?: string;
    phone?: string;
    department?: string;
    status: 'Active' | 'Inactive' | 'Suspended';
    permissions: string[];
  }) => Promise<StaffMember>;
  updateStaff: (id: string, updates: Partial<StaffMember>) => Promise<StaffMember>;
  deleteStaff: (id: string) => Promise<void>;
  suspendStaff: (id: string) => Promise<StaffMember>;
  activateStaff: (id: string) => Promise<StaffMember>;
}

export function useStaff(params: UseStaffParams = {}): UseStaffReturn {
  const { autoFetch = false } = params;
  
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await client.getStaff();
      // Extract items array from response
      setStaff(response.items || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch staff');
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createStaff = useCallback(async (staffData: {
    name: string;
    role: string;
    email?: string;
    phone?: string;
    department?: string;
    status: 'Active' | 'Inactive' | 'Suspended';
    permissions: string[];
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const newStaff = await client.createStaff(staffData);
      // Refresh the staff list after creating
      await fetchStaff();
      return newStaff;
    } catch (err: any) {
      setError(err.message || 'Failed to create staff member');
      console.error('Error creating staff member:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStaff]);

  const updateStaff = useCallback(async (id: string, updates: Partial<StaffMember>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedStaff = await client.updateStaff(id, updates);
      // Refresh the staff list after updating
      await fetchStaff();
      return updatedStaff;
    } catch (err: any) {
      setError(err.message || 'Failed to update staff member');
      console.error('Error updating staff member:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStaff]);

  const deleteStaff = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await client.deleteStaff(id);
      // Refresh the staff list after deleting
      await fetchStaff();
    } catch (err: any) {
      setError(err.message || 'Failed to delete staff member');
      console.error('Error deleting staff member:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStaff]);

  const suspendStaff = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedStaff = await client.updateStaff(id, { status: 'Suspended' });
      // Refresh the staff list after suspending
      await fetchStaff();
      return updatedStaff;
    } catch (err: any) {
      setError(err.message || 'Failed to suspend staff member');
      console.error('Error suspending staff member:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStaff]);

  const activateStaff = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedStaff = await client.updateStaff(id, { status: 'Active' });
      // Refresh the staff list after activating
      await fetchStaff();
      return updatedStaff;
    } catch (err: any) {
      setError(err.message || 'Failed to activate staff member');
      console.error('Error activating staff member:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStaff]);

  const refetch = useCallback(async () => {
    await fetchStaff();
  }, [fetchStaff]);

  // Auto-fetch on mount and when params change
  useEffect(() => {
    if (autoFetch) {
      fetchStaff();
    }
  }, [fetchStaff, autoFetch]);

  return {
    staff,
    loading,
    error,
    refetch,
    createStaff,
    updateStaff,
    deleteStaff,
    suspendStaff,
    activateStaff
  };
}

