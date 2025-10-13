import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box, Typography } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';

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
const PatientProfile = () => <Box><Typography variant="h4">My Profile</Typography><Typography>This page is under construction.</Typography></Box>;


// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import MyPatients from './pages/doctor/MyPatients';
import PatientDetail from './pages/doctor/PatientDetail';
import MedicalRecordForm from './pages/doctor/MedicalRecordForm';
import GenerateInvoice from './pages/doctor/GenerateInvoice';
import InsuranceVerification from './pages/doctor/InsuranceVerfication';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManagePatients from './pages/admin/ManagePatients';
import BillingOverview from './pages/admin/BillingOverview';
import InsuranceManagement from './pages/admin/InsuranceManagement';
import Announcements from './pages/admin/Announcements';
import Analytics from './pages/admin/Analytics';


// --- Protected Route Wrapper ---
const ProtectedLayout = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Layout />; 
};


// --- Main App Component ---
function App() {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      {/* The <Router> component is removed from here. It should be in your main.jsx file. */}
      <AuthProvider>
        <Routes>
          {/* Public routes render outside the main layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* All protected routes are now nested inside the ProtectedLayout */}
          <Route path="/" element={<ProtectedLayout />}>
            {/* Patient Routes */}
            <Route path="patient/dashboard" element={<PatientDashboard />} />
            <Route path="patient/book-appointment" element={<BookAppointment />} />
            <Route path="patient/appointments" element={<MyAppointments />} />
            <Route path="patient/records" element={<MyRecords />} />
            <Route path="patient/documents" element={<UploadDocuments />} />
            <Route path="patient/profile" element={<PatientProfile />} />

            {/* Doctor Routes */}
            <Route path="doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="doctor/my-patients" element={<MyPatients />} />
            <Route path="doctor/patient/:patientId" element={<PatientDetail />} />
            <Route path="doctor/records/:appointmentId" element={<MedicalRecordForm />} />
            <Route path="doctor/insurance-verification" element={<InsuranceVerification />} />
            <Route path="doctor/invoice/:appointmentId" element={<GenerateInvoice />} />

            {/* Admin Routes */}
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/doctors" element={<ManageDoctors />} />
            <Route path="admin/patients" element={<ManagePatients />} />
            <Route path="admin/billing-overview" element={<BillingOverview />} />
            <Route path="admin/insurance" element={<InsuranceManagement />} />
            <Route path="admin/announcements" element={<Announcements />} />
            <Route path="admin/analytics" element={<Analytics />} />
          </Route>

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </CustomThemeProvider>
  );
}

export default App;

