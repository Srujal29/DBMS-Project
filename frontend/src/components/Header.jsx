import React, { useState } from 'react';
import {
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Toolbar, // Toolbar is still needed for structure, we just wrap it
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Logout } from '@mui/icons-material';

const Header = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    // The ProtectedRoute in App.jsx will automatically handle navigation to /login
  };
  
  // Function to get initials from the user's name or username
  const getInitials = (name = '') => {
    const nameParts = name.split(' ');
    // Ensure the second part exists before trying to access it
    if (nameParts.length > 1 && nameParts[1]) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  return (
    // UPDATED: Using a Toolbar with explicit height and alignment to perfectly match the Sidebar's logo Toolbar.
    // The 'py' padding is removed in favor of direct flexbox centering.
    <Toolbar sx={{ justifyContent: 'flex-end', height: '88px', mb: 2 }}>
      <IconButton onClick={handleMenu} sx={{ p: 0 }}>
        <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          {getInitials(user?.name || user?.username)}
        </Avatar>
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1.5,
          }
        }}
      >
        <Box sx={{ px: 2, py: 1, minWidth: 220 }}>
          <Typography variant="subtitle1" fontWeight="bold">{user?.name || user?.username}</Typography>
          <Typography variant="body2" color="text.secondary">{user?.role}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Log out</ListItemText>
        </MenuItem>
      </Menu>
    </Toolbar>
  );
};

export default Header;

