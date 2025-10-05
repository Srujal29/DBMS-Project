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
} from '@mui/material';
import { Description, Save, ArrowBack } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MedicalRecordForm = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [existingRecord, setExistingRecord] = useState(null);
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatment: '',
    prescribed_medicine: '', // Match backend model
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAppointmentAndRecord = async () => {
      try {
        setLoading(true);
        // Fetch appointment details
        const appointmentRes = await api.get(`/appointment/${appointmentId}`);
        setAppointment(appointmentRes.data.appointment); // Correctly unwrap appointment data

        // Fetch existing medical record for this appointment
        const recordRes = await api.get(`/medical-record/appointment/${appointmentId}`);
        if (recordRes.data && recordRes.data.record) {
          const record = recordRes.data.record; // Correctly unwrap record data
          setExistingRecord(record);
          setFormData({
            diagnosis: record.diagnosis || '',
            treatment: record.treatment || '',
            prescribed_medicine: record.prescribed_medicine.join('\n') || '', // Match backend and join for textarea
          });
        }
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentAndRecord();
  }, [appointmentId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    // Prepare payload to match backend expectations
    const payload = {
      appointmentId,
      diagnosis: formData.diagnosis,
      treatment: formData.treatment,
      // Split the textarea content into an array of strings
      prescribed_medicine: formData.prescribed_medicine.split('\n').filter(Boolean),
    };

    try {
      await api.post('/medical-record/add', payload);
      setSuccess('Medical record saved successfully!');
      setTimeout(() => {
        navigate('/doctor/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medical record');
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
        <Alert severity="error">{error || 'Appointment not found'}</Alert>
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

      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Description sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              {existingRecord ? 'Update Medical Record' : 'Add Medical Record'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Document patient diagnosis and treatment
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Card variant="outlined" sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Appointment Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Patient Name
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {appointment.patient_id?.name}
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
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Reason for Visit
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {appointment.reason}
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
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                required
                multiline
                rows={4}
                helperText="Enter the patient's diagnosis"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Treatment"
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                required
                multiline
                rows={4}
                helperText="Describe the recommended treatment plan"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Prescribed Medicine"
                name="prescribed_medicine"
                value={formData.prescribed_medicine}
                onChange={handleChange}
                required
                multiline
                rows={3}
                helperText="List all prescribed medications with dosage (one per line)"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
              startIcon={<Save />}
            >
              {submitting ? 'Saving...' : existingRecord ? 'Update Record' : 'Save Record'}
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
      </Paper>
    </Container>
  );
};

export default MedicalRecordForm;
