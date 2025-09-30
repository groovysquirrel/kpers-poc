import { useState, useMemo, useCallback } from "react";
/**
 * AdminPage
 *
 * Purpose
 * - Comprehensive user and staff management interface
 * - Create, edit, suspend, and manage user accounts
 * - Role-based permissions management
 * - Staff member administration
 *
 * Concepts
 * - Tabbed interface for different admin functions
 * - User management with role assignment
 * - Permission management system
 * - Staff member administration
 * - Audit trail and activity monitoring
 */
import { 
  Box, 
  Paper, 
  Typography, 
  Tabs,
  Tab,
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
  Button,
  Stack,
  Card,
  CardContent
} from "@mui/material";
import { 
  Search as SearchIcon, 
  Add as AddIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Group as GroupIcon,
  Settings as SettingsIcon
} from "@mui/icons-material";
import { StaffMember, User } from "../../types/domain";
import { useUsers } from "../../lib/hooks/useUsers";
import { useStaff } from "../../lib/hooks/useStaff";
import { usePermissions } from "../../lib/hooks/usePermissions";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import UserForm from "../../components/forms/UserForm";
import StaffForm from "../../components/forms/StaffForm";
import "./AdminPage.css";

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
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function AdminPage() {
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Users tab state
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("");
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(10);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Staff tab state
  const [staffSearchTerm, setStaffSearchTerm] = useState("");
  const [staffStatusFilter, setStaffStatusFilter] = useState<string>("");
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>("");
  const [staffPage, setStaffPage] = useState(0);
  const [staffRowsPerPage, setStaffRowsPerPage] = useState(10);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Fetch data
  const { 
    users, 
    loading: usersLoading, 
    error: usersError,
    createUser,
    updateUser,
    suspendUser,
    activateUser
  } = useUsers({ autoFetch: true });

  const { 
    staff, 
    loading: staffLoading, 
    error: staffError,
    createStaff,
    updateStaff,
    suspendStaff,
    activateStaff
  } = useStaff({ autoFetch: true });

  const {
    permissions,
    roles,
    loading: permissionsLoading,
    error: permissionsError
  } = usePermissions();

  // Filter users
  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    if (userStatusFilter) {
      filtered = filtered.filter(user => user.status === userStatusFilter);
    }
    
    if (userRoleFilter) {
      filtered = filtered.filter(user => user.role === userRoleFilter);
    }
    
    if (userSearchTerm.trim()) {
      const term = userSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(term) ||
        (user.firstName && user.firstName.toLowerCase().includes(term)) ||
        (user.lastName && user.lastName.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }, [users, userSearchTerm, userStatusFilter, userRoleFilter]);

  // Filter staff
  const filteredStaff = useMemo(() => {
    let filtered = staff;
    
    if (staffStatusFilter) {
      filtered = filtered.filter(member => member.status === staffStatusFilter);
    }
    
    if (staffRoleFilter) {
      filtered = filtered.filter(member => member.role === staffRoleFilter);
    }
    
    if (staffSearchTerm.trim()) {
      const term = staffSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(term) ||
        member.role.toLowerCase().includes(term) ||
        (member.email && member.email.toLowerCase().includes(term))
      );
    }
    
    return filtered;
  }, [staff, staffSearchTerm, staffStatusFilter, staffRoleFilter]);

  // Loading and error states
  const isLoading = usersLoading || staffLoading || permissionsLoading;
  const hasError = usersError || staffError || permissionsError;

  // Tab change handler
  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  // User management handlers
  const handleCreateUser = useCallback(() => {
    setEditingUser(null);
    setUserDialogOpen(true);
  }, []);

  const handleEditUser = useCallback((user: User) => {
    setEditingUser(user);
    setUserDialogOpen(true);
  }, []);

  const handleUserDialogClose = useCallback(() => {
    setUserDialogOpen(false);
    setEditingUser(null);
  }, []);

  const handleUserSubmit = useCallback(async (userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'Viewer' | 'Editor' | 'Administrator';
    status: 'Active' | 'Inactive' | 'Suspended';
    permissions: string[];
  }) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, userData);
      } else {
        await createUser(userData);
      }
      setUserDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  }, [editingUser, createUser, updateUser]);

  const handleSuspendUser = useCallback(async (userId: string) => {
    try {
      await suspendUser(userId);
    } catch (error) {
      console.error('Failed to suspend user:', error);
    }
  }, [suspendUser]);

  const handleActivateUser = useCallback(async (userId: string) => {
    try {
      await activateUser(userId);
    } catch (error) {
      console.error('Failed to activate user:', error);
    }
  }, [activateUser]);

  // Staff management handlers
  const handleCreateStaff = useCallback(() => {
    setEditingStaff(null);
    setStaffDialogOpen(true);
  }, []);

  const handleEditStaff = useCallback((member: StaffMember) => {
    setEditingStaff(member);
    setStaffDialogOpen(true);
  }, []);

  const handleStaffDialogClose = useCallback(() => {
    setStaffDialogOpen(false);
    setEditingStaff(null);
  }, []);

  const handleStaffSubmit = useCallback(async (staffData: {
    name: string;
    role: string;
    email: string;
    phone: string;
    department: string;
    status: 'Active' | 'Inactive' | 'Suspended';
  }) => {
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, staffData);
      } else {
        // Add default permissions for new staff members
        await createStaff({
          ...staffData,
          permissions: ['1', '3', '5'] // Default permissions: View Managers, View Events, View Documents
        });
      }
      setStaffDialogOpen(false);
      setEditingStaff(null);
    } catch (error) {
      console.error('Failed to save staff member:', error);
    }
  }, [editingStaff, createStaff, updateStaff]);

  const handleSuspendStaff = useCallback(async (staffId: string) => {
    try {
      await suspendStaff(staffId);
    } catch (error) {
      console.error('Failed to suspend staff member:', error);
    }
  }, [suspendStaff]);

  const handleActivateStaff = useCallback(async (staffId: string) => {
    try {
      await activateStaff(staffId);
    } catch (error) {
      console.error('Failed to activate staff member:', error);
    }
  }, [activateStaff]);

  // Utility functions
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'warning';
      case 'Suspended': return 'error';
      default: return 'default';
    }
  }, []);

  const getRoleColor = useCallback((role: string) => {
    switch (role) {
      case 'Administrator': return 'error';
      case 'Editor': return 'primary';
      case 'Viewer': return 'secondary';
      default: return 'default';
    }
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <Box className="admin-page">
        <Typography variant="h4" sx={{ mb: 3 }}>Administration</Typography>
        <LoadingSpinner message="Loading admin data..." fullHeight />
      </Box>
    );
  }

  // Show error state
  if (hasError) {
    return (
      <Box className="admin-page">
        <Typography variant="h4" sx={{ mb: 3 }}>Administration</Typography>
        <ErrorAlert
          title="Failed to load admin data"
          message={usersError || staffError || permissionsError || 'An unexpected error occurred'}
        />
      </Box>
    );
  }

  return (
    <Box className="admin-page">
      <Typography variant="h4" sx={{ mb: 3 }}>
        Administration
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h5">
                  {users.length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <GroupIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Staff Members
                </Typography>
                <Typography variant="h5">
                  {staff.length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SecurityIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Active Users
                </Typography>
                <Typography variant="h5">
                  {users.filter((u: User) => u.status === 'Active').length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SettingsIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Permissions
                </Typography>
                <Typography variant="h5">
                  {permissions.length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab icon={<PersonIcon />} label="Users" />
          <Tab icon={<GroupIcon />} label="Staff" />
          <Tab icon={<SecurityIcon />} label="Permissions" />
        </Tabs>
      </Paper>

      {/* Users Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">User Management</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateUser}
          >
            Create User
          </Button>
        </Box>

        {/* User Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField
              placeholder="Search users..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
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
              <InputLabel>Status</InputLabel>
              <Select
                value={userStatusFilter}
                label="Status"
                onChange={(e) => setUserStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={userRoleFilter}
                label="Role"
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="Administrator">Administrator</MenuItem>
                <MenuItem value="Editor">Editor</MenuItem>
                <MenuItem value="Viewer">Viewer</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* Users Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" sx={{ py: 4 }}>
                        No users found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {user.email}
                        </Typography>
                        {(user.firstName || user.lastName) && (
                          <Typography variant="caption" color="text.secondary">
                            {user.firstName} {user.lastName}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={getRoleColor(user.role) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status} 
                          color={getStatusColor(user.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(user.lastLogin)}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <IconButton 
                            size="small"
                            onClick={() => handleEditUser(user)}
                            title="Edit"
                          >
                            <EditIcon />
                          </IconButton>
                          {user.status === 'Active' ? (
                            <IconButton 
                              size="small"
                              onClick={() => handleSuspendUser(user.id)}
                              title="Suspend"
                              color="warning"
                            >
                              <BlockIcon />
                            </IconButton>
                          ) : (
                            <IconButton 
                              size="small"
                              onClick={() => handleActivateUser(user.id)}
                              title="Activate"
                              color="success"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={userPage}
            onPageChange={(_, newPage) => setUserPage(newPage)}
            rowsPerPage={userRowsPerPage}
            onRowsPerPageChange={(e) => {
              setUserRowsPerPage(parseInt(e.target.value, 10));
              setUserPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      </TabPanel>

      {/* Staff Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Staff Management</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateStaff}
          >
            Add Staff Member
          </Button>
        </Box>

        {/* Staff Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField
              placeholder="Search staff..."
              value={staffSearchTerm}
              onChange={(e) => setStaffSearchTerm(e.target.value)}
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
              <InputLabel>Status</InputLabel>
              <Select
                value={staffStatusFilter}
                label="Status"
                onChange={(e) => setStaffStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={staffRoleFilter}
                label="Role"
                onChange={(e) => setStaffRoleFilter(e.target.value)}
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="Investment Analyst">Investment Analyst</MenuItem>
                <MenuItem value="Portfolio Manager">Portfolio Manager</MenuItem>
                <MenuItem value="Risk Manager">Risk Manager</MenuItem>
                <MenuItem value="Compliance Officer">Compliance Officer</MenuItem>
                <MenuItem value="Senior Analyst">Senior Analyst</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* Staff Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" sx={{ py: 4 }}>
                        No staff members found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((member) => (
                    <TableRow key={member.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {member.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>{member.department || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={member.status} 
                          color={getStatusColor(member.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{member.email || 'N/A'}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <IconButton 
                            size="small"
                            onClick={() => handleEditStaff(member)}
                            title="Edit"
                          >
                            <EditIcon />
                          </IconButton>
                          {member.status === 'Active' ? (
                            <IconButton 
                              size="small"
                              onClick={() => handleSuspendStaff(member.id)}
                              title="Suspend"
                              color="warning"
                            >
                              <BlockIcon />
                            </IconButton>
                          ) : (
                            <IconButton 
                              size="small"
                              onClick={() => handleActivateStaff(member.id)}
                              title="Activate"
                              color="success"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={filteredStaff.length}
            page={staffPage}
            onPageChange={(_, newPage) => setStaffPage(newPage)}
            rowsPerPage={staffRowsPerPage}
            onRowsPerPageChange={(e) => {
              setStaffRowsPerPage(parseInt(e.target.value, 10));
              setStaffPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      </TabPanel>

      {/* Permissions Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" sx={{ mb: 2 }}>Permission Management</Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {['Managers', 'Events', 'Documents', 'Admin', 'Reports'].map((category) => (
            <Paper key={category} sx={{ p: 2, flex: '1 1 300px', minWidth: 300 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {category}
              </Typography>
              <Stack spacing={1}>
                {permissions
                  .filter(p => p.category === category)
                  .map((permission) => (
                    <Box key={permission.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle2">
                          {permission.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {permission.description}
                        </Typography>
                      </Box>
                      <Chip label="Enabled" color="success" size="small" />
                    </Box>
                  ))}
              </Stack>
            </Paper>
          ))}
        </Box>
      </TabPanel>

      {/* User Form Dialog */}
      <UserForm
        open={userDialogOpen}
        mode={editingUser ? 'edit' : 'create'}
        user={editingUser || undefined}
        roles={roles}
        permissions={permissions}
        onSubmit={handleUserSubmit}
        onCancel={handleUserDialogClose}
        loading={isLoading}
      />

      {/* Staff Form Dialog */}
      <StaffForm
        open={staffDialogOpen}
        mode={editingStaff ? 'edit' : 'create'}
        staff={editingStaff || undefined}
        onSubmit={handleStaffSubmit}
        onCancel={handleStaffDialogClose}
        loading={isLoading}
      />
    </Box>
  );
}
