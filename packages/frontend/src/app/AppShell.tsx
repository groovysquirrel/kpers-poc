import { PropsWithChildren, useMemo, useState, useEffect } from "react";
import { Box, CssBaseline, Drawer, IconButton, Toolbar, AppBar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SidebarNav from "../components/navigation/SidebarNav";
import "../components/navigation/SidebarNav.css";

const COLLAPSE_KEY = "ui.sidebar.expanded";
const DRAWER_WIDTH_EXPANDED = 200; // Slightly wider so long labels (e.g., Q-Reports) don't clip
const DRAWER_WIDTH_COLLAPSED = 80; // Wider collapsed state for better icon spacing

/**
 * AppShell
 *
 * Provides the common layout for all authenticated pages:
 * - A top AppBar with a menu button
 * - A permanent left Drawer (sidebar) that can be collapsed/expanded
 * - A main content area where page content is rendered
 *
 * Why this structure?
 * - Keeps navigation reusable (`SidebarNav` is a pure component under components/)
 * - Centralizes layout spacing, toolbar offsets, and theme-aware styling
 * - Persists the sidebar state using localStorage so users keep their preference
 */
export default function AppShell({ children }: PropsWithChildren) {
  const [expanded, setExpanded] = useState<boolean>(false);

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

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* Top application bar. zIndex ensures it sits above the Drawer. */}
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          {/* Toggle to collapse/expand the sidebar
              The Box ensures the hamburger sits on the same x-position as the sidebar icons.
          */}
          <Box className="hamburger-container">
            <IconButton color="inherit" edge="start" onClick={() => setExpanded((v) => !v)}>
              <MenuIcon />
            </IconButton>
          </Box>
          <Typography variant="h6" noWrap component="div">
            KPERS Fund Manager Relations Tool
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Permanent drawer used as the left sidebar navigation */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: "border-box",
            overflow: "hidden", // Prevent scrollbars
            transition: "width 200ms ease-in-out", // Smooth width transition
          },
        }}
        open={expanded}
      >
        {/* Spacer so content sits below the AppBar height */}
        <Toolbar />
        <SidebarNav expanded={expanded} />
      </Drawer>

      {/* Main content area for the active route */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, transition: "padding 200ms ease-in-out" }}>
        {/* Spacer to offset the fixed AppBar */}
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}


