import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Psychology } from '@mui/icons-material';
import api from '../../services/api';

const AIInsights = () => {
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ai/staffing-recommendations');
      setRecommendation(response.data.recommendation || 'No insights available at this time.');
      setError('');
    } catch (err) {
      setError('Could not fetch AI insights.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Psychology sx={{ fontSize: 30, color: 'secondary.main', mr: 2 }} />
        <Typography variant="h6" fontWeight={600}>
          AI-Powered Recommendations
        </Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box>
            <Chip label="Predictive Staffing" color="secondary" size="small" sx={{ mb: 2 }}/>
            <Typography variant="body1">
             {recommendation}
            </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AIInsights;
