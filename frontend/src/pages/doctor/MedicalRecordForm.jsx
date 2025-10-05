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
} from '@mui/material';
import { Description, Save, ArrowBack, Psychology } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown'; // 1. Import the markdown renderer
import api from '../../services/api';

const MedicalRecordForm = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [existingRecord, setExistingRecord] = useState(null);
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatment: '',
    prescribed_medicine: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // New state for AI suggestions
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  useEffect(() => {
    fetchAppointmentAndRecord();
  }, [appointmentId]);

  const fetchAppointmentAndRecord = async () => {
    try {
      setLoading(true);
      const appointmentRes = await api.get(`/appointment/${appointmentId}`);
      setAppointment(appointmentRes.data.appointment);

      const recordRes = await api.get(`/medical-record/appointment/${appointmentId}`);
      if (recordRes.data.record) {
        const record = recordRes.data.record;
        setExistingRecord(record);
        setFormData({
          diagnosis: record.diagnosis || '',
          treatment: record.treatment || '',
          prescribed_medicine: Array.isArray(record.prescribed_medicine) ? record.prescribed_medicine.join(', ') : '',
        });
      }
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Handler for the AI suggestion button
  const handleGetSuggestion = async () => {
    if (!formData.diagnosis.trim()) {
      setError("Please enter symptoms in the diagnosis field first.");
      return;
    }
    setSuggestionLoading(true);
    setAiSuggestion(null);
    setError('');
    try {
        const response = await api.post('/ai/diagnosis-suggestion', { symptoms: formData.diagnosis });
        setAiSuggestion(response.data);
    } catch(err) {
        setError("Failed to get AI suggestion.");
    } finally {
        setSuggestionLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.post('/medical-record/add', {
        appointmentId,
        ...formData,
        prescribed_medicine: formData.prescribed_medicine.split(',').map(item => item.trim())
      });
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!appointment) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Appointment not found or you are not authorized to view it.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Description sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              {existingRecord ? 'Update Medical Record' : 'Add Medical Record'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              For patient: {appointment.patient_id.name}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />

        {error && ( <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert> )}
        {success && ( <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                 <Typography variant="h6" sx={{ flexGrow: 1 }}>Diagnosis / Symptoms</Typography>
                 <Button 
                    variant="outlined" 
                    startIcon={<Psychology />} 
                    onClick={handleGetSuggestion}
                    disabled={suggestionLoading}
                 >
                    {suggestionLoading ? 'Analyzing...' : 'Get AI Suggestion'}
                 </Button>
              </Box>
              <TextField
                fullWidth
                label="Diagnosis / Patient Symptoms"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                required
                multiline
                rows={4}
                helperText="Enter patient's symptoms or final diagnosis here."
              />
            </Grid>
            
            {/* 2. UPDATED: AI Suggestion Box now uses ReactMarkdown for clean rendering */}
            {aiSuggestion && (
                <Grid item xs={12}>
                    <Alert 
                        severity={aiSuggestion.probability === 'Critical' ? 'error' : 'info'} 
                        icon={<Psychology />}
                        sx={{ '& .MuiAlert-message': { width: '100%' } }}
                    >
                        <Typography fontWeight="bold">AI Suggestion (Probability: {aiSuggestion.probability})</Typography>
                        <ReactMarkdown
                            components={{
                                h3: ({node, ...props}) => <Typography variant="subtitle1" fontWeight="bold" sx={{mt: 1.5, mb: 0.5}} {...props} />,
                                p: ({node, ...props}) => <Typography variant="body2" component="p" {...props} />,
                                li: ({node, ...props}) => <li><Typography variant="body2" component="span" {...props} /></li>,
                                strong: ({node, ...props}) => <Typography component="span" fontWeight="bold" {...props} />,
                            }}
                        >
                          {aiSuggestion.suggestion}
                        </ReactMarkdown>
                    </Alert>
                </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>Treatment Plan</Typography>
              <TextField
                fullWidth
                label="Treatment"
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                required
                multiline
                rows={4}
                helperText="Describe the recommended treatment plan."
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>Prescribed Medicine</Typography>
              <TextField
                fullWidth
                label="Prescribed Medicine"
                name="prescribed_medicine"
                value={formData.prescribed_medicine}
                onChange={handleChange}
                required
                multiline
                rows={3}
                helperText="List all prescribed medications, separated by commas."
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/doctor/dashboard')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={<Save />}
            >
              {submitting ? 'Saving...' : existingRecord ? 'Update Record' : 'Save Record'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default MedicalRecordForm;

