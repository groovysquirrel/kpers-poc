import { useState, useMemo, useCallback } from "react";
/**
 * EventsPage
 *
 * Purpose
 * - Display a filterable, searchable, paginated list of events using API client
 * - Allow navigation to create a new event and to a manager's detail page
 * - Support editing events with EventForm component
 *
 * Concepts
 * - Local state manages ephemeral UI (search text, filters, pagination)
 * - Custom hooks handle data fetching and state management
 * - API-level filtering and pagination for better performance
 * - Proper loading states and error handling
 * - EventForm integration for create/edit operations
 */
import { 
  Box, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TextField,
  Chip,
  IconButton,
  InputAdornment,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from "@mui/material";
import { 
  Search as SearchIcon, 
  Visibility as ViewIcon, 
  Add as AddIcon, 
  AttachFile as AttachIcon, 
  Description as DocumentIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Manager, EventRecord } from "../../types/domain";
import { useEvents } from "../../lib/hooks/useEvents";
import { useManagers } from "../../lib/hooks/useManagers";
import { useReferenceData } from "../../lib/hooks/useReferenceData";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import EventForm from "../../components/forms/EventForm";
import "./EventsPage.css";

export default function EventsPage() {
  const navigate = useNavigate();
  
  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [managerFilter, setManagerFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // API state - fetch events with current filters
  const { 
    events, 
    pagination, 
    loading: eventsLoading, 
    error: eventsError, 
    refetch: refetchEvents,
    updateEvent 
  } = useEvents({
    type: typeFilter || undefined,
    managerId: managerFilter || undefined,
    page: page + 1, // API uses 1-based pagination
    pageSize: rowsPerPage,
    autoFetch: true
  });

  // Fetch managers for dropdown and lookup
  const { 
    managers, 
    loading: managersLoading, 
    error: managersError 
  } = useManagers({
    autoFetch: true
  });

  // Fetch reference data
  const { 
    eventTypes,
    staff,
    loading: referenceLoading, 
    error: referenceError 
  } = useReferenceData();

  // Build a manager id -> manager object map for O(1) lookups
  const managerLookup = useMemo(() => {
    const lookup: Record<string, Manager> = {};
    managers.forEach(manager => {
      lookup[manager.id] = manager;
    });
    return lookup;
  }, [managers]);

  // Client-side search filtering (since API doesn't support full-text search yet)
  const filteredEvents = useMemo(() => {
    if (!searchTerm) return events;
    
    const term = searchTerm.toLowerCase();
    return events.filter(event => {
      const manager = managerLookup[event.managerId];
      return (
        event.comments.toLowerCase().includes(term) ||
        event.staffAttending.some(staff => staff.toLowerCase().includes(term)) ||
        (manager && (
          manager.firstName.toLowerCase().includes(term) ||
          manager.lastName.toLowerCase().includes(term) ||
          manager.company.toLowerCase().includes(term)
        ))
      );
    });
  }, [events, searchTerm, managerLookup]);

  // Loading and error states
  const isLoading = eventsLoading || managersLoading || referenceLoading;
  const hasError = eventsError || managersError || referenceError;

  const handleViewManager = useCallback((managerId: string) => {
    // Navigate to manager detail page
    navigate(`/managers/${managerId}`);
  }, [navigate]);

  const handleEditEvent = useCallback((event: EventRecord) => {
    setEditingEvent(event);
    setFormError(null);
    setEditDialogOpen(true);
  }, []);

  const handleEditDialogClose = useCallback(() => {
    setEditDialogOpen(false);
    setEditingEvent(null);
    setFormError(null);
  }, []);

  const handleEditSubmit = useCallback(async (formData: {
    type: string;
    managerId: string;
    date: string;
    staffAttending: string[];
    comments: string;
  }) => {
    if (!editingEvent) return;
    
    try {
      await updateEvent(editingEvent.id, formData);
      setEditDialogOpen(false);
      setEditingEvent(null);
      setFormError(null);
      // Events list will automatically refresh via the hook
    } catch (error: any) {
      console.error('Failed to update event:', error);
      setFormError(error.message || 'Failed to update event');
    }
  }, [editingEvent, updateEvent]);

  const handleViewEventDocuments = useCallback((eventId: string) => {
    // Navigate to documents page filtered by event
    navigate(`/documents?eventId=${eventId}`);
  }, [navigate]);

  const handleAddDocumentToEvent = useCallback((eventId: string) => {
    // Navigate to documents page with pre-filled event ID
    navigate(`/documents?create=true&eventId=${eventId}`);
  }, [navigate]);

  const getTypeColor = useCallback((type: string) => {
    if (type.includes('Q-Meeting')) return 'primary';
    if (type.includes('DD')) return 'secondary';
    if (type.includes('Email') || type.includes('Letter')) return 'success';
    if (type.includes('Other')) return 'warning';
    return 'default';
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setTypeFilter("");
    setManagerFilter("");
    setPage(0);
  }, []);

  const handlePageChange = useCallback((_: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <Box className="events-page">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Events</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/events/new')}
          >
            Create Event
          </Button>
        </Box>
        <LoadingSpinner message="Loading events..." fullHeight />
      </Box>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <Box className="events-page">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Events</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/events/new')}
          >
            Create Event
          </Button>
        </Box>
        <ErrorAlert
          title="Failed to load events"
          message={eventsError || managersError || referenceError || 'An unexpected error occurred'}
          onRetry={refetchEvents}
        />
      </Box>
    );
  }

  return (
    <Box className="events-page">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Events
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/events/new')}
        >
          Create Event
        </Button>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Event Type</InputLabel>
            <Select
              value={typeFilter}
              label="Event Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              {eventTypes.map((eventType) => (
                <MenuItem key={eventType.id} value={eventType.name}>
                  {eventType.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Manager</InputLabel>
            <Select
              value={managerFilter}
              label="Manager"
              onChange={(e) => setManagerFilter(e.target.value)}
            >
              <MenuItem value="">All Managers</MenuItem>
              {managers.map((manager) => (
                <MenuItem key={manager.id} value={manager.id}>
                  {manager.firstName} {manager.lastName} ({manager.company})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button 
            variant="outlined" 
            onClick={clearFilters}
            disabled={!searchTerm && !typeFilter && !managerFilter}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Events Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>Staff Attending</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell align="center">Documents</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEvents.map((event) => {
                const manager = managerLookup[event.managerId];
                return (
                  <TableRow 
                    key={event.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleViewManager(event.managerId)}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(event.date)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={event.type} 
                        color={getTypeColor(event.type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {manager ? (
                        <Box>
                          <Typography variant="subtitle2">
                            {manager.firstName} {manager.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {manager.company}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography color="text.secondary">Unknown Manager</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {event.staffAttending.join(', ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {event.comments}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewEventDocuments(event.id);
                          }}
                          title="View Documents"
                        >
                          <DocumentIcon />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddDocumentToEvent(event.id);
                          }}
                          title="Add Document"
                          color="primary"
                        >
                          <AttachIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event);
                          }}
                          title="Edit Event"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewManager(event.managerId);
                          }}
                          title="View Manager"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={pagination.total}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Event Form Dialog */}
      <EventForm
        open={editDialogOpen}
        mode="edit"
        event={editingEvent || undefined}
        managers={managers}
        staffMembers={staff}
        eventTypes={eventTypes}
        onSubmit={handleEditSubmit}
        onCancel={handleEditDialogClose}
        loading={eventsLoading}
        error={formError}
      />
    </Box>
  );
}
