import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { Container, Typography, Box } from '@mui/material';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import Login from './pages/common/Login';
import Register from './pages/common/Register';
import PatientDashboard from './pages/patient/PatientDashboard';
import MyRecords from './pages/patient/MyRecords';
import BookAppointment from './pages/patient/BookAppointment';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ErrorIcon from '@mui/icons-material/Error';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Navbar />
          <Container component="main" sx={{ mt: 4, mb: 4, minHeight: 'calc(100vh - 200px)' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/login" />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<RoleBasedRoute allowedRoles={['patient']} />}>
                  <Route path="/patient/dashboard" element={<PatientDashboard />} />
                  <Route path="/patient/my-records" element={<MyRecords />} />
                  <Route path="/patient/book-appointment" element={<BookAppointment />} />
                </Route>
                <Route element={<RoleBasedRoute allowedRoles={['doctor']} />}>
                  <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                </Route>
              </Route>
              <Route path="*" element={
                <Box sx={{ 
                  textAlign: 'center', 
                  mt: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    404
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    Oops! Page not found
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    The page you're looking for doesn't exist.
                  </Typography>
                </Box>
              } />
            </Routes>
          </Container>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;