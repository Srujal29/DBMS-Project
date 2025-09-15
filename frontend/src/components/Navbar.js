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
        background: 'rgba(26, 26, 46, 0.9)',
        backdropFilter: 'blur(20px)',
        color: '#ffffff',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalHospitalIcon 
            sx={{ 
              mr: 2, 
              fontSize: 32,
              background: 'linear-gradient(45deg, #42a5f5 30%, #80d6ff 90%)',
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
              background: 'linear-gradient(45deg, #42a5f5 30%, #80d6ff 90%)',
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
                    background: 'linear-gradient(45deg, #42a5f5 30%, #80d6ff 90%)',
                    color: '#0a0e27',
                    width: 36,
                    height: 36,
                    fontWeight: 700,
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffffff' }}>
                    {user.username}
                  </Typography>
                  <Chip 
                    label={user.role} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ 
                      fontSize: '0.7rem', 
                      height: 20,
                      borderColor: 'rgba(66, 165, 245, 0.5)',
                      color: '#42a5f5',
                    }}
                  />
                </Box>
              </Box>
              
              {user.role === 'patient' && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    component={Link} 
                    to="/patient/my-records" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 600,
                      '&:hover': {
                        color: '#42a5f5',
                        background: 'rgba(66, 165, 245, 0.08)',
                      }
                    }}
                  >
                    My Records
                  </Button>
                  <Button 
                    component={Link} 
                    to="/patient/find-doctors" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 600,
                      '&:hover': {
                        color: '#42a5f5',
                        background: 'rgba(66, 165, 245, 0.08)',
                      }
                    }}
                  >
                    Find Doctors
                  </Button>
                  <Button 
                    component={Link} 
                    to="/patient/book-appointment" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 600,
                      '&:hover': {
                        color: '#42a5f5',
                        background: 'rgba(66, 165, 245, 0.08)',
                      }
                    }}
                  >
                    Book Appointment
                  </Button>
                </Box>
              )}
              
              {user.role === 'doctor' && (
                <Button 
                  component={Link} 
                  to="/doctor/dashboard" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 600,
                    '&:hover': {
                      color: '#42a5f5',
                      background: 'rgba(66, 165, 245, 0.08)',
                    }
                  }}
                >
                  Dashboard
                </Button>
              )}
              
              <Button 
                onClick={logout} 
                variant="outlined" 
                startIcon={<LogoutIcon />}
                sx={{ 
                  ml: 1,
                  borderColor: '#f48fb1',
                  color: '#f48fb1',
                  '&:hover': {
                    borderColor: '#ffc1e3',
                    backgroundColor: 'rgba(244, 143, 177, 0.08)',
                  }
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                component={Link} 
                to="/login" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 600,
                  '&:hover': {
                    color: '#42a5f5',
                    background: 'rgba(66, 165, 245, 0.08)',
                  }
                }}
              >
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