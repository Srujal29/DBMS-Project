import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const drawerWidth = 260; // This should match the width defined in your Sidebar.jsx

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: `calc(100% - ${drawerWidth}px)`,
          bgcolor: 'background.default'
        }}
      >
        {/* The Outlet is where your page components (e.g., Dashboard) will be rendered */}
        <Outlet /> 
      </Box>
    </Box>
  );
};

export default Layout;

