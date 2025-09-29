import { useState, useEffect, useCallback } from "react";
/**
 * DocumentForm Component
 * 
 * Purpose: Reusable form for creating and editing documents
 * - Handles form validation and submission
 * - Supports both create and edit modes
 * - Provides consistent UI/UX for document data entry
 * - Supports file upload simulation
 * 
 * Usage: <DocumentForm mode="create" onSubmit={handleSubmit} onCancel={handleCancel} />
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
  Chip
} from "@mui/material";
import { DocumentItem, Manager, EventRecord } from "../../types/domain";

interface DocumentFormData {
  title: string;
  managerId: string;
  eventId?: string;
  filename: string;
  contentType: string;
  size: number;
}

interface DocumentFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  document?: DocumentItem;
  managers: Manager[];
  events: EventRecord[];
  onSubmit: (data: DocumentFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

const initialFormData: DocumentFormData = {
  title: '',
  managerId: '',
  eventId: '',
  filename: '',
  contentType: 'application/pdf',
  size: 0
};

const contentTypeOptions = [
  { value: 'application/pdf', label: 'PDF Document' },
  { value: 'application/msword', label: 'Word Document' },
  { value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'Word Document (.docx)' },
  { value: 'application/vnd.ms-excel', label: 'Excel Spreadsheet' },
  { value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', label: 'Excel Spreadsheet (.xlsx)' },
  { value: 'text/plain', label: 'Text File' },
  { value: 'image/jpeg', label: 'JPEG Image' },
  { value: 'image/png', label: 'PNG Image' },
  { value: 'application/zip', label: 'ZIP Archive' },
  { value: 'other', label: 'Other' }
];

export default function DocumentForm({ 
  open, 
  mode, 
  document, 
  managers,
  events,
  onSubmit, 
  onCancel, 
  loading = false,
  error = null 
}: DocumentFormProps) {
  const [formData, setFormData] = useState<DocumentFormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Reset form when dialog opens/closes or document changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && document) {
        setFormData({
          title: document.title,
          managerId: document.managerId,
          eventId: document.eventId || '',
          filename: document.filename,
          contentType: document.contentType,
          size: document.size
        });
      } else {
        setFormData(initialFormData);
      }
      setValidationErrors({});
      setSelectedFile(null);
    }
  }, [open, mode, document]);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.managerId) {
      errors.managerId = 'Manager is required';
    }
    if (mode === 'create' && !selectedFile) {
      errors.file = 'File is required';
    }
    if (formData.size < 0) {
      errors.size = 'File size cannot be negative';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, selectedFile, mode]);

  const handleInputChange = useCallback((field: keyof DocumentFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [validationErrors]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size
      }));
      // Clear file validation error
      if (validationErrors.file) {
        setValidationErrors(prev => ({ ...prev, file: '' }));
      }
    }
  }, [validationErrors.file]);

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
    setSelectedFile(null);
    onCancel();
  }, [onCancel]);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getManagerName = useCallback((managerId: string) => {
    const manager = managers.find(m => m.id === managerId);
    return manager ? `${manager.firstName} ${manager.lastName} (${manager.company})` : 'Unknown Manager';
  }, [managers]);

  const getEventName = useCallback((eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event ? `${event.type} - ${new Date(event.date).toLocaleDateString()}` : 'Unknown Event';
  }, [events]);

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === 'create' ? 'Create New Document' : 'Edit Document'}
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
                label="Document Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={!!validationErrors.title}
                helperText={validationErrors.title || 'Enter a descriptive title for the document'}
                required
              />
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ flex: 1, minWidth: 200 }} required>
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
                
                <FormControl sx={{ flex: 1, minWidth: 200 }}>
                  <InputLabel>Event (Optional)</InputLabel>
                  <Select
                    value={formData.eventId || ''}
                    label="Event (Optional)"
                    onChange={(e) => handleInputChange('eventId', e.target.value)}
                  >
                    <MenuItem value="">
                      <em>No Event</em>
                    </MenuItem>
                    {events.map((event) => (
                      <MenuItem key={event.id} value={event.id}>
                        {getEventName(event.id)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              
              {mode === 'create' && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    File Upload
                  </Typography>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.zip"
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      sx={{ mb: 1 }}
                    >
                      Choose File
                    </Button>
                  </label>
                  {selectedFile && (
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={`${selectedFile.name} (${formatFileSize(selectedFile.size)})`}
                        onDelete={() => {
                          setSelectedFile(null);
                          setFormData(prev => ({ ...prev, filename: '', size: 0 }));
                        }}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  )}
                  {validationErrors.file && (
                    <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                      {validationErrors.file}
                    </Typography>
                  )}
                </Box>
              )}
              
              {mode === 'edit' && (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    sx={{ flex: 1, minWidth: 200 }}
                    label="Filename"
                    value={formData.filename}
                    onChange={(e) => handleInputChange('filename', e.target.value)}
                    error={!!validationErrors.filename}
                    helperText={validationErrors.filename}
                    required
                  />
                  
                  <FormControl sx={{ flex: 1, minWidth: 200 }}>
                    <InputLabel>Content Type</InputLabel>
                    <Select
                      value={formData.contentType}
                      label="Content Type"
                      onChange={(e) => handleInputChange('contentType', e.target.value)}
                    >
                      {contentTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
              
              {mode === 'edit' && (
                <TextField
                  fullWidth
                  label="File Size (bytes)"
                  type="number"
                  value={formData.size}
                  onChange={(e) => handleInputChange('size', parseInt(e.target.value) || 0)}
                  error={!!validationErrors.size}
                  helperText={validationErrors.size || `Current size: ${formatFileSize(formData.size)}`}
                  inputProps={{ min: 0 }}
                />
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
            {loading ? 'Saving...' : (mode === 'create' ? 'Create Document' : 'Update Document')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
