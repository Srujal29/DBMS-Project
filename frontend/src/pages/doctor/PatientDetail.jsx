import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Avatar,
  Chip,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Phone,
  Cake,
  Home,
  ArrowBack,
  CalendarMonth,
  MedicalServices,
  CheckCircle,
  InsertDriveFile,
  Visibility,
  Warning,
  HealthAndSafety,
  Favorite,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import AppointmentCard from '../../components/AppointmentCard';

// UPDATED: RiskScoreDisplay component is now even more compact
const RiskScoreDisplay = ({ riskData }) => {
    const getRiskColor = (level) => {
        if (level === 'High') return 'error';
        if (level === 'Moderate') return 'warning';
        return 'success';
    };

    return (
        <Card sx={{ mb: 3 }} variant="outlined">
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>AI Patient Risk Assessment</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                     {/* Reduced font size further */}
                     <Typography variant="h5" fontWeight={700} color={`${getRiskColor(riskData.riskLevel)}.main`}>
                        {riskData.riskScore}
                    </Typography>
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
                             <Typography variant="body2">Risk Level:</Typography>
                             <Chip icon={riskData.riskLevel === 'High' ? <Warning/> : <HealthAndSafety/>} label={riskData.riskLevel} color={getRiskColor(riskData.riskLevel)} size="small" />
                        </Box>
                        <LinearProgress variant="determinate" value={riskData.riskScore} color={getRiskColor(riskData.riskLevel)} sx={{ height: 8, borderRadius: 5 }}/>
                    </Box>
                </Box>
                <Alert severity={getRiskColor(riskData.riskLevel)} icon={<Favorite fontSize="small" />} sx={{ p: 1, mb: 1.5, alignItems: 'center' }}>
                    <Box>
                        <Typography variant="caption" fontWeight="bold" display="block">AI Recommendation:</Typography>
                        <Typography variant="caption">{riskData.recommendation}</Typography>
                    </Box>
                </Alert>
                 <Box>
                    <Typography variant="caption" fontWeight="bold">Contributing Factors:</Typography>
                    <List dense sx={{p:0}}>
                        {riskData.factors.map((factor, index) => (
                            <ListItem key={index} sx={{ py: 0, pl: 2 }}>
                                <ListItemText primary={<Typography variant="caption">&bull; {factor}</Typography>} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </CardContent>
        </Card>
    );
};


const PatientDetail = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const [patientRes, appointmentsRes, recordsRes, documentsRes, riskRes] = await Promise.all([
        api.get(`/patient/${patientId}`),
        api.get(`/appointment/patient/${patientId}`),
        api.get(`/medical-record/patient/${patientId}`),
        api.get(`/patient/${patientId}/documents`),
        api.get(`/ai/patient-risk-score/${patientId}`),
      ]);

      setPatient(patientRes.data.patient);
      setAppointments(appointmentsRes.data.appointments);
      setMedicalRecords(recordsRes.data.records);
      setDocuments(documentsRes.data.documents);
      setRiskData(riskRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load patient details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetails();
  }, [patientId]);

  const handleCompleteAppointment = async (appointmentId) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await api.put(`/appointment/${appointmentId}/status`, { status: 'completed' });
      setSuccess('Appointment marked as completed!');
      fetchPatientDetails();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleViewDocument = (fileUrl) => {
      window.open(fileUrl, '_blank');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!patient) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Patient not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/doctor/my-patients')} sx={{ mb: 2 }}>
        Back to Patients
      </Button>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      
      {riskData && <RiskScoreDisplay riskData={riskData} />}

      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: '2.5rem' }}>
              {patient.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" fontWeight={600} gutterBottom>{patient.name}</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              <Chip label={patient.gender} color="primary" size="small" />
              <Chip label={`${appointments.length} Appointments`} color="success" size="small" />
              <Chip label={`${medicalRecords.length} Records`} color="info" size="small" />
              <Chip label={`${documents.length} Documents`} color="secondary" size="small" />
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Phone color="action" /><Box><Typography variant="caption" color="text.secondary">Contact</Typography><Typography variant="body1">{patient.contact_no}</Typography></Box></Box></Grid>
            <Grid item xs={12} sm={6} md={3}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Cake color="action" /><Box><Typography variant="caption" color="text.secondary">Date of Birth</Typography><Typography variant="body1">{formatDate(patient.dob)}</Typography></Box></Box></Grid>
            <Grid item xs={12} sm={12} md={6}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Home color="action" /><Box><Typography variant="caption" color="text.secondary">Address</Typography><Typography variant="body1">{patient.address}</Typography></Box></Box></Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
            <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexShrink: 0 }}><CalendarMonth color="primary" /><Typography variant="h6" fontWeight={600}>Appointment History</Typography></Box>
                <Divider sx={{ mb: 2, flexShrink: 0 }} />
                <Box sx={{ overflowY: 'auto', pr: 1, maxHeight: '500px' }}>
                    {appointments.length === 0 ? <Box sx={{ textAlign: 'center', py: 3 }}><Typography variant="body2" color="text.secondary">No appointments found.</Typography></Box> : (
                        appointments.map((appointment) => (
                            <Box key={appointment._id} sx={{ mb: 2 }}>
                                <AppointmentCard appointment={appointment} actionButtons={['confirmed'].includes(appointment.status) ? [{ label: 'Mark as Completed', variant: 'contained', color: 'success', action: 'complete', icon: <CheckCircle />, disabled: submitting }] : []} onAction={(action, app) => {if (action === 'complete') {handleCompleteAppointment(app._id);}}}/>
                            </Box>
                        ))
                    )}
                </Box>
            </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
            <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexShrink: 0 }}><MedicalServices color="primary" /><Typography variant="h6" fontWeight={600}>Medical Records</Typography></Box>
                <Divider sx={{ mb: 2, flexShrink: 0 }} />
                <Box sx={{ overflowY: 'auto', pr: 1, maxHeight: '500px' }}>
                    {medicalRecords.length === 0 ? <Box sx={{ textAlign: 'center', py: 3 }}><Typography variant="body2" color="text.secondary">No medical records found.</Typography></Box> : (
                        medicalRecords.map((record) => (<Card key={record._id} sx={{ mb: 2 }}><CardContent><Typography variant="caption" color="text.secondary">{formatDate(record.createdAt)}</Typography><Typography variant="subtitle1" fontWeight={600} gutterBottom>Diagnosis</Typography><Typography variant="body2" paragraph>{record.diagnosis}</Typography><Typography variant="subtitle1" fontWeight={600} gutterBottom>Treatment</Typography><Typography variant="body2" paragraph>{record.treatment}</Typography><Typography variant="subtitle1" fontWeight={600} gutterBottom>Prescribed Medicine</Typography><Typography variant="body2">{Array.isArray(record.prescribed_medicine) ? record.prescribed_medicine.join(', ') : 'N/A'}</Typography></CardContent></Card>))
                    )}
                </Box>
            </Paper>
        </Grid>
        
        <Grid item xs={12} lg={4}>
            <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexShrink: 0 }}><InsertDriveFile color="primary" /><Typography variant="h6" fontWeight={600}>Patient Documents</Typography></Box>
                <Divider sx={{ mb: 2, flexShrink: 0 }} />
                <Box sx={{ overflowY: 'auto', maxHeight: '500px' }}>
                    {documents.length === 0 ? <Box sx={{ textAlign: 'center', py: 3 }}><Typography variant="body2" color="text.secondary">No documents uploaded.</Typography></Box> : (
                        <List>
                            {documents.map((doc) => (
                                <ListItem key={doc._id} secondaryAction={<IconButton edge="end" aria-label="view" onClick={() => handleViewDocument(doc.fileUrl)}><Visibility /></IconButton>}>
                                    <ListItemAvatar><Avatar><InsertDriveFile /></Avatar></ListItemAvatar>
                                    <ListItemText primary={doc.fileName} secondary={`Uploaded: ${formatDate(doc.uploadDate)}`} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PatientDetail;

