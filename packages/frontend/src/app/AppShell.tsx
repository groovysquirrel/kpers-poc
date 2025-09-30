import { PropsWithChildren, useMemo, useState, useEffect } from "react";
import { 
  Box, 
  CssBaseline, 
  Drawer, 
  IconButton, 
  Toolbar, 
  AppBar, 
  Typography,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Stack,
  Chip
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../lib/contextLib";
import SidebarNav from "../components/navigation/SidebarNav";
import "../components/navigation/SidebarNav.css";

const COLLAPSE_KEY = "ui.sidebar.expanded";
const DRAWER_WIDTH_EXPANDED = 200; // Slightly wider so long labels (e.g., Q-Reports) don't clip
const DRAWER_WIDTH_COLLAPSED = 80; // Wider collapsed state for better icon spacing

/**
 * AppShell
 *
 * Provides the common layout for all authenticated pages:
 * - Top AppBar with user profile and logout
 * - Responsive navigation drawer (collapsible on desktop, slide-out on mobile)
 * - Main content area for page rendering
 *
 * Features:
 * - Desktop: Permanent drawer with expand/collapse via icon hover
 * - Mobile: Temporary drawer triggered by hamburger menu
 * - User profile dropdown with settings and logout
 * - Persists sidebar state in localStorage
 */
export default function AppShell({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const { userInfo, handleLogout } = useAppContext();
  const [expanded, setExpanded] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COLLAPSE_KEY);
      if (raw !== null) setExpanded(raw === "true");
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, String(expanded));
    } catch {}
  }, [expanded]);

  // When collapsed, the drawer becomes a narrow icon rail
  const drawerWidth = useMemo(() => (expanded ? DRAWER_WIDTH_EXPANDED : DRAWER_WIDTH_COLLAPSED), [expanded]);

  // Mobile drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // User menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSettingsClick = () => {
    handleMenuClose();
    navigate("/settings");
  };

  const handleLogoutClick = async () => {
    handleMenuClose();
    if (handleLogout) {
      await handleLogout();
    }
  };

  // User display helpers
  const getUserInitials = () => {
    if (userInfo?.firstName && userInfo?.lastName) {
      return `${userInfo.firstName.charAt(0)}${userInfo.lastName.charAt(0)}`.toUpperCase();
    }
    if (userInfo?.email) {
      return userInfo.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    if (userInfo?.firstName && userInfo?.lastName) {
      return `${userInfo.firstName} ${userInfo.lastName}`;
    }
    if (userInfo?.email) {
      return userInfo.email.split("@")[0];
    }
    return "User";
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* Top AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          {/* Mobile hamburger menu */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
            aria-label="open navigation menu"
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            KPERS Fund Manager Relations Tool
          </Typography>

          {/* User Profile */}
          <Button
            color="inherit"
            onClick={handleMenuOpen}
            aria-label="user menu"
            sx={{
              textTransform: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 2,
              px: 1.5,
              py: 0.75,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'white',
                color: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              {getUserInitials()}
            </Avatar>
            <Stack direction="column" alignItems="flex-start" spacing={0} sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2, color: 'white' }}>
                {getDisplayName()}
              </Typography>
              {userInfo?.role && (
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1 }}>
                  {userInfo.role}
                </Typography>
              )}
            </Stack>
          </Button>

          {/* User Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                minWidth: 200,
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {/* User Info Header */}
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {getDisplayName()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {userInfo?.email}
              </Typography>
              {userInfo?.role && (
                <Chip 
                  label={userInfo.role} 
                  size="small" 
                  color="primary" 
                  sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }} 
                />
              )}
            </Box>

            <Divider />

            <MenuItem onClick={handleSettingsClick}>
              <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
              Settings
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogoutClick} sx={{ color: 'error.main' }}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer - temporary overlay */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          [`& .MuiDrawer-paper`]: { 
            width: DRAWER_WIDTH_EXPANDED, 
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <SidebarNav expanded={true} />
      </Drawer>

      {/* Desktop Drawer - permanent, collapsible with hover */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: "border-box",
            overflow: "hidden",
            transition: "width 200ms ease-in-out",
          },
        }}
        open={expanded}
      >
        <Toolbar />
        <SidebarNav expanded={expanded} />
      </Drawer>

      {/* Main Content Area */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          transition: "padding 200ms ease-in-out",
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        {children}
      </Box>
    </Box>
  );
}


