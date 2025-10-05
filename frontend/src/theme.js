import { createTheme } from '@mui/material/styles';

// A custom theme for this app
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#64b5f6', // A light, friendly blue
      light: '#9be7ff',
      dark: '#2286c3',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    secondary: {
      main: '#ce93d8', // A soft purple
      light: '#ffc4ff',
      dark: '#9c64a6',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    background: {
      default: '#1a2027', // A very dark, slightly blue-ish color
      paper: '#272f3a', // A lighter dark blue for cards and surfaces
    },
    text: {
      primary: '#e0e0e0', // Light grey for primary text
      secondary: '#b0bec5', // A softer grey for secondary text
    },
    success: {
      main: '#81c784',
    },
    warning: {
      main: '#ffb74d',
    },
    error: {
      main: '#e57373',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Override MUI's default paper gradient in dark mode
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

export default theme;
