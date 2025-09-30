import { useState, useMemo, useCallback, useEffect } from "react";
/**
 * DocumentsPage
 *
 * Purpose
 * - Display a searchable, filterable list of documents (memos, notes, reports)
 * - Allow creation of new documents that can be associated with managers or events
 * - Support document management and organization
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
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import { Manager } from "../../types/domain";
import { useManagers } from "../../lib/hooks/useManagers";
import { useDocuments } from "../../lib/hooks/useDocuments";
import { useEvents } from "../../lib/hooks/useEvents";
import { useDocumentTypes } from "../../lib/hooks/useDocumentTypes";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import DocumentForm from "../../components/forms/DocumentForm";
import "./DocumentsPage.css";

export default function DocumentsPage() {
  const [searchParams] = useSearchParams();
  
  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [managerFilter, setManagerFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formError] = useState<string | null>(null);

  // Fetch managers for dropdown and lookup
  const { 
    managers, 
    loading: managersLoading, 
    error: managersError 
  } = useManagers({
    autoFetch: true
  });

  // Fetch documents using the new hook
  const { 
    documents, 
    pagination: documentsPagination,
    loading: documentsLoading, 
    error: documentsError,
    createDocument: createDocumentApi,
    deleteDocument: deleteDocumentApi
  } = useDocuments({
    managerId: managerFilter || undefined,
    q: searchTerm || undefined,
    page: page + 1, // API uses 1-based pagination
    pageSize: rowsPerPage,
    autoFetch: true
  });

  // Fetch events for the form
  const { events } = useEvents({ autoFetch: true });

  // Fetch document types for dropdown
  const {
    documentTypes,
    loading: documentTypesLoading,
    error: documentTypesError
  } = useDocumentTypes();

  // Build a manager id -> manager object map for O(1) lookups
  const managerLookup = useMemo(() => {
    const lookup: Record<string, Manager> = {};
    managers.forEach(manager => {
      lookup[manager.id] = manager;
    });
    return lookup;
  }, [managers]);

  // Client-side filtering for search and filters
  const filteredDocuments = useMemo(() => {
    let filtered = documents;
    
    // Apply document type filter
    if (typeFilter) {
      filtered = filtered.filter(doc => doc.documentTypeId === typeFilter);
    }
    
    // Apply manager filter
    if (managerFilter) {
      filtered = filtered.filter(doc => doc.managerId === managerFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(doc => {
        const manager = managerLookup[doc.managerId];
        return (
          doc.title.toLowerCase().includes(term) ||
          doc.filename.toLowerCase().includes(term) ||
          (manager && (
            manager.firstName.toLowerCase().includes(term) ||
            manager.lastName.toLowerCase().includes(term) ||
            manager.company.toLowerCase().includes(term)
          ))
        );
      });
    }
    
    return filtered;
  }, [documents, searchTerm, typeFilter, managerFilter, managerLookup]);

  // Loading and error states
  const isLoading = managersLoading || documentsLoading || documentTypesLoading;
  const hasError = managersError || documentsError || documentTypesError;

  const handleViewDocument = useCallback((documentId: string) => {
    // For now, just log - in real implementation, this would open the document
    console.log('View document:', documentId);
  }, []);

  const handleDownloadDocument = useCallback((documentId: string) => {
    // For now, just log - in real implementation, this would download the document
    console.log('Download document:', documentId);
  }, []);

  const handleEditDocument = useCallback((documentId: string) => {
    // For now, just log - in real implementation, this would open edit dialog
    console.log('Edit document:', documentId);
  }, []);

  const handleDeleteDocument = useCallback(async (documentId: string) => {
    try {
      await deleteDocumentApi(documentId);
      // The hook will automatically refresh the documents list
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  }, [deleteDocumentApi]);

  const getTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'Memo': return 'primary';
      case 'Note': return 'secondary';
      case 'Report': return 'success';
      case 'Document': return 'warning';
      default: return 'default';
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setTypeFilter("");
    setManagerFilter("");
    setPage(0);
  }, []);

  const handleCreateDialogOpen = useCallback(() => {
    setCreateDialogOpen(true);
  }, []);

  const handleCreateDialogClose = useCallback(() => {
    setCreateDialogOpen(false);
  }, []);

  const handleCreateSubmit = useCallback(async (formData: {
    title: string;
    managerId: string;
    eventId?: string;
    filename: string;
    contentType: string;
    size: number;
  }) => {
    try {
      await createDocumentApi({
        managerId: formData.managerId,
        eventId: formData.eventId,
        filename: formData.filename,
        contentType: formData.contentType,
        size: formData.size,
        title: formData.title
      });
      setCreateDialogOpen(false);
      // The hook will automatically refresh the documents list
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  }, [createDocumentApi]);

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
      <Box className="documents-page">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Documents</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateDialogOpen}
          >
            Create Document
          </Button>
        </Box>
        <LoadingSpinner message="Loading documents..." fullHeight />
      </Box>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <Box className="documents-page">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Documents</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateDialogOpen}
          >
            Create Document
          </Button>
        </Box>
        <ErrorAlert
          title="Failed to load documents"
          message={managersError || documentsError || documentTypesError || 'An unexpected error occurred'}
        />
      </Box>
    );
  }

  return (
    <Box className="documents-page">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Documents
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
        >
          Create Document
        </Button>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search documents..."
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
            <InputLabel>Document Type</InputLabel>
            <Select
              value={typeFilter}
              label="Document Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              {documentTypes.map((docType) => (
                <MenuItem key={docType.id} value={docType.id}>
                  {docType.name}
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

      {/* Documents Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Manager</TableCell>
                <TableCell>File Size</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      No documents found. Create your first document to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((document) => {
                  const manager = managerLookup[document.managerId];
                  return (
                    <TableRow key={document.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {document.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {document.filename}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={document.contentType} 
                          color={getTypeColor(document.contentType) as any}
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
                      <TableCell>{formatFileSize(document.size)}</TableCell>
                      <TableCell>{formatDate(document.createdAt)}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton 
                            size="small"
                            onClick={() => handleViewDocument(document.id)}
                            title="View"
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={() => handleDownloadDocument(document.id)}
                            title="Download"
                          >
                            <DownloadIcon />
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={() => handleEditDocument(document.id)}
                            title="Edit"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={() => handleDeleteDocument(document.id)}
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
          count={documentsPagination.total}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Document Form */}
      <DocumentForm
        open={createDialogOpen}
        mode="create"
        managers={managers}
        events={events}
        onSubmit={handleCreateSubmit}
        onCancel={handleCreateDialogClose}
        loading={isLoading}
        error={formError}
      />
    </Box>
  );
}
