import { createTheme } from "@mui/material/styles";

// KPERS-inspired palette approximation
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#003366",
      light: "#335c85",
      dark: "#001f40",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#0f766e",
      light: "#3aa69e",
      dark: "#0a4c47",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f7f7f9",
      paper: "#ffffff",
    },
  },
  components: {
    MuiButton: {
      defaultProps: { variant: "contained" },
    },
    MuiAppBar: {
      defaultProps: { color: "primary" },
    },
    MuiDrawer: {
      styleOverrides: { paper: { borderRight: "none" } },
    },
  },
});

export default theme;


