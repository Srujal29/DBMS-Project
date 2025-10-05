import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  Stack,
} from '@mui/material';
import {
  CalendarMonth,
  Add,
  MedicalServices,
  CheckCircle,
  Pending,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import AppointmentCard from '../../components/AppointmentCard';
import PreventativeCare from './PreventativeCare'; // 1. IMPORT ADDED

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, appointmentsRes] = await Promise.all([
        api.get('/patient/my-profile'),
        api.get('/appointment/my-patient-appointments'),
      ]);

      setProfile(profileRes.data.profile);
      setAppointments(appointmentsRes.data.appointments);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(
    (app) => app.status === 'confirmed' || app.status === 'pending_approval' || app.status === 'pending_payment'
  );

  const completedAppointments = appointments.filter(
    (app) => app.status === 'completed'
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #4354b2 0%, #6e4ba2 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Welcome back, {profile?.name || user?.username}!
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Manage your appointments and health records all in one place
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* 2. PREVENTATIVE CARE COMPONENT ADDED */}
      <PreventativeCare />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Pending sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {upcomingAppointments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming Appointments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {completedAppointments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed Visits
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
         <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MedicalServices sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {appointments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Appointments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Quick Actions
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => navigate('/patient/book-appointment')}
            fullWidth
          >
            Book New Appointment
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<CalendarMonth />}
            onClick={() => navigate('/patient/appointments')}
            fullWidth
          >
            View All Appointments
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<MedicalServices />}
            onClick={() => navigate('/patient/records')}
            fullWidth
          >
            Medical Records
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Recent Appointments
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {appointments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CalendarMonth sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No appointments yet
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/patient/book-appointment')}
              sx={{ mt: 2 }}
            >
              Book Your First Appointment
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {appointments.slice(0, 3).map((appointment) => (
              <Grid item xs={12} key={appointment._id}>
                <AppointmentCard
                  appointment={appointment}
                  onAction={() => navigate('/patient/appointments')}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {appointments.length > 3 && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="text"
              onClick={() => navigate('/patient/appointments')}
            >
              View All Appointments
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PatientDashboard;

