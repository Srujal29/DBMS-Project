import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

// Define your light and dark theme configurations
const lightThemeOptions = {
  palette: {
    mode: 'light',
    primary: { main: '#008080' },
    secondary: { main: '#D4AC2B' },
    background: { default: '#E2F8F5', paper: '#F3FCFA' },
    text: { primary: '#003D3D', secondary: '#006060' },
  },
  typography: {
    fontFamily: '"PT Sans", "Roboto", sans-serif',
    h1: { fontFamily: '"Playfair Display", serif' },
    h2: { fontFamily: '"Playfair Display", serif' },
    h3: { fontFamily: '"Playfair Display", serif' },
    h4: { fontFamily: '"Playfair Display", serif' },
    h5: { fontFamily: '"Playfair Display", serif' },
    h6: { fontFamily: '"Playfair Display", serif' },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCard: { styleOverrides: { root: { border: '1px solid rgba(0, 0, 0, 0.08)', boxShadow: 'none' } } },
    MuiPaper: { styleOverrides: { root: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' } } }
  }
};

const darkThemeOptions = {
  palette: {
    mode: 'dark',
    primary: { main: '#00A79D' },
    secondary: { main: '#6C757D' },
    background: { default: '#1D2A35', paper: '#273441' },
    text: { primary: '#E0E0E0', secondary: '#A0A0A0' },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
   typography: {
    fontFamily: '"PT Sans", "Roboto", sans-serif',
    h1: { fontFamily: '"Playfair Display", serif' },
    h2: { fontFamily: '"Playfair Display", serif' },
    h3: { fontFamily: '"Playfair Display", serif' },
    h4: { fontFamily: '"Playfair Display", serif' },
    h5: { fontFamily: '"Playfair Display", serif' },
    h6: { fontFamily: '"Playfair Display", serif' },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: { styleOverrides: { root: { border: '1px solid rgba(255, 255, 255, 0.12)' } } }
  }
};


const ThemeContext = createContext({
  toggleTheme: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // Get the user's preference from localStorage, defaulting to 'light'
    return localStorage.getItem('themeMode') || 'light';
  });

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const theme = useMemo(() => 
    createTheme(mode === 'light' ? lightThemeOptions : darkThemeOptions), 
  [mode]);

  return (
    <ThemeContext.Provider value={{ toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
