
import { List, ListItemButton, ListItemIcon, ListItemText, Divider, Tooltip, Box } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import NoteIcon from "@mui/icons-material/Note";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate, useLocation } from "react-router-dom";
import "./SidebarNav.css";

export default function SidebarNav({ expanded }: { expanded: boolean }) {
  const nav = useNavigate();
  const location = useLocation();
  const go = (path: string) => () => nav(path);

  const Item = ({ icon, text, onClick, disabled, path }: { 
    icon: JSX.Element; 
    text: string; 
    onClick?: () => void; 
    disabled?: boolean;
    path: string;
  }) => {
    const isActive = location.pathname === path;
    
    return (
      <Tooltip 
        title={!expanded ? text : ""} 
        placement="right"
        classes={{ tooltip: "sidebar-nav-tooltip" }}
      >
        <span>
          <ListItemButton 
            onClick={onClick} 
            disabled={disabled}
            className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            sx={{ 
              minHeight: 48,
              justifyContent: "flex-start",
              px: 1,
              py: 1,
            }}
          >
            <ListItemIcon className="sidebar-nav-icon">
              {icon}
            </ListItemIcon>
            <ListItemText 
              primary={text} 
              className={`sidebar-nav-text ${expanded ? 'fade-in' : 'fade-out'}`}
              sx={{ 
                opacity: expanded ? 1 : 0,
                pr: 1,
                ml: 1,
              }} 
            />
          </ListItemButton>
        </span>
      </Tooltip>
    );
  };

  return (
    <Box className="sidebar-nav-container">
      <List className="sidebar-nav-list">
        <Item 
          icon={<DashboardIcon />} 
          text="Dashboard" 
          onClick={go("/dashboard")} 
          path="/dashboard"
        />
        
        <Divider className="sidebar-nav-divider" />
        
        <Item 
          icon={<PeopleAltIcon />} 
          text="Managers" 
          onClick={go("/managers")} 
          path="/managers"
        />
        
        <Item 
          icon={<EventIcon />} 
          text="Events" 
          onClick={go("/events")} 
          path="/events"
        />
        
        <Item
          icon={<DescriptionIcon />}
          text="Documents"
          onClick={go("/documents")}
          path="/documents"
        />

        <Item
          icon={<NoteIcon />}
          text="Notes"
          onClick={go("/notes")}
          path="/notes"
        />

        <Item
          icon={<SearchIcon />}
          text="Search"
          onClick={go("/search")}
          path="/search"
        />
        
        <Divider className="sidebar-nav-divider" />
        
        <Item 
          icon={<AdminPanelSettingsIcon />} 
          text="Admin" 
          onClick={go("/admin")} 
          path="/admin"
        />
      </List>
    </Box>
  );
}


