import { createTheme } from '@mui/material/styles';

// A custom dark theme with a teal and gold palette, using Playfair Display and PT Sans fonts.
const theme = createTheme({
  palette: {
    mode: 'dark', // Set the theme to dark mode
    primary: {
      main: '#00A79D', // Vibrant Teal for buttons and highlights
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#D4AC2B', // Warm Yellow/Gold Accent
    },
    background: {
      default: '#1D2A35', // Dark slate background
      paper: '#273441',   // Slightly lighter background for cards and papers
    },
    text: {
      primary: '#E0E0E0',   // Light grey for primary text
      secondary: '#A0A0A0', // Dimmer grey for secondary text
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    // Body font
    fontFamily: '"PT Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    
    // Headline font
    h1: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
    h2: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
    h3: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
    h4: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
    h5: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
    h6: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },

    button: {
        textTransform: 'none',
        fontWeight: 700,
    }
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Important for dark mode
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(255, 255, 255, 0.12)', // A light border for cards in dark mode
          boxShadow: 'none',
        }
      }
    },
  },
});

export default theme;

