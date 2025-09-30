import { useState, useEffect, useCallback } from "react";
/**
 * EventForm Component
 * 
 * Purpose: Reusable form for creating and editing events
 * - Handles form validation and submission
 * - Supports both create and edit modes
 * - Provides consistent UI/UX for event data entry
 * 
 * Usage: <EventForm mode="create" onSubmit={handleSubmit} onCancel={handleCancel} />
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
  Autocomplete,
  Chip
} from "@mui/material";
import { EventRecord, Manager, StaffMember, EventType } from "../../types/domain";

interface EventFormData {
  type: string;
  managerId: string;
  date: string;
  staffAttending: string[];
  comments: string;
}

interface EventFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  event?: EventRecord;
  managers: Manager[];
  staffMembers: StaffMember[];
  eventTypes: EventType[];
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

const initialFormData: EventFormData = {
  type: '',
  managerId: '',
  date: new Date().toISOString().split('T')[0],
  staffAttending: [],
  comments: ''
};

export default function EventForm({ 
  open, 
  mode, 
  event, 
  managers,
  staffMembers,
  eventTypes,
  onSubmit, 
  onCancel, 
  loading = false,
  error = null 
}: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes or event changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && event) {
        setFormData({
          type: event.type,
          managerId: event.managerId,
          date: event.date,
          staffAttending: event.staffAttending || [],
          comments: event.comments || ''
        });
      } else {
        setFormData(initialFormData);
      }
      setValidationErrors({});
    }
  }, [open, mode, event]);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!formData.type.trim()) {
      errors.type = 'Event type is required';
    }
    if (!formData.managerId) {
      errors.managerId = 'Manager is required';
    }
    if (!formData.date) {
      errors.date = 'Date is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((field: keyof EventFormData, value: string | string[]) => {
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

  const getManagerName = useCallback((managerId: string) => {
    const manager = managers.find(m => m.id === managerId);
    return manager ? `${manager.firstName} ${manager.lastName} (${manager.company})` : 'Unknown Manager';
  }, [managers]);

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === 'create' ? 'Create New Event' : 'Edit Event'}
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
                <FormControl sx={{ flex: 1, minWidth: 200 }} required>
                  <InputLabel>Event Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Event Type"
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    {eventTypes.map((eventType) => (
                      <MenuItem key={eventType.id} value={eventType.name}>
                        {eventType.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  sx={{ flex: 1, minWidth: 200 }}
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  error={!!validationErrors.date}
                  helperText={validationErrors.date}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Box>
              
              <FormControl fullWidth required>
                <InputLabel>Manager</InputLabel>
                <Select
                  value={formData.managerId}
                  label="Manager"
                  onChange={(e) => handleInputChange('managerId', e.target.value)}
                >
                  {managers.map((manager) => (
                    <MenuItem key={manager.id} value={manager.id}>
                      {getManagerName(manager.id)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Autocomplete
                multiple
                options={staffMembers}
                getOptionLabel={(option) => option.name}
                value={staffMembers.filter(staff => formData.staffAttending.includes(staff.id))}
                onChange={(_, newValue) => {
                  handleInputChange('staffAttending', newValue.map(staff => staff.id));
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Staff Attending"
                    placeholder="Select staff members"
                  />
                )}
              />
              
              <TextField
                fullWidth
                label="Comments"
                multiline
                rows={4}
                value={formData.comments}
                onChange={(e) => handleInputChange('comments', e.target.value)}
                placeholder="Add any additional notes or comments about this event..."
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
            {loading ? 'Saving...' : (mode === 'create' ? 'Create Event' : 'Update Event')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
