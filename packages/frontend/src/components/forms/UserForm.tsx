import { useState, useEffect, useCallback, useMemo } from "react";
/**
 * UserForm Component
 * 
 * Purpose: Reusable form for creating and editing users
 * - Handles form validation and submission
 * - Supports both create and edit modes
 * - Role and permission management
 * - User status management
 * 
 * Usage: <UserForm mode="create" onSubmit={handleSubmit} onCancel={handleCancel} />
 */
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Stack,
  Chip,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider
} from "@mui/material";
import { User, Role, Permission } from "../../types/domain";

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: 'Viewer' | 'Editor' | 'Administrator';
  status: 'Active' | 'Inactive' | 'Suspended';
  permissions: string[];
}

interface UserFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  user?: User;
  roles: Role[];
  permissions: Permission[];
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

const initialFormData: UserFormData = {
  email: '',
  firstName: '',
  lastName: '',
  role: 'Viewer',
  status: 'Active',
  permissions: []
};

export default function UserForm({ 
  open, 
  mode, 
  user, 
  roles,
  permissions,
  onSubmit, 
  onCancel, 
  loading = false,
  error = null 
}: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && user) {
        setFormData({
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: user.role,
          status: user.status,
          permissions: user.permissions || []
        });
      } else {
        setFormData(initialFormData);
      }
      setValidationErrors({});
    }
  }, [open, mode, user]);

  // Update permissions when role changes
  useEffect(() => {
    if (formData.role) {
      const selectedRole = roles.find(r => r.name === formData.role);
      if (selectedRole) {
        setFormData(prev => ({ ...prev, permissions: selectedRole.permissions }));
      }
    }
  }, [formData.role, roles]);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof UserFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [validationErrors]);

  const handlePermissionToggle = useCallback((permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done by parent component
      console.error('Form submission error:', error);
    }
  }, [formData, validateForm, onSubmit]);

  const handleCancel = useCallback(() => {
    setFormData(initialFormData);
    setValidationErrors({});
    onCancel();
  }, [onCancel]);

  const getRolePermissions = useCallback((roleName: string) => {
    const role = roles.find(r => r.name === roleName);
    return role ? role.permissions : [];
  }, [roles]);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    permissions.forEach(permission => {
      if (!groups[permission.category]) {
        groups[permission.category] = [];
      }
      groups[permission.category].push(permission);
    });
    return groups;
  }, [permissions]);

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === 'create' ? 'Create New User' : 'Edit User'}
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ pt: 1 }}>
            <Stack spacing={2}>
              {/* Basic Information */}
              <Typography variant="h6">Basic Information</Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  sx={{ flex: 1, minWidth: 200 }}
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  required
                />
                
                <TextField
                  sx={{ flex: 1, minWidth: 200 }}
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={!!validationErrors.firstName}
                  helperText={validationErrors.firstName}
                  required
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  sx={{ flex: 1, minWidth: 200 }}
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={!!validationErrors.lastName}
                  helperText={validationErrors.lastName}
                  required
                />
                
                <FormControl sx={{ flex: 1, minWidth: 200 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                    <MenuItem value="Suspended">Suspended</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider />

              {/* Role Selection */}
              <Typography variant="h6">Role & Permissions</Typography>
              
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => handleInputChange('role', e.target.value)}
                >
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.name}>
                      <Box>
                        <Typography variant="subtitle2">{role.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Role Description */}
              {formData.role && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {roles.find(r => r.name === formData.role)?.description}
                  </Typography>
                  <Typography variant="caption">
                    This role includes {getRolePermissions(formData.role).length} permissions
                  </Typography>
                </Alert>
              )}

              {/* Custom Permissions */}
              <Typography variant="subtitle1">Custom Permissions</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Override role permissions by selecting specific permissions below
              </Typography>

              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <Box key={category}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {category}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {categoryPermissions.map((permission) => (
                      <FormControlLabel
                        key={permission.id}
                        control={
                          <Checkbox
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            size="small"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                              {permission.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {permission.description}
                            </Typography>
                          </Box>
                        }
                        sx={{ 
                          width: '100%', 
                          margin: 0,
                          '& .MuiFormControlLabel-label': { width: '100%' }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}

              {/* Selected Permissions Summary */}
              {formData.permissions.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Selected Permissions ({formData.permissions.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {formData.permissions.map((permissionId) => {
                      const permission = permissions.find(p => p.id === permissionId);
                      return permission ? (
                        <Chip
                          key={permissionId}
                          label={permission.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ) : null;
                    })}
                  </Box>
                </Box>
              )}
            </Stack>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Saving...' : (mode === 'create' ? 'Create User' : 'Update User')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
