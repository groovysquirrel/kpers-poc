import { useState, useCallback } from "react";
/**
 * EventCreatePage
 *
 * Purpose
 * - Provide a dedicated page for creating new events
 * - Uses EventForm component for consistent UI/UX
 * - Handles navigation back to events list after creation
 *
 * Concepts
 * - Form validation and submission
 * - Navigation after successful creation
 * - Error handling and user feedback
 */
import { 
  Box, 
  Paper, 
  Typography,
  Button,
  Alert
} from "@mui/material";
import { ArrowBack as BackIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useEvents } from "../../lib/hooks/useEvents";
import { useManagers } from "../../lib/hooks/useManagers";
import { useReferenceData } from "../../lib/hooks/useReferenceData";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import EventForm from "../../components/forms/EventForm";
import "./EventCreatePage.css";

export default function EventCreatePage() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  // API hooks
  const { createEvent, loading: eventsLoading } = useEvents({ autoFetch: false });
  const { managers, loading: managersLoading, error: managersError } = useManagers({ autoFetch: true });
  const { eventTypes, staff, loading: referenceLoading, error: referenceError } = useReferenceData();

  const isLoading = managersLoading || referenceLoading;
  const hasError = managersError || referenceError;

  const handleSubmit = useCallback(async (formData: {
    type: string;
    managerId: string;
    date: string;
    staffAttending: string[];
    comments: string;
  }) => {
    try {
      setFormError(null);
      await createEvent(formData);
      // Navigate back to events list after successful creation
      navigate('/events');
    } catch (error: any) {
      console.error('Failed to create event:', error);
      setFormError(error.message || 'Failed to create event');
    }
  }, [createEvent, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/events');
  }, [navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <Box className="event-create-page">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<BackIcon />}
            onClick={() => navigate('/events')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4">Create Event</Typography>
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
            startIcon={<BackIcon />}
            onClick={() => navigate('/events')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4">Create Event</Typography>
        </Box>
        <ErrorAlert
          title="Failed to load form data"
          message={managersError || referenceError || 'An unexpected error occurred'}
          onRetry={() => window.location.reload()}
        />
      </Box>
    );
  }

  return (
    <Box className="event-create-page">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<BackIcon />}
          onClick={handleCancel}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4">Create Event</Typography>
      </Box>

      {formError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
          {formError}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <EventForm
          open={true}
          mode="create"
          managers={managers}
          staffMembers={staff}
          eventTypes={eventTypes}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={eventsLoading}
          error={formError}
        />
      </Paper>
    </Box>
  );
}

