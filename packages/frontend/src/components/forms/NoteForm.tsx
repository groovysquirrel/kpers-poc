import { useState, useEffect, useCallback } from "react";
/**
 * NoteForm Component
 *
 * Purpose: Reusable form for creating and editing notes
 * - Handles form validation and submission
 * - Supports both create and edit modes
 * - Provides consistent UI/UX for note data entry
 * - Supports associations with managers, events, staff, and documents
 *
 * Usage: <NoteForm mode="create" onSubmit={handleSubmit} onCancel={handleCancel} />
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
  Typography,
  Chip,
  FormHelperText
} from "@mui/material";
import { Manager, StaffMember, Note, NoteType } from "../../types/domain";

interface NoteFormData {
  title: string;
  content: string;
  type: string;
  managerId?: string;
  eventId?: string;
  staffId?: string;
  documentId?: string;
  tags?: string[];
}

interface NoteFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  note?: Note;
  managers: Manager[];
  staff: StaffMember[];
  noteTypes: NoteType[];
  events?: any[]; // Optional events for association
  onSubmit: (data: NoteFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

const initialFormData: NoteFormData = {
  title: '',
  content: '',
  type: '',
  managerId: '',
  eventId: '',
  staffId: '',
  documentId: '',
  tags: []
};

export default function NoteForm({
  open,
  mode,
  note,
  managers,
  staff,
  noteTypes,
  events = [],
  onSubmit,
  onCancel,
  loading = false,
  error = null
}: NoteFormProps) {
  const [formData, setFormData] = useState<NoteFormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  // Reset form when dialog opens/closes or note changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && note) {
        setFormData({
          title: note.title,
          content: note.content,
          type: note.type,
          managerId: note.managerId || '',
          eventId: note.eventId || '',
          staffId: note.staffId || '',
          documentId: note.documentId || '',
          tags: note.tags || []
        });
      } else {
        setFormData(initialFormData);
      }
      setValidationErrors({});
      setTagInput('');
    }
  }, [open, mode, note]);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }

    if (!formData.type) {
      errors.type = 'Note type is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle form field changes
  const handleFieldChange = useCallback((field: keyof NoteFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [validationErrors]);

  // Handle tag addition
  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      handleFieldChange('tags', [...(formData.tags || []), tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, formData.tags, handleFieldChange]);

  // Handle tag removal
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    handleFieldChange('tags', formData.tags?.filter(tag => tag !== tagToRemove) || []);
  }, [formData.tags, handleFieldChange]);

  // Handle form submission
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      // Error is handled by parent component
      console.error('Form submission error:', err);
    }
  }, [formData, validateForm, onSubmit]);

  // Handle Enter key in tag input
  const handleTagKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

  const isFormValid = formData.title.trim() && formData.content.trim() && formData.type;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '600px' }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === 'create' ? 'Create Note' : 'Edit Note'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Error Alert */}
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            {/* Title Field */}
            <TextField
              label="Note Title"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              error={!!validationErrors.title}
              helperText={validationErrors.title}
              fullWidth
              required
              disabled={loading}
            />

            {/* Note Type Field */}
            <FormControl
              fullWidth
              error={!!validationErrors.type}
              required
              disabled={loading}
            >
              <InputLabel>Note Type</InputLabel>
              <Select
                value={formData.type}
                label="Note Type"
                onChange={(e) => handleFieldChange('type', e.target.value)}
              >
                <MenuItem value="">
                  <em>Select a note type</em>
                </MenuItem>
                {noteTypes.map((noteType) => (
                  <MenuItem key={noteType.id} value={noteType.id}>
                    {noteType.name}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.type && (
                <FormHelperText>{validationErrors.type}</FormHelperText>
              )}
            </FormControl>

            {/* Manager Association */}
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Associated Manager (Optional)</InputLabel>
              <Select
                value={formData.managerId || ''}
                label="Associated Manager (Optional)"
                onChange={(e) => handleFieldChange('managerId', e.target.value || undefined)}
              >
                <MenuItem value="">
                  <em>No manager association</em>
                </MenuItem>
                {managers.map((manager) => (
                  <MenuItem key={manager.id} value={manager.id}>
                    {manager.firstName} {manager.lastName} ({manager.company})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Staff Association */}
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Associated Staff Member (Optional)</InputLabel>
              <Select
                value={formData.staffId || ''}
                label="Associated Staff Member (Optional)"
                onChange={(e) => handleFieldChange('staffId', e.target.value || undefined)}
              >
                <MenuItem value="">
                  <em>No staff association</em>
                </MenuItem>
                {staff.map((staffMember) => (
                  <MenuItem key={staffMember.id} value={staffMember.id}>
                    {staffMember.name} - {staffMember.role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Event Association (if events are provided) */}
            {events.length > 0 && (
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Associated Event (Optional)</InputLabel>
                <Select
                  value={formData.eventId || ''}
                  label="Associated Event (Optional)"
                  onChange={(e) => handleFieldChange('eventId', e.target.value || undefined)}
                >
                  <MenuItem value="">
                    <em>No event association</em>
                  </MenuItem>
                  {events.map((event) => (
                    <MenuItem key={event.id} value={event.id}>
                      {event.type} - {new Date(event.date).toLocaleDateString()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Tags Section */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tags (Optional)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                {formData.tags?.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                    disabled={loading}
                  />
                ))}
              </Box>
              <TextField
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                disabled={loading}
                size="small"
                fullWidth
              />
            </Box>

            {/* Content Field */}
            <TextField
              label="Note Content"
              value={formData.content}
              onChange={(e) => handleFieldChange('content', e.target.value)}
              error={!!validationErrors.content}
              helperText={validationErrors.content}
              multiline
              rows={8}
              fullWidth
              required
              disabled={loading}
              placeholder="Enter your note content here..."
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !isFormValid}
          >
            {loading ? 'Saving...' : (mode === 'create' ? 'Create Note' : 'Update Note')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
