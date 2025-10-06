import { createTheme } from '@mui/material/styles';

// The light theme with a teal and gold palette, using Playfair Display and PT Sans fonts.
const theme = createTheme({
  palette: {
    mode: 'light', // Set the theme to light mode
    primary: {
      main: '#008080', // Strong Teal
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#D4AC2B', // Warm Yellow/Gold Accent
    },
    background: {
      default: '#E2F8F5', // Very light, slightly green-tinted background
      paper: '#F3FCFA',   // Slightly off-white for cards
    },
    text: {
      primary: '#003D3D',   // Very dark blue for primary text
      secondary: '#006060', // A slightly lighter dark blue for secondary text
    },
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
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: 'none',
        }
      }
    },
     MuiPaper: {
      styleOverrides: {
        root: {
           boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        }
      }
    }
  },
});

export default theme;

