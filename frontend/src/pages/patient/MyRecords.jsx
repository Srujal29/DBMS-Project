import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Card,
  CardContent,
  Grid,
  Divider,
} from '@mui/material';
import { MedicalServices, Person, CalendarMonth } from '@mui/icons-material';
import api from '../../services/api';

const MyRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medical-record/my-records');
      // --- FIX #1: Access the 'records' array inside the response data ---
      setRecords(response.data.records);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <MedicalServices sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              My Medical Records
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View your complete medical history
            </Typography>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {records.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <MedicalServices sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Medical Records Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your medical records will appear here after doctor consultations
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {records.map((record) => (
            <Grid item xs={12} key={record._id}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Medical Record
                    </Typography>
                    <Chip
                      label={formatDate(record.createdAt)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Person color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Doctor
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {/* --- FIX #2: Use 'doctor_id' --- */}
                            Dr. {record.doctor_id?.name || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <CalendarMonth color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Appointment Date
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {/* --- FIX #3: Use 'appointment_id' --- */}
                            {formatDate(record.appointment_id?.date)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Diagnosis
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, width: '100%' }}>
                        <Typography variant="body2">{record.diagnosis}</Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Treatment
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, width: '100%' }}>
                        <Typography variant="body2">{record.treatment}</Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Prescribed Medicine
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, width: '100%' }}>
                        {/* --- FIX #4: Use 'prescribed_medicine' and join the array --- */}
                        <Typography variant="body2">
                          {record.prescribed_medicine?.join(', ') || 'None'}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyRecords;
