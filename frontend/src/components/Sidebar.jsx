import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Toolbar,
  Divider,
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import all necessary icons
import Dashboard from '@mui/icons-material/Dashboard';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import MedicalServices from '@mui/icons-material/MedicalServices';
import People from '@mui/icons-material/People';
import InsertDriveFile from '@mui/icons-material/InsertDriveFile';
import VerifiedUser from '@mui/icons-material/VerifiedUser';
import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings';
import BarChart from '@mui/icons-material/BarChart';
import Payment from '@mui/icons-material/Payment';
import Campaign from '@mui/icons-material/Campaign';
import Person from '@mui/icons-material/Person';
import LocalHospital from '@mui/icons-material/LocalHospital';
import MonitorHeart from '@mui/icons-material/MonitorHeart'; // 1. IMPORT THE NEW ICON


const drawerWidth = 260;

const Sidebar = () => {
  const { user } = useAuth();

  // Navigation links for each user role
  const patientLinks = [
    { text: 'Dashboard', path: '/patient/dashboard', icon: <Dashboard /> },
    { text: 'Book Appointment', path: '/patient/book-appointment', icon: <CalendarMonth /> },
    { text: 'My Appointments', path: '/patient/appointments', icon: <CalendarMonth /> },
    { text: 'Medical Records', path: '/patient/records', icon: <MedicalServices /> },
    { text: 'My Documents', path: '/patient/documents', icon: <InsertDriveFile /> },
    { text: 'My Profile', path: '/patient/profile', icon: <Person /> },
  ];

  const doctorLinks = [
    { text: 'Dashboard', path: '/doctor/dashboard', icon: <Dashboard /> },
    { text: 'My Patients', path: '/doctor/my-patients', icon: <People /> },
    { text: 'Insurance Verification', path: '/doctor/insurance-verification', icon: <VerifiedUser /> },
  ];

  const adminLinks = [
    { text: 'Dashboard', path: '/admin/dashboard', icon: <AdminPanelSettings /> },
    { text: 'Analytics', path: '/admin/analytics', icon: <BarChart /> },
    { text: 'Manage Doctors', path: '/admin/doctors', icon: <LocalHospital /> },
    { text: 'Manage Patients', path: '/admin/patients', icon: <People /> },
    { text: 'Billing Overview', path: '/admin/billing-overview', icon: <Payment /> },
    { text: 'Insurance Management', path: '/admin/insurance', icon: <VerifiedUser /> },
    { text: 'Announcements', path: '/admin/announcements', icon: <Campaign /> },
  ];

  const links = user?.role === 'patient' ? patientLinks : user?.role === 'doctor' ? doctorLinks : adminLinks;

  const drawerContent = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '88px' }}>
        {/* 2. REPLACE THE ICON HERE */}
        <MonitorHeart sx={{ color: 'primary.main', fontSize: 32, mr: 1 }} />
        <Typography variant="h5" noWrap component="div" fontWeight={700}>
          MediTrack Pro
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ p: 2 }}>
        {links.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              sx={{
                borderRadius: '8px',
                '&.active': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', borderRight: 'none' },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;

