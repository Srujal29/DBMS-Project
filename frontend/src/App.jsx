import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import theme from './theme';
import Navbar from './components/Navbar';

// --- Page Imports ---

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import MyRecords from './pages/patient/MyRecords';
import UploadDocuments from './pages/patient/UploadDocument'; 

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import MyPatients from './pages/doctor/MyPatients';
import PatientDetail from './pages/doctor/PatientDetail';
import MedicalRecordForm from './pages/doctor/MedicalRecordForm';
import GenerateInvoice from './pages/doctor/GenerateInvoice';
// CORRECTED: The file is named InsuranceVerfication.jsx (with a typo)
import InsuranceVerification from './pages/doctor/InsuranceVerfication';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManagePatients from './pages/admin/ManagePatients';
import BillingOverview from './pages/admin/BillingOverview';
import InsuranceManagement from './pages/admin/InsuranceManagement';
import Announcements from './pages/admin/Announcements';
import Analytics from './pages/admin/Analytics';


// --- Protected Route Component ---
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || user?.role !== allowedRole) {
    // Redirect them to the login page
    return <Navigate to="/login" replace />;
  }
  return children;
};


// --- Main App Component ---
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Patient Routes */}
              <Route path="/patient/dashboard" element={<ProtectedRoute allowedRole="patient"><PatientDashboard /></ProtectedRoute>} />
              <Route path="/patient/book-appointment" element={<ProtectedRoute allowedRole="patient"><BookAppointment /></ProtectedRoute>} />
              <Route path="/patient/appointments" element={<ProtectedRoute allowedRole="patient"><MyAppointments /></ProtectedRoute>} />
              <Route path="/patient/records" element={<ProtectedRoute allowedRole="patient"><MyRecords /></ProtectedRoute>} />
              <Route path="/patient/documents" element={<ProtectedRoute allowedRole="patient"><UploadDocuments /></ProtectedRoute>} />

              {/* Doctor Routes */}
              <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
              <Route path="/doctor/my-patients" element={<ProtectedRoute allowedRole="doctor"><MyPatients /></ProtectedRoute>} />
              <Route path="/doctor/patient/:patientId" element={<ProtectedRoute allowedRole="doctor"><PatientDetail /></ProtectedRoute>} />
              <Route path="/doctor/records/:appointmentId" element={<ProtectedRoute allowedRole="doctor"><MedicalRecordForm /></ProtectedRoute>} />
              <Route path="/doctor/invoice/:appointmentId" element={<ProtectedRoute allowedRole="doctor"><GenerateInvoice /></ProtectedRoute>} />
              <Route path="/doctor/insurance-verification" element={<ProtectedRoute allowedRole="doctor"><InsuranceVerification /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/doctors" element={<ProtectedRoute allowedRole="admin"><ManageDoctors /></ProtectedRoute>} />
              <Route path="/admin/patients" element={<ProtectedRoute allowedRole="admin"><ManagePatients /></ProtectedRoute>} />
              <Route path="/admin/billing" element={<ProtectedRoute allowedRole="admin"><BillingOverview /></ProtectedRoute>} />
              <Route path="/admin/insurance" element={<ProtectedRoute allowedRole="admin"><InsuranceManagement /></ProtectedRoute>} />
              <Route path="/admin/announcements" element={<ProtectedRoute allowedRole="admin"><Announcements /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute allowedRole="admin"><Analytics /></ProtectedRoute>} />

              {/* Default & Fallback Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Box>
        </Box>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

