import { Box, Paper, Typography, Button, TextField } from "@mui/material";

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Manager Dashboard
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Select Manager</Typography>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField size="small" label="Manager" fullWidth />
            <Button variant="contained">Go</Button>
          </Box>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Quick Actions</Typography>
          <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
            <Button>Open All Notes</Button>
            <Button>Open All Attach</Button>
          </Box>
        </Paper>

        <Paper sx={{ gridColumn: "1 / -1", p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Performance
          </Typography>
          <Box sx={{ height: 160, bgcolor: "action.hover", borderRadius: 1 }} />
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Meeting Calendar</Typography>
          <Box sx={{ height: 160, bgcolor: "action.hover", borderRadius: 1 }} />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Manager Contacts</Typography>
          <Box sx={{ height: 160, bgcolor: "action.hover", borderRadius: 1 }} />
        </Paper>
      </Box>
    </Box>
  );
}


