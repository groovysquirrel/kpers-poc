import { useState, useMemo, useCallback } from "react";
/**
 * ManagersPage
 *
 * Purpose
 * - Display a searchable, paginated list of managers using API client
 * - Allow navigation to individual manager detail pages
 *
 * Concepts
 * - Local state manages ephemeral UI (search text, pagination)
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
import { Search as SearchIcon, Visibility as ViewIcon, Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
// Manager type is used implicitly through the useManagers hook
import { useManagers } from "../../lib/hooks/useManagers";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import ManagerForm from "../../components/forms/ManagerForm";
import "./ManagersPage.css";

export default function ManagersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // API state - fetch managers with current search term
  const { 
    managers, 
    pagination, 
    loading, 
    error, 
    refetch,
    createManager: createManagerApi
  } = useManagers({
    q: searchTerm || undefined,
    page: page + 1, // API uses 1-based pagination
    pageSize: rowsPerPage,
    autoFetch: true
  });

  // Client-side filtering for search and status (since API filtering might be limited)
  const filteredManagers = useMemo(() => {
    let filtered = managers;
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(manager => manager.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(manager => {
        const fullName = `${manager.firstName} ${manager.lastName}`.toLowerCase();
        return (
          manager.firstName.toLowerCase().includes(term) ||
          manager.lastName.toLowerCase().includes(term) ||
          fullName.includes(term) ||
          manager.company.toLowerCase().includes(term) ||
          manager.email.toLowerCase().includes(term)
        );
      });
    }
    
    return filtered;
  }, [managers, searchTerm, statusFilter]);

  const handleViewManager = useCallback((managerId: string) => {
    navigate(`/managers/${managerId}`);
  }, [navigate]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Probation': return 'warning';
      case 'Terminated': return 'error';
      default: return 'default';
    }
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

  const handlePageChange = useCallback((_: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("");
    setPage(0);
  }, []);

  const handleCreateManager = useCallback(async (managerData: {
    firstName: string;
    lastName: string;
    company: string;
    phone: string;
    email: string;
    status: 'Active' | 'Terminated' | 'Probation';
    marketValue: number;
    asOfDate: string;
  }) => {
    try {
      setFormError(null);
      await createManagerApi(managerData);
      setCreateDialogOpen(false);
      // The hook will automatically refresh the managers list
    } catch (error: any) {
      setFormError(error.message || 'Failed to create manager');
    }
  }, [createManagerApi]);

  const handleCreateDialogOpen = useCallback(() => {
    setFormError(null);
    setCreateDialogOpen(true);
  }, []);

  const handleCreateDialogClose = useCallback(() => {
    setCreateDialogOpen(false);
    setFormError(null);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <Box className="managers-page">
        <Typography variant="h4" gutterBottom>
          Investment Managers
        </Typography>
        <LoadingSpinner message="Loading managers..." fullHeight />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box className="managers-page">
        <Typography variant="h4" gutterBottom>
          Investment Managers
        </Typography>
        <ErrorAlert
          title="Failed to load managers"
          message={error}
          onRetry={refetch}
        />
      </Box>
    );
  }

  return (
    <Box className="managers-page">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Investment Managers
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
        >
          Create Manager
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search managers by name, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Probation">Probation</MenuItem>
              <MenuItem value="Terminated">Terminated</MenuItem>
            </Select>
          </FormControl>

          <Button 
            variant="outlined" 
            onClick={clearFilters}
            disabled={!searchTerm && !statusFilter}
          >
            Clear Filters
          </Button>
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Manager Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Market Value</TableCell>
                <TableCell>As of Date</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredManagers.map((manager) => (
                <TableRow 
                  key={manager.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleViewManager(manager.id)}
                >
                  <TableCell>
                    <Typography variant="subtitle2">
                      {manager.firstName} {manager.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell>{manager.company}</TableCell>
                  <TableCell>
                    <Chip 
                      label={manager.status} 
                      color={getStatusColor(manager.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {manager.status === 'Terminated' ? 'N/A' : formatCurrency(manager.marketValue)}
                  </TableCell>
                  <TableCell>{formatDate(manager.asOfDate)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {manager.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {manager.phone}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewManager(manager.id);
                      }}
                    >
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
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

      {/* Create Manager Dialog */}
      <ManagerForm
        open={createDialogOpen}
        mode="create"
        onSubmit={handleCreateManager}
        onCancel={handleCreateDialogClose}
        loading={loading}
        error={formError}
      />
    </Box>
  );
}
