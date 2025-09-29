import { Fragment } from "react";
import { List, ListItemButton, ListItemIcon, ListItemText, Divider, Tooltip } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import GavelIcon from "@mui/icons-material/Gavel";
import SettingsIcon from "@mui/icons-material/Settings";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useNavigate } from "react-router-dom";

export default function SidebarNav({ expanded }: { expanded: boolean }) {
  const nav = useNavigate();
  const go = (path: string) => () => nav(path);

  // Keep this in sync with Drawer collapsed width so icons do not shift
  const ICON_GUTTER = 48; // Match AppShell collapsed width

  const Item = ({ icon, text, onClick, disabled }: { icon: JSX.Element; text: string; onClick?: () => void; disabled?: boolean }) => (
    <Tooltip title={!expanded ? text : ""} placement="right">
      <span>
        <ListItemButton 
          onClick={onClick} 
          disabled={disabled}
          sx={{ 
            minHeight: 48, // Consistent height
            justifyContent: "flex-start", // Keep start alignment in both states so icon x-position is stable
            px: 1.5, // Slight left padding; text spacing handled by ListItemIcon minWidth
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: ICON_GUTTER, // Fixed gutter equals collapsed drawer width
            display: "flex",
            justifyContent: "center", // Center icon within gutter so x-position matches both states
          }}>
            {icon}
          </ListItemIcon>
          <ListItemText 
            primary={text} 
            sx={{ 
              opacity: expanded ? 1 : 0,
              transition: "opacity 0.2s ease-in-out",
              whiteSpace: "nowrap",
              pr: 1, // a little right padding to avoid edge clipping
            }} 
          />
        </ListItemButton>
      </span>
    </Tooltip>
  );

  return (
    <Fragment>
      <List subheader={undefined}>
        <Item icon={<DashboardIcon />} text="Dashboard" onClick={go("/dashboard")} />
      </List>
      <Divider />
      <List>
        <Item icon={<PeopleAltIcon />} text="Managers" onClick={go("/managers")} />
      </List>
      <Divider />
      <List>
        <Item icon={<EventIcon />} text="Create Event" onClick={go("/events/new")} />
        <Item icon={<EventIcon />} text="Browse Events" onClick={go("/events")} />
      </List>
      <Divider />
      <List>
        <Item icon={<DescriptionIcon />} text="Add Notes to Event" disabled onClick={go("/events")} />
        <Item icon={<DescriptionIcon />} text="Add Memos" disabled />
        <Item icon={<DescriptionIcon />} text="Add Documents" disabled />
        <Item icon={<DescriptionIcon />} text="Import/Rename Q-Reports" disabled />
      </List>
      <Divider />
      <List>
        <Item icon={<GavelIcon />} text="Probation – Create" disabled />
        <Item icon={<GavelIcon />} text="Probation – Update" disabled />
        <Item icon={<GavelIcon />} text="Terminated Checklist" disabled />
      </List>
      <Divider />
      <List>
        <Item icon={<AdminPanelSettingsIcon />} text="Admin" onClick={go("/admin")} />
        <Item icon={<SettingsIcon />} text="Settings" onClick={go("/settings")} />
      </List>
    </Fragment>
  );
}


