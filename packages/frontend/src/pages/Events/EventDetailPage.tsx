import { useState, useMemo, useCallback } from "react";
/**
 * EventDetailPage
 *
 * Purpose
 * - Display detailed information about a specific event
 * - Show event details, related documents, and notes
 * - Allow editing and deleting events
 *
 * Concepts
 * - Local state manages tab selection and dialogs
 * - Custom hooks handle data fetching and state management
 * - Proper loading states and error handling
 * - Follows the same pattern as ManagerDetailPage
 */
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link
} from "@mui/material";
import { 
  ArrowBack as BackIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Comment as CommentIcon,
  Group as GroupIcon
} from "@mui/icons-material";
import { useEvents } from "../../lib/hooks/useEvents";
import { useManagers } from "../../lib/hooks/useManagers";
import { useReferenceData } from "../../lib/hooks/useReferenceData";
import EventForm from "../../components/forms/EventForm";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import "./EventDetailPage.css";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch event data
  const { 
    events,
    loading: eventsLoading, 
    error: eventsError,
    updateEvent: updateEventApi,
    deleteEvent: deleteEventApi,
    refetch: refetchEvents
  } = useEvents({ autoFetch: true });

  // Fetch managers for lookup and form
  const { 
    managers, 
    loading: managersLoading 
  } = useManagers({ autoFetch: true });

  // Fetch reference data
  const { 
    eventTypes,
    staff,
    loading: referenceLoading 
  } = useReferenceData();

  // Find the specific event
  const event = useMemo(() => {
    return events.find(e => e.id === id);
  }, [events, id]);

  // Find the manager for this event
  const manager = useMemo(() => {
    if (!event) return undefined;
    return managers.find(m => m.id === event.managerId);
  }, [managers, event]);

  // Loading and error states
  const isLoading = eventsLoading || managersLoading || referenceLoading;
  const hasError = eventsError;

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const formatTime = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Edit event functionality
  const handleEditDialogOpen = useCallback(() => {
    setEditDialogOpen(true);
    setFormError(null);
  }, []);

  const handleEditDialogClose = useCallback(() => {
    setEditDialogOpen(false);
    setFormError(null);
  }, []);

  const handleEditSubmit = useCallback(async (formData: {
    type: string;
    managerId: string;
    date: string;
    staffAttending: string[];
    comments: string;
  }) => {
    if (!event) return;
    
    try {
      await updateEventApi(event.id, formData);
      setEditDialogOpen(false);
      setFormError(null);
      // Refetch to get latest data
      await refetchEvents();
    } catch (error: any) {
      console.error('Failed to update event:', error);
      setFormError(error.message || 'Failed to update event');
    }
  }, [event, updateEventApi, refetchEvents]);

  // Delete event functionality
  const handleDeleteDialogOpen = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleDeleteEvent = useCallback(async () => {
    if (!event) return;
    
    try {
      await deleteEventApi(event.id);
      setDeleteDialogOpen(false);
      // Navigate back to events list after deletion
      navigate('/events');
    } catch (error: any) {
      console.error('Failed to delete event:', error);
      setFormError(error.message || 'Failed to delete event');
      setDeleteDialogOpen(false);
    }
  }, [event, deleteEventApi, navigate]);

  const handleViewManager = useCallback(() => {
    if (event) {
      navigate(`/managers/${event.managerId}`);
    }
  }, [event, navigate]);

  const getTypeColor = useCallback((type: string) => {
    if (type.includes('Q-Meeting')) return 'primary';
    if (type.includes('DD')) return 'secondary';
    if (type.includes('Email') || type.includes('Letter')) return 'success';
    if (type.includes('Other')) return 'warning';
    return 'default';
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <Box className="event-detail-page">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<BackIcon />}
            onClick={() => navigate('/events')}
            sx={{ mr: 2 }}
          >
            Back to Events
          </Button>
        </Box>
        <LoadingSpinner message="Loading event details..." fullHeight />
      </Box>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <Box className="event-detail-page">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<BackIcon />}
            onClick={() => navigate('/events')}
            sx={{ mr: 2 }}
          >
            Back to Events
          </Button>
        </Box>
        <ErrorAlert
          title="Failed to load event details"
          message={eventsError || 'An unexpected error occurred'}
          onRetry={refetchEvents}
        />
      </Box>
    );
  }

  // Show not found state
  if (!event) {
    return (
      <Box className="event-detail-page">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            startIcon={<BackIcon />}
            onClick={() => navigate('/events')}
            sx={{ mr: 2 }}
          >
            Back to Events
          </Button>
        </Box>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" color="error">
            Event not found
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            The event you're looking for doesn't exist or has been deleted.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box className="event-detail-page">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            startIcon={<BackIcon />}
            onClick={() => navigate('/events')}
            sx={{ mr: 2 }}
          >
            Back to Events
          </Button>
          <Typography variant="h4">Event Details</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditDialogOpen}
          >
            Edit Event
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteDialogOpen}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {formError && (
        <ErrorAlert 
          title="Action Failed" 
          message={formError}
        />
      )}

      {/* Event Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
        <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Event Information</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Event Type
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip 
                    label={event.type} 
                    color={getTypeColor(event.type) as any}
                    size="medium"
                  />
                </Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Date & Time
                </Typography>
                <Typography variant="body1">
                  {formatDate(event.date)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatTime(event.date)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Manager</Typography>
              </Box>
              {manager ? (
                <Box>
                  <Link
                    component="button"
                    variant="h6"
                    onClick={handleViewManager}
                    sx={{
                      textDecoration: 'none',
                      color: 'primary.main',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    {manager.firstName} {manager.lastName}
                  </Link>
                  <Typography color="text.secondary">
                    {manager.company}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {manager.email}
                  </Typography>
                </Box>
              ) : (
                <Typography color="text.secondary">Manager not found</Typography>
              )}
            </CardContent>
          </Card>
        <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Staff Attending</Typography>
              </Box>
              {event.staffAttending.length > 0 ? (
                <Box>
                  {event.staffAttending.map((staff, index) => (
                    <Chip 
                      key={index}
                      label={staff} 
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No staff recorded</Typography>
              )}
            </CardContent>
          </Card>
        <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CommentIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Comments</Typography>
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {event.comments || 'No comments'}
              </Typography>
            </CardContent>
          </Card>
      </Box>

      {/* Tabs */}
      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Documents" />
            <Tab label="Notes" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Related Documents
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Documents feature coming soon
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Meeting Notes
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Notes feature coming soon
            </Typography>
          </Box>
        </TabPanel>
      </Paper>

      {/* Edit Event Dialog */}
      <EventForm
        open={editDialogOpen}
        mode="edit"
        event={event}
        managers={managers}
        staffMembers={staff}
        eventTypes={eventTypes}
        onSubmit={handleEditSubmit}
        onCancel={handleEditDialogClose}
        loading={eventsLoading}
        error={formError}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this event?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This action cannot be undone. All associated documents and notes will also be deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteEvent} 
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

