import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import { CalendarMonth, Payment, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AppointmentCard from '../../components/AppointmentCard';

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointment/my-patient-appointments');
      setAppointments(response.data.appointments);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleConfirmPayment = async (appointmentId) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.put(`/appointment/confirm-payment/${appointmentId}`);
      setSuccess('Payment confirmed successfully!');
      fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.put(`/appointment/${appointmentId}/status`, { status: 'cancelled' });
      setSuccess('Appointment cancelled successfully!');
      fetchAppointments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setSubmitting(false);
    }
  };


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const upcomingAppointments = appointments.filter(
    (app) => app.status === 'confirmed' || app.status === 'pending_approval'
  );

  const pendingPaymentAppointments = appointments.filter(
    (app) => app.status === 'pending_payment'
  );

  const pastAppointments = appointments.filter(
    (app) => app.status === 'completed' || app.status === 'cancelled' || app.status === 'declined'
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
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarMonth sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              My Appointments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage all your appointments
            </Typography>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper elevation={3}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Upcoming
                <Chip label={upcomingAppointments.length} size="small" color="primary" />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Pending Payment
                <Chip label={pendingPaymentAppointments.length} size="small" color="warning" />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Past
                <Chip label={pastAppointments.length} size="small" />
              </Box>
            }
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Upcoming Appointments
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {upcomingAppointments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No upcoming appointments
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/patient/book-appointment')}
                  >
                    Book New Appointment
                  </Button>
                </Box>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    actionButtons={[
                      {
                        label: 'Cancel Appointment',
                        variant: 'outlined',
                        color: 'error',
                        action: 'cancel',
                        icon: <Cancel />,
                        disabled: submitting,
                      },
                    ]}
                    onAction={(action, app) => handleCancelAppointment(app._id)}
                  />
                ))
              )}
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Appointments Pending Payment
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {pendingPaymentAppointments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No pending payments
                  </Typography>
                </Box>
              ) : (
                pendingPaymentAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    actionButtons={[
                      {
                        label: 'Confirm Payment',
                        variant: 'contained',
                        color: 'success',
                        action: 'payment',
                        icon: <Payment />,
                        disabled: submitting,
                      },
                      {
                        label: 'Cancel Appointment',
                        variant: 'outlined',
                        color: 'error',
                        action: 'cancel',
                        icon: <Cancel />,
                        disabled: submitting,
                      },
                    ]}
                    onAction={(action, app) => {
                      if (action === 'payment') {
                        handleConfirmPayment(app._id);
                      } else if (action === 'cancel') {
                        handleCancelAppointment(app._id);
                      }
                    }}
                  />
                ))
              )}
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Past Appointments
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {pastAppointments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No past appointments
                  </Typography>
                </Box>
              ) : (
                pastAppointments.map((appointment) => (
                  <AppointmentCard key={appointment._id} appointment={appointment} />
                ))
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default MyAppointments;

