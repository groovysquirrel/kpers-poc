/**
 * Custom Hook: usePermissions
 * 
 * Purpose: Centralized data management for permissions and roles
 * - Handles loading states, error states, and data caching
 * - Provides methods for fetching permissions and roles
 * - Used primarily in admin interfaces
 * 
 * Usage: const { permissions, roles, loading, error } = usePermissions()
 */

import { useState, useEffect, useCallback } from 'react';
import { client } from '../../api/client';
import { Permission, Role } from '../../types/domain';

interface UsePermissionsReturn {
  permissions: Permission[];
  roles: Role[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePermissions(): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissionsAndRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [permissionsData, rolesData] = await Promise.all([
        client.getPermissions(),
        client.getRoles()
      ]);
      
      setPermissions(permissionsData);
      setRoles(rolesData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch permissions and roles');
      console.error('Error fetching permissions and roles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchPermissionsAndRoles();
  }, [fetchPermissionsAndRoles]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchPermissionsAndRoles();
  }, [fetchPermissionsAndRoles]);

  return {
    permissions,
    roles,
    loading,
    error,
    refetch
  };
}
