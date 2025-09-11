import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Chip } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const homeLink = user ? (user.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard') : '/login';

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        color: '#2c3e50',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalHospitalIcon 
            sx={{ 
              mr: 2, 
              fontSize: 32,
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }} 
          />
          <Typography 
            variant="h5" 
            component={Link} 
            to={homeLink} 
            sx={{ 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            HealthApp
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                    width: 36,
                    height: 36,
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user.username}
                  </Typography>
                  <Chip 
                    label={user.role} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                </Box>
              </Box>
              
              {user.role === 'patient' && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button component={Link} to="/patient/my-records" color="inherit" sx={{ fontWeight: 600 }}>
                    My Records
                  </Button>
                  <Button component={Link} to="/patient/book-appointment" color="inherit" sx={{ fontWeight: 600 }}>
                    Book Appointment
                  </Button>
                </Box>
              )}
              
              {user.role === 'doctor' && (
                <Button component={Link} to="/doctor/dashboard" color="inherit" sx={{ fontWeight: 600 }}>
                  Dashboard
                </Button>
              )}
              
              <Button 
                onClick={logout} 
                variant="outlined" 
                startIcon={<LogoutIcon />}
                sx={{ 
                  ml: 1,
                  borderColor: '#dc004e',
                  color: '#dc004e',
                  '&:hover': {
                    borderColor: '#9a0036',
                    backgroundColor: 'rgba(220, 0, 78, 0.04)',
                  }
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={Link} to="/login" color="inherit" sx={{ fontWeight: 600 }}>
                Login
              </Button>
              <Button component={Link} to="/register" variant="contained">
                Register
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;