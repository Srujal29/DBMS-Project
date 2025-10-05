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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Dashboard,
  CheckCircle,
  Cancel,
  Description,
  Receipt,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AppointmentCard from '../../components/AppointmentCard';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    appointmentId: null,
    action: null,
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointment/my-appointments');
      // FIX: Access the .appointments array from the response object
      setAppointments(response.data.appointments);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openConfirmDialog = (appointmentId, action) => {
    setConfirmDialog({
      open: true,
      appointmentId,
      action,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      appointmentId: null,
      action: null,
    });
  };

  const handleManageRequest = async () => {
    try {
      const { appointmentId, action } = confirmDialog;
      // FIX: The backend expects an 'action' field in the body, not 'status'
      await api.put(`/appointment/manage-request/${appointmentId}`, { action });
      setSuccess(`Appointment ${action}d successfully!`);
      fetchAppointments();
      closeConfirmDialog();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to manage appointment');
      closeConfirmDialog();
    }
  };

  const pendingAppointments = appointments.filter(
    (app) => app.status === 'pending_approval'
  );

  // FIX: Upcoming appointments are those that have been paid for and are 'confirmed'
  const upcomingAppointments = appointments.filter(
    (app) => app.status === 'confirmed'
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
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Dashboard sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Doctor Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your appointments and patients
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
                Pending Approval
                <Chip label={pendingAppointments.length} size="small" color="warning" />
              </Box>
            }
          />
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
                Completed
                <Chip label={completedAppointments.length} size="small" color="success" />
              </Box>
            }
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Appointments Awaiting Approval
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {pendingAppointments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No pending appointment requests
                  </Typography>
                </Box>
              ) : (
                pendingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    actionButtons={[
                      {
                        label: 'Approve',
                        variant: 'contained',
                        color: 'success',
                        action: 'approve',
                        icon: <CheckCircle />,
                      },
                      {
                        label: 'Decline',
                        variant: 'outlined',
                        color: 'error',
                        action: 'decline',
                        icon: <Cancel />,
                      },
                    ]}
                    onAction={(action, app) => openConfirmDialog(app._id, action)}
                  />
                ))
              )}
            </Box>
          )}

          {tabValue === 1 && (
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
                </Box>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    actionButtons={[
                      {
                        label: 'Add/View Medical Record',
                        variant: 'contained',
                        color: 'primary',
                        action: 'record',
                        icon: <Description />,
                      },
                    ]}
                    onAction={(action, app) =>
                      navigate(`/doctor/records/${app._id}`)
                    }
                  />
                ))
              )}
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Completed Appointments
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {completedAppointments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No completed appointments
                  </Typography>
                </Box>
              ) : (
                completedAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    actionButtons={
                      // FIX: Check for the 'invoice' object, not 'billingId'
                      !appointment.invoice
                        ? [
                            {
                              label: 'Generate Invoice',
                              variant: 'contained',
                              color: 'secondary',
                              action: 'invoice',
                              icon: <Receipt />,
                            },
                          ]
                        : []
                    }
                    onAction={(action, app) =>
                      navigate(`/doctor/invoice/${app._id}`)
                    }
                  />
                ))
              )}
            </Box>
          )}
        </Box>
      </Paper>

      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
        <DialogTitle>
          {confirmDialog.action === 'approve' ? 'Approve Appointment' : 'Decline Appointment'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.action === 'approve'
              ? 'Are you sure you want to approve this appointment? The patient will be notified to make a payment.'
              : 'Are you sure you want to decline this appointment? The patient will be notified.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleManageRequest}
            color={confirmDialog.action === 'approve' ? 'success' : 'error'}
            variant="contained"
            autoFocus
          >
            {confirmDialog.action === 'approve' ? 'Approve' : 'Decline'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DoctorDashboard;
