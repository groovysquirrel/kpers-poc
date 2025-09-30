import { useState, useEffect, useCallback } from "react";
/**
 * StaffForm Component
 * 
 * Purpose: Reusable form for creating and editing staff members
 * - Handles form validation and submission
 * - Supports both create and edit modes
 * - Staff member information management
 * - Department and role assignment
 * 
 * Usage: <StaffForm mode="create" onSubmit={handleSubmit} onCancel={handleCancel} />
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
  Stack
} from "@mui/material";
import { StaffMember } from "../../types/domain";

interface StaffFormData {
  name: string;
  role: string;
  email: string;
  phone: string;
  department: string;
  status: 'Active' | 'Inactive' | 'Suspended';
}

interface StaffFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  staff?: StaffMember;
  onSubmit: (data: StaffFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

const initialFormData: StaffFormData = {
  name: '',
  role: '',
  email: '',
  phone: '',
  department: '',
  status: 'Active'
};

const roleOptions = [
  'Investment Analyst',
  'Portfolio Manager',
  'Risk Manager',
  'Compliance Officer',
  'Senior Analyst',
  'Research Analyst',
  'Operations Manager',
  'Administrative Assistant',
  'Other'
];

const departmentOptions = [
  'Investment Management',
  'Risk Management',
  'Compliance',
  'Operations',
  'Administration',
  'Research',
  'Other'
];

export default function StaffForm({ 
  open, 
  mode, 
  staff, 
  onSubmit, 
  onCancel, 
  loading = false,
  error = null 
}: StaffFormProps) {
  const [formData, setFormData] = useState<StaffFormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes or staff changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && staff) {
        setFormData({
          name: staff.name,
          role: staff.role,
          email: staff.email || '',
          phone: staff.phone || '',
          department: staff.department || '',
          status: staff.status
        });
      } else {
        setFormData(initialFormData);
      }
      setValidationErrors({});
    }
  }, [open, mode, staff]);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.role.trim()) {
      errors.role = 'Role is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof StaffFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [validationErrors]);

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

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === 'create' ? 'Add Staff Member' : 'Edit Staff Member'}
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ pt: 1 }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!validationErrors.name}
                helperText={validationErrors.name}
                required
              />
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ flex: 1, minWidth: 200 }} required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    label="Role"
                    onChange={(e) => handleInputChange('role', e.target.value)}
                  >
                    {roleOptions.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl sx={{ flex: 1, minWidth: 200 }}>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={formData.department}
                    label="Department"
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  >
                    {departmentOptions.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  sx={{ flex: 1, minWidth: 200 }}
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={!!validationErrors.email}
                  helperText={validationErrors.email || 'Optional'}
                />
                
                <TextField
                  sx={{ flex: 1, minWidth: 200 }}
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </Box>
              
              <FormControl>
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
            {loading ? 'Saving...' : (mode === 'create' ? 'Add Staff Member' : 'Update Staff Member')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

