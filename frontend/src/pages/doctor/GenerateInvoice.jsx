import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material';
import { Receipt, Save, ArrowBack, AttachMoney } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const GenerateInvoice = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/appointment/${appointmentId}`);
      setAppointment(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setSubmitting(true);

    try {
      await api.post(`/billing/${appointmentId}`, {
        amount: parseFloat(amount),
      });
      setSuccess('Invoice generated successfully!');
      setTimeout(() => {
        navigate('/doctor/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setSubmitting(false);
    }
  };

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

  if (!appointment) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Appointment not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/doctor/dashboard')}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Receipt sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Generate Invoice
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create billing invoice for completed appointment
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Card variant="outlined" sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Appointment Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Patient Name
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {appointment.patientId?.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Appointment Date
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {new Date(appointment.date).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Time
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {appointment.time}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {appointment.status?.toUpperCase()}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Billing Amount"
            name="amount"
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
            required
            inputProps={{
              min: 0,
              step: 0.01,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoney />
                </InputAdornment>
              ),
            }}
            helperText="Enter the total consultation and treatment charges"
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
              startIcon={<Save />}
            >
              {submitting ? 'Generating...' : 'Generate Invoice'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/doctor/dashboard')}
              disabled={submitting}
            >
              Cancel
            </Button>
          </Box>
        </form>

        <Box sx={{ mt: 4, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
          <Typography variant="caption" color="primary" fontWeight={600}>
            Note:
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            Once the invoice is generated, the patient will be able to view and confirm payment.
            The appointment status will be updated to "pending_payment".
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default GenerateInvoice;