import { useState, useMemo, useCallback } from "react";
/**
 * ManagerDetailPage
 *
 * Purpose
 * - Display detailed information about a specific manager using API client
 * - Show manager events, notes, performance, and documents in tabs
 *
 * Concepts
 * - Local state manages tab selection
 * - Custom hooks handle data fetching and state management
 * - Proper loading states and error handling
 * - Decoupled from data source (easy to switch to real API)
 */
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from "@mui/material";
import { ArrowBack as BackIcon, Edit as EditIcon, Warning as WarningIcon, CheckCircle as CheckIcon } from "@mui/icons-material";
import { Manager, MeetingNote, ProbationChecklistItem } from "../../types/domain";
import { useManagers } from "../../lib/hooks/useManagers";
import { useEvents } from "../../lib/hooks/useEvents";
import { useProbation } from "../../lib/hooks/useProbation";
import ManagerForm from "../../components/forms/ManagerForm";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import "./ManagerDetailPage.css";

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
      id={`manager-tabpanel-${index}`}
      aria-labelledby={`manager-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ManagerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [probationDialogOpen, setProbationDialogOpen] = useState(false);
  const [probationForm, setProbationForm] = useState({
    reason: '',
    startDate: new Date().toISOString().split('T')[0],
    checklist: [] as ProbationChecklistItem[]
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch manager data
  const { 
    managers, 
    loading: managersLoading, 
    error: managersError,
    updateManager: updateManagerApi
  } = useManagers({ autoFetch: true });

  // Fetch events for this manager
  const { 
    events, 
    loading: eventsLoading, 
    error: eventsError 
  } = useEvents({
    managerId: id,
    autoFetch: !!id
  });

  // Probation management hook
  const { 
    loading: probationLoading,
    error: probationError,
    createProbation: createProbationApi,
    removeFromProbation: removeFromProbationApi
  } = useProbation();

  // Find the specific manager
  const manager: Manager | undefined = useMemo(() => {
    return managers.find(m => m.id === id);
  }, [managers, id]);

  // Mock notes data (since we don't have a notes API yet)
  const notes: MeetingNote[] = useMemo(() => {
    // For now, return empty array since we don't have notes API
    // This will be replaced when notes API is implemented
    return [];
  }, []);

  // Loading and error states
  const isLoading = managersLoading || eventsLoading || probationLoading;
  const hasError = managersError || eventsError || probationError;

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Probation': return 'warning';
      case 'Terminated': return 'error';
      default: return 'default';
    }
  }, []);

  // Probation management functions
  const handleProbationDialogOpen = useCallback(() => {
    setProbationForm({
      reason: '',
      startDate: new Date().toISOString().split('T')[0],
      checklist: [
        { id: '1', description: 'Review performance metrics', completed: false },
        { id: '2', description: 'Schedule follow-up meeting', completed: false },
        { id: '3', description: 'Document concerns', completed: false },
        { id: '4', description: 'Notify compliance team', completed: false },
        { id: '5', description: 'Update risk assessment', completed: false }
      ]
    });
    setProbationDialogOpen(true);
  }, []);

  const handleProbationDialogClose = useCallback(() => {
    setProbationDialogOpen(false);
  }, []);

  const handleProbationSubmit = useCallback(async () => {
    if (!manager) return;
    
    try {
      await createProbationApi(manager.id, {
        reason: probationForm.reason,
        startDate: probationForm.startDate,
        checklist: probationForm.checklist
      });
      setProbationDialogOpen(false);
      // TODO: Refresh manager data to show updated status
    } catch (error) {
      console.error('Failed to create probation record:', error);
    }
  }, [probationForm, manager, createProbationApi]);

  const handleChecklistItemToggle = useCallback((itemId: string) => {
    setProbationForm(prev => ({
      ...prev,
      checklist: prev.checklist.map(item => 
        item.id === itemId 
          ? { ...item, completed: !item.completed, completedAt: !item.completed ? new Date().toISOString() : undefined }
          : item
      )
    }));
  }, []);

  // Edit manager functionality
  const handleEditManager = useCallback(async (managerData: {
    firstName: string;
    lastName: string;
    company: string;
    phone: string;
    email: string;
    status: 'Active' | 'Terminated' | 'Probation';
    marketValue: number;
    asOfDate: string;
  }) => {
    if (!manager) return;
    
    try {
      setFormError(null);
      await updateManagerApi(manager.id, managerData);
      setEditDialogOpen(false);
      // The hook will automatically refresh the managers list
    } catch (error: any) {
      setFormError(error.message || 'Failed to update manager');
    }
  }, [manager, updateManagerApi]);

  const handleEditDialogOpen = useCallback(() => {
    setFormError(null);
    setEditDialogOpen(true);
  }, []);

  const handleEditDialogClose = useCallback(() => {
    setEditDialogOpen(false);
    setFormError(null);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <Box className="manager-detail-page">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/managers')} sx={{ mr: 1 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Loading Manager Details...
          </Typography>
        </Box>
        <LoadingSpinner message="Loading manager details..." fullHeight />
      </Box>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <Box className="manager-detail-page">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/managers')} sx={{ mr: 1 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Manager Details
          </Typography>
        </Box>
        <ErrorAlert
          title="Failed to load manager details"
          message={managersError || eventsError || 'An unexpected error occurred'}
        />
      </Box>
    );
  }

  // Show not found state
  if (!manager) {
    return (
      <Box className="manager-detail-page">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/managers')} sx={{ mr: 1 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Manager Details
          </Typography>
        </Box>
        <ErrorAlert
          title="Manager not found"
          message={`No manager found with ID: ${id}`}
          severity="warning"
        />
      </Box>
    );
  }

  return (
    <Box className="manager-detail-page">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/managers')} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" component="h1">
            {manager.firstName} {manager.lastName}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {manager.company}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            onClick={handleEditDialogOpen}
          >
            Edit Manager
          </Button>
          {manager.status === 'Active' && (
            <Button 
              variant="outlined" 
              color="warning" 
              startIcon={<WarningIcon />}
              onClick={handleProbationDialogOpen}
            >
              Place on Probation
            </Button>
          )}
          {manager.status === 'Probation' && (
            <Button 
              variant="outlined" 
              color="success" 
              startIcon={<CheckIcon />}
              onClick={async () => {
                try {
                  await removeFromProbationApi(manager.id, 'Manager performance improved');
                  // TODO: Refresh manager data to show updated status
                } catch (error) {
                  console.error('Failed to remove from probation:', error);
                }
              }}
            >
              Remove from Probation
            </Button>
          )}
        </Box>
      </Box>

      {/* Summary Cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
        gap: 2,
        mb: 3
      }}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Status
            </Typography>
            <Chip
              label={manager.status}
              color={getStatusColor(manager.status) as any}
              size="medium"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Market Value
            </Typography>
            <Typography variant="h6">
              {manager.status === 'Terminated' ? 'N/A' : formatCurrency(manager.marketValue)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              As of Date
            </Typography>
            <Typography variant="h6">
              {formatDate(manager.asOfDate)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Events
            </Typography>
            <Typography variant="h6">
              {events.length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Contact Information */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Contact Information
        </Typography>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2
        }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">{manager.email}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Phone
            </Typography>
            <Typography variant="body1">{manager.phone}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Events" />
            <Tab label="Meeting Notes" />
            <Tab label="Performance" />
            <Tab label="Documents" />
            {manager.status === 'Probation' && <Tab label="Probation" />}
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Recent Events
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Staff Attending</TableCell>
                  <TableCell>Comments</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{formatDate(event.date)}</TableCell>
                    <TableCell>
                      <Chip label={event.type} size="small" />
                    </TableCell>
                    <TableCell>
                      {event.staffAttending.join(', ')}
                    </TableCell>
                    <TableCell>{event.comments}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Meeting Notes
          </Typography>
          {notes.map((note) => (
            <Paper key={note.id} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {note.title} - {formatDate(note.date)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created by: {note.createdBy}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body1">
                {note.content}
              </Typography>
            </Paper>
          ))}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Performance Data
          </Typography>
          <Box sx={{ height: 300, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">
              Performance chart placeholder
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Documents
          </Typography>
          <Box sx={{ height: 200, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="text.secondary">
              Document library placeholder
            </Typography>
          </Box>
        </TabPanel>

        {manager.status === 'Probation' && (
          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" gutterBottom>
              Probation Management
            </Typography>
            {manager.probationDetails ? (
              <Box>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Probation Details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Start Date:</strong> {formatDate(manager.probationDetails.startDate)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Reason:</strong> {manager.probationDetails.reason}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Created by:</strong> {manager.probationDetails.createdBy}
                  </Typography>
                </Paper>
                
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Probation Checklist
                  </Typography>
                  <List>
                    {manager.probationDetails.checklist.map((item) => (
                      <ListItem key={item.id}>
                        <ListItemText
                          primary={item.description}
                          secondary={item.completed ? `Completed by ${item.completedBy} on ${formatDate(item.completedAt!)}` : 'Pending'}
                        />
                        <ListItemSecondaryAction>
                          <Checkbox
                            checked={item.completed}
                            onChange={() => console.log('Toggle checklist item')}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Box>
            ) : (
              <Box sx={{ height: 200, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                  No probation details available
                </Typography>
              </Box>
            )}
          </TabPanel>
        )}
      </Paper>

      {/* Probation Dialog */}
      <Dialog open={probationDialogOpen} onClose={handleProbationDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Place Manager on Probation</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Reason for Probation"
              multiline
              rows={3}
              value={probationForm.reason}
              onChange={(e) => setProbationForm(prev => ({ ...prev, reason: e.target.value }))}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={probationForm.startDate}
              onChange={(e) => setProbationForm(prev => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle1" gutterBottom>
              Probation Checklist
            </Typography>
            <List>
              {probationForm.checklist.map((item) => (
                <ListItem key={item.id}>
                  <ListItemText primary={item.description} />
                  <ListItemSecondaryAction>
                    <Checkbox
                      checked={item.completed}
                      onChange={() => handleChecklistItemToggle(item.id)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleProbationDialogClose}>Cancel</Button>
          <Button 
            onClick={handleProbationSubmit} 
            variant="contained" 
            color="warning"
            disabled={!probationForm.reason.trim()}
          >
            Place on Probation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Manager Dialog */}
      <ManagerForm
        open={editDialogOpen}
        mode="edit"
        manager={manager}
        onSubmit={handleEditManager}
        onCancel={handleEditDialogClose}
        loading={isLoading}
        error={formError}
      />
    </Box>
  );
}
