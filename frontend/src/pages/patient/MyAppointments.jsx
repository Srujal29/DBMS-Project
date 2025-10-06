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
import { CalendarMonth, Payment, CheckCircle, Download, Cancel } from '@mui/icons-material';
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

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointment/my-patient-appointments');
      setAppointments(response.data.appointments || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (billId) => {
      if(submitting) return;
      setSubmitting(true);
      try {
          await api.put(`/billing/${billId}/status`, { status: 'paid' });
          setSuccess('Payment successful! Thank you.');
          fetchAppointments(); // Refresh the list
          setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
          setError(err.response?.data?.message || 'Failed to process payment.');
      } finally {
          setSubmitting(false);
      }
  };
  
  // CORRECTED: This function now makes an authenticated request to download the file.
  const handleDownloadInvoice = async (billId) => {
    try {
      const response = await api.get(`/billing/${billId}/download`, {
        responseType: 'blob', // Important: Tell Axios to expect a file
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${billId}.pdf`); // Set the filename
      
      // Append to the document, click, and then remove
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

    } catch (err) {
      setError('Failed to download invoice.');
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

  const pendingApproval = appointments.filter((app) => app.status === 'pending_approval');
  const upcomingAppointments = appointments.filter((app) => app.status === 'confirmed');
  const completedWithUnpaidBill = appointments.filter((app) => app.status === 'completed' && app.billing?.status === 'unpaid');
  const pastAppointments = appointments.filter((app) => app.status === 'completed' && app.billing?.status === 'paid');
  const cancelledAppointments = appointments.filter((app) => ['cancelled', 'declined'].includes(app.status));


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
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
            <Typography variant="h4" fontWeight={600}>My Appointments</Typography>
            <Typography variant="body2" color="text.secondary">View and manage all your appointments</Typography>
          </Box>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper elevation={3}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label={<Box>Pending Approval <Chip label={pendingApproval.length} size="small" /></Box>} />
          <Tab label={<Box>Pending Payment <Chip label={completedWithUnpaidBill.length} size="small" color="warning" /></Box>} />
          <Tab label={<Box>Upcoming <Chip label={upcomingAppointments.length} size="small" color="primary" /></Box>} />
          <Tab label={<Box>History <Chip label={pastAppointments.length + cancelledAppointments.length} size="small" color="success" /></Box>} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
              <Box>
                {pendingApproval.length === 0 ? <Typography align="center" color="text.secondary">No appointments awaiting doctor's approval.</Typography> : 
                pendingApproval.map((app) => (
                    <AppointmentCard 
                        key={app._id} 
                        appointment={app} 
                        actionButtons={[{ label: 'Cancel Request', variant: 'outlined', color: 'error', action: 'cancel', icon: <Cancel />, disabled: submitting }]}
                        onAction={() => handleCancelAppointment(app._id)}
                    />
                ))}
              </Box>
          )}
          {tabValue === 1 && (
              <Box>
                {completedWithUnpaidBill.length === 0 ? <Typography align="center" color="text.secondary">No pending payments.</Typography> : 
                  completedWithUnpaidBill.map((app) => (
                      <AppointmentCard 
                        key={app._id} 
                        appointment={app} 
                        actionButtons={[{ label: `Pay Now ($${app.billing.amount})`, variant: 'contained', color: 'success', action: 'postpay', icon: <Payment />, disabled: submitting }]} 
                        onAction={() => handlePayInvoice(app.billing._id)} 
                      />
                  ))}
              </Box>
          )}
          {tabValue === 2 && (
              <Box>
                {upcomingAppointments.length === 0 ? <Typography align="center" color="text.secondary">No upcoming appointments.</Typography> : 
                upcomingAppointments.map((app) => (
                    <AppointmentCard 
                        key={app._id} 
                        appointment={app} 
                        actionButtons={[{ label: 'Cancel Appointment', variant: 'outlined', color: 'error', action: 'cancel', icon: <Cancel />, disabled: submitting }]}
                        onAction={() => handleCancelAppointment(app._id)}
                    />
                ))}
              </Box>
          )}
          {tabValue === 3 && (
              <Box>
                {pastAppointments.length === 0 && cancelledAppointments.length === 0 ? <Typography align="center" color="text.secondary">No appointments in your history.</Typography> : 
                <>
                    {pastAppointments.map((app) => (
                        <AppointmentCard 
                            key={app._id} 
                            appointment={app} 
                            actionButtons={[{ label: 'Download Invoice', variant: 'outlined', color: 'primary', action: 'download', icon: <Download /> }]}
                            onAction={() => handleDownloadInvoice(app.billing._id)}
                        />
                    ))}
                    {cancelledAppointments.map((app) => <AppointmentCard key={app._id} appointment={app} />)}
                </>
                }
              </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default MyAppointments;

