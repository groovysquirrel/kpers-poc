import { useState, useMemo, useCallback, useEffect } from "react";
/**
 * NotesPage
 *
 * Purpose
 * - Display a searchable, filterable list of notes
 * - Allow creation of new notes that can be associated with managers, events, staff, or documents
 * - Support note management and organization
 *
 * Concepts
 * - Local state manages ephemeral UI (search text, filters, pagination)
 * - Custom hooks handle data fetching and state management
 * - API-level filtering and pagination for better performance
 * - Proper loading states and error handling
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
  Edit as EditIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import { Manager, StaffMember, Note } from "../../types/domain";
import { useManagers } from "../../lib/hooks/useManagers";
import { useStaff } from "../../lib/hooks/useStaff";
import { useNoteTypes } from "../../lib/hooks/useNoteTypes";
import { useNotes } from "../../lib/hooks/useNotes";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import NoteForm from "../../components/forms/NoteForm";
import NoteView from "../../components/NoteView";
import "./NotesPage.css";

export default function NotesPage() {
  const [searchParams] = useSearchParams();

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [managerFilter, setManagerFilter] = useState<string>("");
  const [staffFilter, setStaffFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [formError] = useState<string | null>(null);

  // Fetch managers for dropdown and lookup
  const {
    managers,
    loading: managersLoading,
    error: managersError
  } = useManagers({
    autoFetch: true
  });

  // Fetch staff for dropdown and lookup
  const {
    staff,
    loading: staffLoading,
    error: staffError
  } = useStaff({
    autoFetch: true
  });

  // Fetch note types for dropdown
  const {
    noteTypes,
    loading: noteTypesLoading,
    error: noteTypesError
  } = useNoteTypes();

  // Fetch notes using the new hook
  const {
    notes,
    pagination: notesPagination,
    loading: notesLoading,
    error: notesError,
    createNote: createNoteApi,
    updateNote,
    deleteNote: deleteNoteApi
  } = useNotes({
    type: typeFilter || undefined,
    managerId: managerFilter || undefined,
    staffId: staffFilter || undefined,
    q: searchTerm || undefined,
    page: page + 1, // API uses 1-based pagination
    pageSize: rowsPerPage,
    autoFetch: true
  });

  // Build a manager id -> manager object map for O(1) lookups
  const managerLookup = useMemo(() => {
    const lookup: Record<string, Manager> = {};
    managers.forEach(manager => {
      lookup[manager.id] = manager;
    });
    return lookup;
  }, [managers]);

  // Build a staff id -> staff object map for O(1) lookups
  const staffLookup = useMemo(() => {
    const lookup: Record<string, StaffMember> = {};
    staff.forEach(staffMember => {
      lookup[staffMember.id] = staffMember;
    });
    return lookup;
  }, [staff]);

  // Build a note type id -> note type object map for O(1) lookups
  const noteTypeLookup = useMemo(() => {
    const lookup: Record<string, any> = {};
    noteTypes.forEach(noteType => {
      lookup[noteType.id] = noteType;
    });
    return lookup;
  }, [noteTypes]);

  // Loading and error states
  const isLoading = managersLoading || staffLoading || noteTypesLoading || notesLoading;
  const hasError = managersError || staffError || noteTypesError || notesError;

  const handleViewNote = useCallback((noteId: string) => {
    const noteToView = notes.find(note => note.id === noteId);
    if (noteToView) {
      setViewingNote(noteToView);
      setViewDialogOpen(true);
    }
  }, [notes]);

  const handleEditNote = useCallback((noteId: string) => {
    const noteToEdit = notes.find(note => note.id === noteId);
    if (noteToEdit) {
      setEditingNote(noteToEdit);
      setEditDialogOpen(true);
    }
  }, [notes]);

  const handleDeleteNote = useCallback(async (noteId: string) => {
    try {
      await deleteNoteApi(noteId);
      // The hook will automatically refresh the notes list
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }, [deleteNoteApi]);

  const getTypeColor = useCallback((typeId: string) => {
    const noteType = noteTypeLookup[typeId];
    switch (noteType?.name) {
      case 'Manager Note': return 'primary';
      case 'Event Note': return 'secondary';
      case 'Staff Note': return 'success';
      case 'Document Note': return 'warning';
      case 'General Note': return 'info';
      default: return 'default';
    }
  }, [noteTypeLookup]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setTypeFilter("");
    setManagerFilter("");
    setStaffFilter("");
    setPage(0);
  }, []);

  const handleCreateDialogOpen = useCallback(() => {
    setCreateDialogOpen(true);
  }, []);

  const handleCreateDialogClose = useCallback(() => {
    setCreateDialogOpen(false);
  }, []);

  const handleEditDialogClose = useCallback(() => {
    setEditDialogOpen(false);
    setEditingNote(null);
  }, []);

  const handleViewDialogClose = useCallback(() => {
    setViewDialogOpen(false);
    setViewingNote(null);
  }, []);

  const handleCreateSubmit = useCallback(async (formData: {
    title: string;
    content: string;
    type: string;
    managerId?: string;
    eventId?: string;
    staffId?: string;
    documentId?: string;
    tags?: string[];
  }) => {
    try {
      await createNoteApi({
        title: formData.title,
        content: formData.content,
        type: formData.type,
        managerId: formData.managerId,
        eventId: formData.eventId,
        staffId: formData.staffId,
        documentId: formData.documentId,
        tags: formData.tags
      });
      setCreateDialogOpen(false);
      // The hook will automatically refresh the notes list
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  }, [createNoteApi]);

  const handleEditSubmit = useCallback(async (formData: {
    title: string;
    content: string;
    type: string;
    managerId?: string;
    eventId?: string;
    staffId?: string;
    documentId?: string;
    tags?: string[];
  }) => {
    if (!editingNote) return;

    try {
      await updateNote(editingNote.id, {
        id: editingNote.id,
        title: formData.title,
        content: formData.content,
        type: formData.type,
        managerId: formData.managerId,
        eventId: formData.eventId,
        staffId: formData.staffId,
        documentId: formData.documentId,
        tags: formData.tags
      });
      setEditDialogOpen(false);
      setEditingNote(null);
      // The hook will automatically refresh the notes list
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  }, [editingNote, updateNote]);

  const handlePageChange = useCallback((_: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  // Auto-open create dialog if URL parameter indicates it
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      handleCreateDialogOpen();
    }
  }, [searchParams, handleCreateDialogOpen]);

  // Show loading state
  if (isLoading) {
    return (
      <Box className="notes-page">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Notes</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateDialogOpen}
          >
            Create Note
          </Button>
        </Box>
        <LoadingSpinner message="Loading notes..." fullHeight />
      </Box>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <Box className="notes-page">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Notes</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateDialogOpen}
          >
            Create Note
          </Button>
        </Box>
        <ErrorAlert
          title="Failed to load notes"
          message={managersError || staffError || noteTypesError || notesError || 'An unexpected error occurred'}
        />
      </Box>
    );
  }

  return (
    <Box className="notes-page">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Notes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
        >
          Create Note
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search notes..."
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

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Note Type</InputLabel>
            <Select
              value={typeFilter}
              label="Note Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              {noteTypes.map((noteType) => (
                <MenuItem key={noteType.id} value={noteType.id}>
                  {noteType.name}
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

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Staff</InputLabel>
            <Select
              value={staffFilter}
              label="Staff"
              onChange={(e) => setStaffFilter(e.target.value)}
            >
              <MenuItem value="">All Staff</MenuItem>
              {staff.map((staffMember) => (
                <MenuItem key={staffMember.id} value={staffMember.id}>
                  {staffMember.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={clearFilters}
            disabled={!searchTerm && !typeFilter && !managerFilter && !staffFilter}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Notes Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>Staff</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      No notes found. Create your first note to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                notes.map((note) => {
                  const manager = note.managerId ? managerLookup[note.managerId] : null;
                  const staffMember = note.staffId ? staffLookup[note.staffId] : null;
                  const noteType = noteTypeLookup[note.type];

                  return (
                    <TableRow
                      key={note.id}
                      hover
                      onClick={() => handleViewNote(note.id)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2">
                          {note.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {note.content.substring(0, 100)}{note.content.length > 100 ? '...' : ''}
                        </Typography>
                        {note.tags && note.tags.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            {note.tags.slice(0, 3).map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ mr: 0.5, fontSize: '0.75rem' }}
                              />
                            ))}
                            {note.tags.length > 3 && (
                              <Typography variant="caption" color="text.secondary">
                                +{note.tags.length - 3} more
                              </Typography>
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={noteType?.name || 'Unknown'}
                          color={getTypeColor(note.type) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {manager ? (
                          <Typography variant="body2">
                            {manager.firstName} {manager.lastName}
                          </Typography>
                        ) : (
                          <Typography color="text.secondary">—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {staffMember ? (
                          <Typography variant="body2">
                            {staffMember.name}
                          </Typography>
                        ) : (
                          <Typography color="text.secondary">—</Typography>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(note.createdAt)}</TableCell>
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewNote(note.id)}
                            title="View"
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEditNote(note.id)}
                            title="Edit"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteNote(note.id)}
                            title="Delete"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={notesPagination.total}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Create Note Form */}
      <NoteForm
        open={createDialogOpen}
        mode="create"
        managers={managers}
        staff={staff}
        noteTypes={noteTypes}
        onSubmit={handleCreateSubmit}
        onCancel={handleCreateDialogClose}
        loading={isLoading}
        error={formError}
      />

      {/* Edit Note Form */}
      <NoteForm
        open={editDialogOpen}
        mode="edit"
        note={editingNote || undefined}
        managers={managers}
        staff={staff}
        noteTypes={noteTypes}
        onSubmit={handleEditSubmit}
        onCancel={handleEditDialogClose}
        loading={isLoading}
        error={formError}
      />

      {/* View Note Dialog */}
      <NoteView
        open={viewDialogOpen}
        note={viewingNote}
        managers={managers}
        staff={staff}
        noteTypes={noteTypes}
        onClose={handleViewDialogClose}
        onEdit={(note) => {
          handleViewDialogClose();
          handleEditNote(note.id);
        }}
      />
    </Box>
  );
}
