import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const drawerWidth = 260;

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
        <Header />
        <Outlet /> 
      </Box>
    </Box>
  );
};

export default Layout;

