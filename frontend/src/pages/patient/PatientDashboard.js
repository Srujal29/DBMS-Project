import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { 
    Typography, Paper, Grid, Box, CircularProgress, Card, CardContent, 
    Avatar, Divider, Button, Chip, Snackbar, Alert 
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';
import WcIcon from '@mui/icons-material/Wc';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentIcon from '@mui/icons-material/Payment';

const PatientDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const { user } = useContext(AuthContext);

    const fetchData = () => {
        if (user) {
            setLoading(true);
            Promise.all([
                api.get('/patient/my-profile'),
                api.get('/appointment/my-patient-appointments')
            ]).then(([profileRes, appointmentsRes]) => {
                setProfile(profileRes.data.profile);
                setAppointments(appointmentsRes.data.appointments);
            }).catch(err => {
                console.error("Failed to fetch dashboard data", err);
            }).finally(() => {
                setLoading(false);
            });
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handlePayment = async (appointmentId) => {
        try {
            const res = await api.put(`/appointment/confirm-payment/${appointmentId}`);
            setSnackbar({ open: true, message: res.data.message, severity: 'success' });
            fetchData(); // Refresh all data after payment
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Payment confirmation failed.';
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        }
    };
    
    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress size={48} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 0 } }}>
            {/* --- PROFILE SECTION --- */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>Patient Dashboard</Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                    Welcome to your personal health portal
                </Typography>
            </Box>
            {profile && (
                <Card sx={{ mb: 4 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}>
                                {(profile.name || '').split(' ').map(n => n[0]).join('').toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 600 }}>{profile.name}</Typography>
                                <Typography color="text.secondary">Patient Profile</Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* --- APPOINTMENTS SECTION --- */}
            <Box sx={{ my: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>My Appointments</Typography>
                {appointments.length > 0 ? (
                    <Grid container spacing={3}>
                        {appointments.map(app => (
                            <Grid item xs={12} md={6} key={app._id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">Dr. {app.doctor_id.name}</Typography>
                                        <Typography color="text.secondary">{app.doctor_id.specialization}</Typography>
                                        <Typography variant="body2" sx={{ my: 2 }}>On: {new Date(app.date).toLocaleDateString()} at {app.time}</Typography>
                                        
                                        <Chip 
                                            label={app.status.replace(/_/g, ' ')}
                                            color={app.status === 'confirmed' ? 'success' : 'info'}
                                            icon={app.status === 'confirmed' ? <CheckCircleIcon /> : <AccessTimeIcon />}
                                            sx={{ textTransform: 'capitalize' }}
                                        />

                                        {app.status === 'pending_payment' && (
                                            <Button
                                                variant="contained"
                                                startIcon={<PaymentIcon />}
                                                onClick={() => handlePayment(app._id)}
                                                sx={{ mt: 2, width: '100%' }}
                                            >
                                                Pay Now to Confirm
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Paper sx={{p: 4, textAlign: 'center', backgroundColor: 'grey.50'}}>
                       <Typography>You have no scheduled appointments.</Typography>
                    </Paper>
                )}
            </Box>
            
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PatientDashboard;