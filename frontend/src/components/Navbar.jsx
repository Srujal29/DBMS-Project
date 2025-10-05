import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  CalendarMonth,
  MedicalServices,
  People,
  Logout,
  LocalHospital,
  InsertDriveFile,
  VerifiedUser,
  AdminPanelSettings,
  BarChart,
  Payment,
  Campaign,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const patientLinks = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/patient/dashboard' },
    { text: 'Book Appointment', icon: <CalendarMonth />, path: '/patient/book-appointment' },
    { text: 'My Appointments', icon: <CalendarMonth />, path: '/patient/appointments' },
    { text: 'Medical Records', icon: <MedicalServices />, path: '/patient/records' },
    { text: 'My Documents', icon: <InsertDriveFile />, path: '/patient/documents' },
  ];

  const doctorLinks = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/doctor/dashboard' },
    { text: 'My Patients', icon: <People />, path: '/doctor/my-patients' },
    { text: 'Insurance Verification', icon: <VerifiedUser />, path: '/doctor/insurance-verification' },
  ];

  const adminLinks = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Manage Doctors', icon: <People />, path: '/admin/doctors' },
    { text: 'Manage Patients', icon: <People />, path: '/admin/patients' },
    { text: 'Billing Overview', icon: <Payment />, path: '/admin/billing' },
    { text: 'Insurance Management', icon: <VerifiedUser />, path: '/admin/insurance' },
    { text: 'Analytics', icon: <BarChart />, path: '/admin/analytics' },
    { text: 'Announcements', icon: <Campaign />, path: '/admin/announcements' },
  ];

  const getLinks = () => {
    if (user?.role === 'patient') return patientLinks;
    if (user?.role === 'doctor') return doctorLinks;
    if (user?.role === 'admin') return adminLinks;
    return [];
  };

  const links = getLinks();

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">Menu</Typography>
      </Box>
      <Divider />
      <List>
        {links.map((link) => (
          <ListItem button key={link.text} onClick={() => navigate(link.path)}>
            <ListItemIcon>{link.icon}</ListItemIcon>
            <ListItemText primary={link.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (!user) {
    return (
      <AppBar position="sticky" elevation={2}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <LocalHospital sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, fontWeight: 600 }}
            >
              MediTrack Pro
            </Typography>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button color="inherit" onClick={() => navigate('/register')}>
              Register
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
    );
  }

  const getRoleDisplay = () => {
    if (user.role === 'patient') return 'Patient Portal';
    if (user.role === 'doctor') return 'Doctor Portal';
    if (user.role === 'admin') return 'Admin Portal';
    return 'Portal';
  };

  return (
    <>
      <AppBar position="sticky" elevation={2}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={toggleDrawer(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <LocalHospital sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, fontWeight: 600 }}
            >
              MediTrack Pro - {getRoleDisplay()}
            </Typography>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                {links.map((link) => (
                  <Button
                    key={link.text}
                    color="inherit"
                    startIcon={link.icon}
                    onClick={() => navigate(link.path)}
                    size="small"
                  >
                    {link.text}
                  </Button>
                ))}
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user.name}
              </Typography>
              <IconButton onClick={handleMenu} color="inherit">
                <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {user.username} ({user.role})
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;