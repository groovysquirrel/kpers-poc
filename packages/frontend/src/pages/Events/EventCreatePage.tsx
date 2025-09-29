import { useState, useCallback } from "react";
/**
 * EventCreatePage
 *
 * Purpose
 * - Provide a simple, validated form to create a new Event using API client
 * - Demonstrate common MUI form patterns (Select, Autocomplete, TextField)
 *
 * Concepts
 * - Local component state holds form data; no global store needed for this page
 * - Custom hooks handle data fetching and API calls
 * - validateForm returns field-level errors for user feedback
 * - On submit, we call the real API, then navigate back to the Events list
 */
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Divider
} from "@mui/material";
import { ArrowBack as BackIcon, Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";
import { EventCreateForm } from "../../types/domain";
import { useManagers } from "../../lib/hooks/useManagers";
import { useReferenceData } from "../../lib/hooks/useReferenceData";
import { useEvents } from "../../lib/hooks/useEvents";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import "./EventCreatePage.css";

export default function EventCreatePage() {
  const navigate = useNavigate();
  
  // -----------------------------
  // Form State
  // -----------------------------
  const [formData, setFormData] = useState<EventCreateForm>({
    managerId: "",
    date: new Date().toISOString().split('T')[0], // Today's date
    type: "",
    staffAttending: [],
    comments: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // -----------------------------
  // Data Sources (from API)
  // -----------------------------
  const { 
    managers, 
    loading: managersLoading, 
    error: managersError 
  } = useManagers({ autoFetch: true });

  const { 
    eventTypes, 
    staff, 
    loading: referenceLoading, 
    error: referenceError 
  } = useReferenceData();

  const { 
    createEvent, 
    loading: createLoading
  } = useEvents({ autoFetch: false });

  // Loading and error states
  const isLoading = managersLoading || referenceLoading;
  const hasError = managersError || referenceError;

  // -----------------------------
  // Helpers
  // -----------------------------
  const handleInputChange = useCallback((field: keyof EventCreateForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  }, [errors]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.managerId) {
      newErrors.managerId = "Manager is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (!formData.type) {
      newErrors.type = "Event type is required";
    }

    if (formData.staffAttending.length === 0) {
      newErrors.staffAttending = "At least one staff member must be selected";
    }

    if (!formData.comments.trim()) {
      newErrors.comments = "Comments are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if date is more than a year old (example of domain rule)
    const selectedDate = new Date(formData.date);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    if (selectedDate < oneYearAgo) {
      const confirmed = window.confirm(
        `The selected date (${selectedDate.toLocaleDateString()}) is more than a year old. Are you sure you want to create this event?`
      );
      
      if (!confirmed) {
        return;
      }
    }
    
    try {
      // Create event using API client
      await createEvent({
        managerId: formData.managerId,
        date: formData.date,
        type: formData.type,
        staffAttending: formData.staffAttending,
        comments: formData.comments
      });
      
      // Show success message and navigate back
      alert("Event created successfully!");
      navigate("/events");
      
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    }
  }, [formData, createEvent, navigate]);

  const handleCancel = useCallback(() => {
    navigate("/events");
  }, [navigate]);

  const getSelectedManager = useCallback(() => {
    return managers.find(m => m.id === formData.managerId);
  }, [managers, formData.managerId]);

  // Show loading state
  if (isLoading) {
    return (
      <Box className="event-create-page">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            onClick={() => navigate('/events')} 
            startIcon={<BackIcon />}
            sx={{ mr: 2 }}
          >
            Back to Events
          </Button>
          <Typography variant="h4" component="h1">
            Create New Event
          </Typography>
        </Box>
        <LoadingSpinner message="Loading form data..." fullHeight />
      </Box>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <Box className="event-create-page">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            onClick={() => navigate('/events')} 
            startIcon={<BackIcon />}
            sx={{ mr: 2 }}
          >
            Back to Events
          </Button>
          <Typography variant="h4" component="h1">
            Create New Event
          </Typography>
        </Box>
        <ErrorAlert
          title="Failed to load form data"
          message={managersError || referenceError || 'An unexpected error occurred'}
        />
      </Box>
    );
  }

  return (
    <Box className="event-create-page">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          onClick={() => navigate('/events')} 
          startIcon={<BackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Events
        </Button>
        <Typography variant="h4" component="h1">
          Create New Event
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            
            {/* Manager Selection */}
            <FormControl fullWidth error={!!errors.managerId}>
              <InputLabel>Manager *</InputLabel>
              <Select
                value={formData.managerId}
                label="Manager *"
                onChange={(e) => handleInputChange('managerId', e.target.value)}
              >
                {managers.map((manager) => (
                  <MenuItem key={manager.id} value={manager.id}>
                    {manager.firstName} {manager.lastName} - {manager.company}
                  </MenuItem>
                ))}
              </Select>
              {errors.managerId && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.managerId}
                </Typography>
              )}
            </FormControl>

            {/* Event Type */}
            <FormControl fullWidth error={!!errors.type}>
              <InputLabel>Event Type *</InputLabel>
              <Select
                value={formData.type}
                label="Event Type *"
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                {eventTypes.map((eventType) => (
                  <MenuItem key={eventType.id} value={eventType.name}>
                    {eventType.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.type && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.type}
                </Typography>
              )}
            </FormControl>

            {/* Date */}
            <TextField
              fullWidth
              label="Event Date *"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              error={!!errors.date}
              helperText={errors.date}
              InputLabelProps={{
                shrink: true,
              }}
            />

            {/* Staff Attending */}
            <FormControl fullWidth error={!!errors.staffAttending}>
              <Autocomplete
                multiple
                options={staff.map(s => s.name)}
                value={formData.staffAttending}
                onChange={(_, newValue) => handleInputChange('staffAttending', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Staff Attending *"
                    placeholder="Select staff members"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
              />
              {errors.staffAttending && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.staffAttending}
                </Typography>
              )}
            </FormControl>

            {/* Comments - Full Width */}
            <TextField
              fullWidth
              label="Comments *"
              multiline
              rows={4}
              value={formData.comments}
              onChange={(e) => handleInputChange('comments', e.target.value)}
              error={!!errors.comments}
              helperText={errors.comments || "Provide details about the event"}
              sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
            />

          </Box>

          {/* Selected Manager Info */}
          {getSelectedManager() && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Selected Manager Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Company
                    </Typography>
                    <Typography variant="body1">
                      {getSelectedManager()?.company}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {getSelectedManager()?.email}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {getSelectedManager()?.phone}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              startIcon={<CancelIcon />}
              disabled={createLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={createLoading}
            >
              {createLoading ? "Creating..." : "Create Event"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
