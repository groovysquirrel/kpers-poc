import { useState, useEffect, useCallback } from 'react';
import { client } from '../../api/client';
import { User } from '../../types/domain';

interface UseUsersParams {
  autoFetch?: boolean;
}

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createUser: (userData: {
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'Viewer' | 'Editor' | 'Administrator';
    status: 'Active' | 'Inactive' | 'Suspended';
    permissions: string[];
  }) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  suspendUser: (id: string) => Promise<User>;
  activateUser: (id: string) => Promise<User>;
}

export function useUsers(params: UseUsersParams = {}): UseUsersReturn {
  const { autoFetch = false } = params;
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const usersData = await client.getUsers();
      setUsers(usersData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: {
    email: string;
    firstName?: string;
    lastName?: string;
    role: 'Viewer' | 'Editor' | 'Administrator';
    status: 'Active' | 'Inactive' | 'Suspended';
    permissions: string[];
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const newUser = await client.createUser(userData);
      // Refresh the users list after creating
      await fetchUsers();
      return newUser;
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
      console.error('Error creating user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await client.updateUser(id, updates);
      // Refresh the users list after updating
      await fetchUsers();
      return updatedUser;
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
      console.error('Error updating user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await client.deleteUser(id);
      // Refresh the users list after deleting
      await fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
      console.error('Error deleting user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const suspendUser = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await client.updateUser(id, { status: 'Suspended' });
      // Refresh the users list after suspending
      await fetchUsers();
      return updatedUser;
    } catch (err: any) {
      setError(err.message || 'Failed to suspend user');
      console.error('Error suspending user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const activateUser = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await client.updateUser(id, { status: 'Active' });
      // Refresh the users list after activating
      await fetchUsers();
      return updatedUser;
    } catch (err: any) {
      setError(err.message || 'Failed to activate user');
      console.error('Error activating user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  const refetch = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  // Auto-fetch on mount and when params change
  useEffect(() => {
    if (autoFetch) {
      fetchUsers();
    }
  }, [fetchUsers, autoFetch]);

  return {
    users,
    loading,
    error,
    refetch,
    createUser,
    updateUser,
    deleteUser,
    suspendUser,
    activateUser
  };
}

