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
  Pending,
  EventAvailable,
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
  
  // A single dialog for all confirmation actions
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointment/my-appointments');
      setAppointments(response.data.appointments || []);
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
  
  const handleActionConfirm = () => {
    confirmDialog.onConfirm();
    setConfirmDialog({ open: false, title: '', description: '', onConfirm: () => {} });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, title: '', description: '', onConfirm: () => {} });
  }

  const handleManageRequest = (appointmentId, action) => {
    setConfirmDialog({
        open: true,
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} Appointment`,
        description: `Are you sure you want to ${action} this appointment request? The patient will be notified.`,
        onConfirm: async () => {
            try {
              await api.put(`/appointment/manage-request/${appointmentId}`, { action });
              setSuccess(`Appointment ${action}d successfully!`);
              fetchAppointments();
              setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
              setError(err.response?.data?.message || 'Failed to manage appointment request.');
            }
        }
    });
  };

  const handleUpdateStatus = (appointmentId, status) => {
     setConfirmDialog({
        open: true,
        title: `Mark Appointment as ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        description: `Are you sure you want to mark this appointment as ${status}? This action cannot be undone.`,
        onConfirm: async () => {
             try {
                await api.put(`/appointment/${appointmentId}/status`, { status });
                setSuccess(`Appointment marked as ${status} successfully!`);
                fetchAppointments();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError(err.response?.data?.message || `Failed to mark appointment as ${status}.`);
            }
        }
    });
  };

  const pendingAppointments = appointments.filter((app) => app.status === 'pending_approval');
  const upcomingAppointments = appointments.filter((app) => app.status === 'confirmed');
  const completedAppointments = appointments.filter((app) => app.status === 'completed');

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Dashboard sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>Doctor Dashboard</Typography>
            <Typography variant="body2" color="text.secondary">Manage your appointments and patients</Typography>
          </Box>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper elevation={3}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={<Box>Pending Approval <Chip label={pendingAppointments.length} size="small" color="warning" /></Box>} />
          <Tab label={<Box>Upcoming <Chip label={upcomingAppointments.length} size="small" color="primary" /></Box>} />
          <Tab label={<Box>Completed <Chip label={completedAppointments.length} size="small" color="success" /></Box>} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Box>
              {pendingAppointments.length === 0 ? (<Typography align="center" color="text.secondary">No pending appointment requests.</Typography>) : (
                pendingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    actionButtons={[
                      { label: 'Approve', variant: 'contained', color: 'success', action: 'approve', icon: <CheckCircle /> },
                      { label: 'Decline', variant: 'outlined', color: 'error', action: 'decline', icon: <Cancel /> },
                    ]}
                    onAction={(action, app) => handleManageRequest(app._id, action)}
                  />
                ))
              )}
            </Box>
          )}
          
          {tabValue === 1 && (
             <Box>
                {upcomingAppointments.length === 0 ? (<Typography align="center" color="text.secondary">No upcoming appointments.</Typography>) : (
                    upcomingAppointments.map((appointment) => (
                        <AppointmentCard 
                            key={appointment._id} 
                            appointment={appointment} 
                            actionButtons={[
                                { label: 'Add/View Record', variant: 'outlined', color: 'primary', action: 'record', icon: <Description /> },
                                { label: 'Mark as Completed', variant: 'contained', color: 'success', action: 'complete', icon: <EventAvailable /> },
                            ]}
                            onAction={(action, app) => {
                                if (action === 'record') navigate(`/doctor/records/${app._id}`);
                                if (action === 'complete') handleUpdateStatus(app._id, 'completed');
                            }}
                        />
                    ))
                )}
             </Box>
          )}

          {tabValue === 2 && (
            <Box>
              {completedAppointments.length === 0 ? (<Typography align="center" color="text.secondary">No completed appointments.</Typography>) : (
                completedAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                    actionButtons={
                      !appointment.invoice ? 
                      [
                        { label: 'Generate Invoice', variant: 'contained', color: 'secondary', action: 'invoice', icon: <Receipt /> }
                      ] : [
                        { label: 'Invoice Sent', variant: 'outlined', color: 'secondary', disabled: true }
                      ]
                    }
                    onAction={(action, app) => navigate(`/doctor/invoice/${app._id}`)}
                  />
                ))
              )}
            </Box>
          )}
        </Box>
      </Paper>

        <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{confirmDialog.description}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={closeConfirmDialog}>Cancel</Button>
                <Button onClick={handleActionConfirm} autoFocus>Confirm</Button>
            </DialogActions>
        </Dialog>
    </Container>
  );
};

export default DoctorDashboard;

