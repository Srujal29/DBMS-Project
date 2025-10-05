import React, { useState, useEffect } from 'react';
import {
  Alert,
  CircularProgress,
  Box,
  Typography,
  Button
} from '@mui/material';
import { HealthAndSafety } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PreventativeCare = () => {
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        setLoading(true);
        const response = await api.get('/ai/preventative-care');
        setRecommendation(response.data.recommendation || '');
        setError('');
      } catch (err) {
        setError('Could not fetch personalized health recommendation.');
        console.error("Preventative Care Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendation();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, mb: 2 }}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary">Loading personalized health tips...</Typography>
      </Box>
    );
  }

  if (error || !recommendation) return null;

  return (
    <Alert 
      severity="info" 
      icon={<HealthAndSafety fontSize="inherit" />}
      action={
        <Button color="primary" size="small" onClick={() => navigate('/patient/book-appointment')}>
          Book Appointment
        </Button>
      }
      sx={{ mb: 3, alignItems: 'center' }}
    >
      <Typography fontWeight="bold">Personalized Health Recommendation:</Typography>
      <Typography variant="body2">{recommendation}</Typography>
    </Alert>
  );
};

export default PreventativeCare;

