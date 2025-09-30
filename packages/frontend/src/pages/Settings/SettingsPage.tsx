import { useState, useCallback } from "react";
/**
 * SettingsPage
 *
 * Purpose
 * - User-oriented settings and account management
 * - Password reset functionality
 * - Bug reporting system
 * - Email notification preferences
 * - Display preferences
 * - Account information
 *
 * Concepts
 * - Tabbed interface for organized settings
 * - Form validation and submission
 * - User preference management
 * - Support and feedback features
 */
import { 
  Box, 
  Paper, 
  Typography, 
  Tabs,
  Tab,
  TextField,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  Divider,
  Card,
  CardContent,
  Stack,
  Chip
} from "@mui/material";
import { 
  Lock as LockIcon, 
  BugReport as BugIcon, 
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from "@mui/icons-material";
import "./SettingsPage.css";

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
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

export default function SettingsPage() {
  // Tab state
  const [tabValue, setTabValue] = useState(0);

  // Account info state (mock data - would come from useAuth hook)
  const [userInfo] = useState({
    email: "user@kpers.gov",
    firstName: "John",
    lastName: "Doe",
    role: "Editor",
    department: "Investment Management",
    phone: "(555) 123-4567",
    lastLogin: "2025-01-15T10:30:00Z"
  });

  // Password reset state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Bug report state
  const [bugReport, setBugReport] = useState({
    title: "",
    description: "",
    severity: "medium",
    category: "general"
  });
  const [bugReportSuccess, setBugReportSuccess] = useState(false);
  const [bugReportError, setBugReportError] = useState<string | null>(null);

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    managerUpdates: true,
    eventReminders: true,
    documentUploads: false,
    weeklyDigest: true,
    systemAlerts: true
  });
  const [notificationSuccess, setNotificationSuccess] = useState(false);

  // Display preferences state
  const [displayPreferences, setDisplayPreferences] = useState({
    theme: "light",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    itemsPerPage: "10",
    compactView: false
  });
  const [displaySuccess, setDisplaySuccess] = useState(false);

  // Tab change handler
  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  // Password reset handlers
  const handlePasswordChange = useCallback((field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    setPasswordError(null);
    setPasswordSuccess(false);
  }, []);

  const handlePasswordSubmit = useCallback(async () => {
    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      // TODO: Implement actual password reset API call
      console.log("Password reset submitted:", { currentPassword: "***", newPassword: "***" });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setPasswordSuccess(true);
      setPasswordError(null);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      setPasswordError(error.message || "Failed to reset password");
    }
  }, [passwordForm]);

  // Bug report handlers
  const handleBugReportChange = useCallback((field: string, value: string) => {
    setBugReport(prev => ({ ...prev, [field]: value }));
    setBugReportError(null);
    setBugReportSuccess(false);
  }, []);

  const handleBugReportSubmit = useCallback(async () => {
    // Validation
    if (!bugReport.title || !bugReport.description) {
      setBugReportError("Title and description are required");
      return;
    }

    try {
      // TODO: Implement actual bug report API call
      console.log("Bug report submitted:", bugReport);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setBugReportSuccess(true);
      setBugReportError(null);
      setBugReport({
        title: "",
        description: "",
        severity: "medium",
        category: "general"
      });
    } catch (error: any) {
      setBugReportError(error.message || "Failed to submit bug report");
    }
  }, [bugReport]);

  // Notification preferences handlers
  const handleNotificationToggle = useCallback((field: string) => {
    setNotifications(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
    setNotificationSuccess(false);
  }, []);

  const handleNotificationsSave = useCallback(async () => {
    try {
      // TODO: Implement actual notification preferences API call
      console.log("Notification preferences saved:", notifications);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      setNotificationSuccess(true);
      setTimeout(() => setNotificationSuccess(false), 3000);
    } catch (error: any) {
      console.error("Failed to save notification preferences:", error);
    }
  }, [notifications]);

  // Display preferences handlers
  const handleDisplayChange = useCallback((field: string, value: string | boolean) => {
    setDisplayPreferences(prev => ({ ...prev, [field]: value }));
    setDisplaySuccess(false);
  }, []);

  const handleDisplaySave = useCallback(async () => {
    try {
      // TODO: Implement actual display preferences API call
      console.log("Display preferences saved:", displayPreferences);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      
      setDisplaySuccess(true);
      setTimeout(() => setDisplaySuccess(false), 3000);
    } catch (error: any) {
      console.error("Failed to save display preferences:", error);
    }
  }, [displayPreferences]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString();
  }, []);

  return (
    <Box className="settings-page">
      <Typography variant="h4" sx={{ mb: 3 }}>
        Settings
      </Typography>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
          <Tab icon={<PersonIcon />} label="Account" />
          <Tab icon={<LockIcon />} label="Security" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<PaletteIcon />} label="Display" />
          <Tab icon={<BugIcon />} label="Report Issue" />
        </Tabs>
      </Paper>

      {/* Account Tab */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" sx={{ mb: 3 }}>Account Information</Typography>
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body1">{userInfo.email}</Typography>
                </Stack>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body1">{userInfo.firstName} {userInfo.lastName}</Typography>
                </Stack>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body1">{userInfo.phone}</Typography>
                </Stack>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Role</Typography>
                <Chip label={userInfo.role} color="primary" size="small" />
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                <Typography variant="body1">{userInfo.department}</Typography>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Last Login</Typography>
                <Typography variant="body1">{formatDate(userInfo.lastLogin)}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Alert severity="info">
          To update your account information, please contact your system administrator or visit the Admin section if you have appropriate permissions.
        </Alert>
      </TabPanel>

      {/* Security Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" sx={{ mb: 3 }}>Change Password</Typography>
        
        {passwordSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Password successfully updated!
          </Alert>
        )}
        
        {passwordError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {passwordError}
          </Alert>
        )}
        
        <Paper sx={{ p: 3 }}>
          <Stack spacing={3}>
            <TextField
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              fullWidth
              required
            />
            
            <TextField
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              fullWidth
              required
              helperText="Password must be at least 8 characters"
            />
            
            <TextField
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              fullWidth
              required
            />
            
            <Box>
              <Button 
                variant="contained" 
                onClick={handlePasswordSubmit}
                disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              >
                Change Password
              </Button>
            </Box>
          </Stack>
        </Paper>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Password Requirements:</Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>At least 8 characters long</li>
            <li>Should contain a mix of letters, numbers, and symbols</li>
            <li>Avoid using common words or personal information</li>
          </ul>
        </Alert>
      </TabPanel>

      {/* Notifications Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" sx={{ mb: 3 }}>Email Notification Preferences</Typography>
        
        {notificationSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Notification preferences saved successfully!
          </Alert>
        )}
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend">Receive Email Notifications For:</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={notifications.emailNotifications} 
                    onChange={() => handleNotificationToggle('emailNotifications')}
                  />
                }
                label="Enable Email Notifications"
              />
              
              <Divider sx={{ my: 2 }} />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={notifications.managerUpdates} 
                    onChange={() => handleNotificationToggle('managerUpdates')}
                    disabled={!notifications.emailNotifications}
                  />
                }
                label="Manager Status Updates"
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={notifications.eventReminders} 
                    onChange={() => handleNotificationToggle('eventReminders')}
                    disabled={!notifications.emailNotifications}
                  />
                }
                label="Event Reminders"
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={notifications.documentUploads} 
                    onChange={() => handleNotificationToggle('documentUploads')}
                    disabled={!notifications.emailNotifications}
                  />
                }
                label="Document Uploads"
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={notifications.weeklyDigest} 
                    onChange={() => handleNotificationToggle('weeklyDigest')}
                    disabled={!notifications.emailNotifications}
                  />
                }
                label="Weekly Activity Digest"
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={notifications.systemAlerts} 
                    onChange={() => handleNotificationToggle('systemAlerts')}
                    disabled={!notifications.emailNotifications}
                  />
                }
                label="System Alerts and Announcements"
              />
            </FormGroup>
          </FormControl>
          
          <Box sx={{ mt: 3 }}>
            <Button 
              variant="contained" 
              onClick={handleNotificationsSave}
            >
              Save Preferences
            </Button>
          </Box>
        </Paper>

        <Alert severity="info">
          Email notifications will be sent to your registered email address: <strong>{userInfo.email}</strong>
        </Alert>
      </TabPanel>

      {/* Display Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" sx={{ mb: 3 }}>Display Preferences</Typography>
        
        {displaySuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Display preferences saved successfully!
          </Alert>
        )}
        
        <Paper sx={{ p: 3 }}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Theme</InputLabel>
              <Select
                value={displayPreferences.theme}
                label="Theme"
                onChange={(e) => handleDisplayChange('theme', e.target.value)}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark (Coming Soon)</MenuItem>
                <MenuItem value="auto">Auto (System Default)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Date Format</InputLabel>
              <Select
                value={displayPreferences.dateFormat}
                label="Date Format"
                onChange={(e) => handleDisplayChange('dateFormat', e.target.value)}
              >
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (01/15/2025)</MenuItem>
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (15/01/2025)</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (2025-01-15)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Time Format</InputLabel>
              <Select
                value={displayPreferences.timeFormat}
                label="Time Format"
                onChange={(e) => handleDisplayChange('timeFormat', e.target.value)}
              >
                <MenuItem value="12h">12-hour (3:30 PM)</MenuItem>
                <MenuItem value="24h">24-hour (15:30)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Items Per Page</InputLabel>
              <Select
                value={displayPreferences.itemsPerPage}
                label="Items Per Page"
                onChange={(e) => handleDisplayChange('itemsPerPage', e.target.value)}
              >
                <MenuItem value="5">5</MenuItem>
                <MenuItem value="10">10</MenuItem>
                <MenuItem value="25">25</MenuItem>
                <MenuItem value="50">50</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={
                <Switch 
                  checked={displayPreferences.compactView} 
                  onChange={(e) => handleDisplayChange('compactView', e.target.checked)}
                />
              }
              label="Use Compact View for Tables"
            />
            
            <Box>
              <Button 
                variant="contained" 
                onClick={handleDisplaySave}
              >
                Save Preferences
              </Button>
            </Box>
          </Stack>
        </Paper>
      </TabPanel>

      {/* Report Issue Tab */}
      <TabPanel value={tabValue} index={4}>
        <Typography variant="h6" sx={{ mb: 3 }}>Report a Bug or Issue</Typography>
        
        {bugReportSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Thank you! Your bug report has been submitted. Our support team will review it shortly.
          </Alert>
        )}
        
        {bugReportError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {bugReportError}
          </Alert>
        )}
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack spacing={3}>
            <TextField
              label="Issue Title"
              value={bugReport.title}
              onChange={(e) => handleBugReportChange('title', e.target.value)}
              fullWidth
              required
              placeholder="Brief description of the issue"
            />
            
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={bugReport.category}
                label="Category"
                onChange={(e) => handleBugReportChange('category', e.target.value)}
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="managers">Managers Section</MenuItem>
                <MenuItem value="events">Events Section</MenuItem>
                <MenuItem value="documents">Documents Section</MenuItem>
                <MenuItem value="search">Search Functionality</MenuItem>
                <MenuItem value="performance">Performance Issue</MenuItem>
                <MenuItem value="ui">User Interface</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select
                value={bugReport.severity}
                label="Severity"
                onChange={(e) => handleBugReportChange('severity', e.target.value)}
              >
                <MenuItem value="low">Low - Minor inconvenience</MenuItem>
                <MenuItem value="medium">Medium - Affects workflow</MenuItem>
                <MenuItem value="high">High - Prevents task completion</MenuItem>
                <MenuItem value="critical">Critical - System unusable</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Description"
              value={bugReport.description}
              onChange={(e) => handleBugReportChange('description', e.target.value)}
              fullWidth
              required
              multiline
              rows={6}
              placeholder="Please provide detailed information about the issue, including steps to reproduce if applicable"
            />
            
            <Box>
              <Button 
                variant="contained" 
                onClick={handleBugReportSubmit}
                disabled={!bugReport.title || !bugReport.description}
                startIcon={<BugIcon />}
              >
                Submit Bug Report
              </Button>
            </Box>
          </Stack>
        </Paper>

        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>Need Immediate Help?</Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Email:</strong> support@kpers.gov
              </Typography>
              <Typography variant="body2">
                <strong>Phone:</strong> (555) 100-HELP
              </Typography>
              <Typography variant="body2">
                <strong>Hours:</strong> Monday-Friday, 8:00 AM - 5:00 PM CST
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
}

