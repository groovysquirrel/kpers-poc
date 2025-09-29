import { useState, useEffect, useCallback } from "react";
/**
 * ManagerForm Component
 * 
 * Purpose: Reusable form for creating and editing managers
 * - Handles form validation and submission
 * - Supports both create and edit modes
 * - Provides consistent UI/UX for manager data entry
 * 
 * Usage: <ManagerForm mode="create" onSubmit={handleSubmit} onCancel={handleCancel} />
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
import { Manager } from "../../types/domain";

interface ManagerFormData {
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  status: 'Active' | 'Terminated' | 'Probation';
  marketValue: number;
  asOfDate: string;
}

interface ManagerFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  manager?: Manager;
  onSubmit: (data: ManagerFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

const initialFormData: ManagerFormData = {
  firstName: '',
  lastName: '',
  company: '',
  phone: '',
  email: '',
  status: 'Active',
  marketValue: 0,
  asOfDate: new Date().toISOString().split('T')[0]
};

export default function ManagerForm({ 
  open, 
  mode, 
  manager, 
  onSubmit, 
  onCancel, 
  loading = false,
  error = null 
}: ManagerFormProps) {
  const [formData, setFormData] = useState<ManagerFormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes or manager changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && manager) {
        setFormData({
          firstName: manager.firstName,
          lastName: manager.lastName,
          company: manager.company,
          phone: manager.phone,
          email: manager.email,
          status: manager.status,
          marketValue: manager.marketValue,
          asOfDate: manager.asOfDate
        });
      } else {
        setFormData(initialFormData);
      }
      setValidationErrors({});
    }
  }, [open, mode, manager]);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!formData.company.trim()) {
      errors.company = 'Company is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (formData.marketValue < 0) {
      errors.marketValue = 'Market value cannot be negative';
    }
    if (!formData.asOfDate) {
      errors.asOfDate = 'As of date is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof ManagerFormData, value: string | number) => {
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

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === 'create' ? 'Create New Manager' : 'Edit Manager'}
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ pt: 1 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  sx={{ flex: 1, minWidth: 200 }}
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  error={!!validationErrors.firstName}
                  helperText={validationErrors.firstName}
                  required
                />
                <TextField
                  sx={{ flex: 1, minWidth: 200 }}
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  error={!!validationErrors.lastName}
                  helperText={validationErrors.lastName}
                  required
                />
              </Box>
              
              <TextField
                fullWidth
                label="Company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                error={!!validationErrors.company}
                helperText={validationErrors.company}
                required
              />
              
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
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={!!validationErrors.phone}
                  helperText={validationErrors.phone}
                  required
                />
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ flex: 1, minWidth: 200 }} required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Probation">Probation</MenuItem>
                    <MenuItem value="Terminated">Terminated</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  sx={{ flex: 1, minWidth: 200 }}
                  label="As of Date"
                  type="date"
                  value={formData.asOfDate}
                  onChange={(e) => handleInputChange('asOfDate', e.target.value)}
                  error={!!validationErrors.asOfDate}
                  helperText={validationErrors.asOfDate}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Box>
              
              <TextField
                fullWidth
                label="Market Value (USD)"
                type="number"
                value={formData.marketValue}
                onChange={(e) => handleInputChange('marketValue', parseFloat(e.target.value) || 0)}
                error={!!validationErrors.marketValue}
                helperText={validationErrors.marketValue || `Current value: ${formatCurrency(formData.marketValue)}`}
                inputProps={{ min: 0, step: 1000 }}
              />
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
            {loading ? 'Saving...' : (mode === 'create' ? 'Create Manager' : 'Update Manager')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
