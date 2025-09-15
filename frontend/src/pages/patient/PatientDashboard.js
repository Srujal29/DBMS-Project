import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { 
    Typography, Paper, Grid, Box, CircularProgress, Card, CardContent, 
    Avatar, Divider, Button, Chip, Alert, Snackbar
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';
import WcIcon from '@mui/icons-material/Wc';
import EventIcon from '@mui/icons-material/Event';
import PaymentIcon from '@mui/icons-material/Payment';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const StatusChip = ({ status }) => {
    let color, icon;
    switch (status) {
        case 'scheduled': 
            color = 'info'; 
            icon = <AccessTimeIcon sx={{ fontSize: 16 }} />;
            break;
        case 'completed': 
            color = 'success'; 
            icon = <MedicalServicesIcon sx={{ fontSize: 16 }} />;
            break;
        case 'cancelled': 
            color = 'error'; 
            break;
        case 'pending_approval':
            color = 'warning';
            icon = <AccessTimeIcon sx={{ fontSize: 16 }} />;
            break;
        case 'pending_payment':
            color = 'info';
            icon = <PaymentIcon sx={{ fontSize: 16 }} />;
            break;
        default: 
            color = 'default';
    }
    return (
        <Chip 
            label={status.replace('_', ' ')} 
            color={color} 
            size="small" 
            icon={icon}
            sx={{ 
                textTransform: 'capitalize',
                fontWeight: 600,
                '& .MuiChip-icon': { ml: 1 }
            }}
        />
    );
};

const PatientDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            Promise.all([
                api.get('/patient/my-profile'),
                api.get('/appointment/my-patient-appointments')
            ]).then(([profileRes, appointmentsRes]) => {
                setProfile(profileRes.data.profile);
                setAppointments(appointmentsRes.data.appointments);
                setLoading(false);
            }).catch(err => {
                console.error("Failed to fetch data", err);
                setLoading(false);
            });
        }
    }, [user]);

    const handleConfirmPayment = async (appointmentId) => {
        try {
            const res = await api.put(`/appointment/confirm-payment/${appointmentId}`);
            setAppointments(apps => apps.map(app => 
                app._id === appointmentId ? res.data.appointment : app
            ));
            setSnackbar({
                open: true,
                message: 'Payment confirmed successfully!',
                severity: 'success'
            });
        } catch (err) {
            console.error("Failed to confirm payment", err);
            setSnackbar({
                open: true,
                message: 'Failed to confirm payment',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress size={48} sx={{ color: '#42a5f5' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 0 } }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Patient Dashboard
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                    Welcome to your personal health portal
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Profile Section */}
                <Grid item xs={12} md={8}>
                    {profile ? (
                        <Card sx={{ height: 'fit-content', mb: 4 }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Avatar 
                                        sx={{ 
                                            width: 80, 
                                            height: 80, 
                                            mr: 3,
                                            background: 'linear-gradient(45deg, #42a5f5 30%, #80d6ff 90%)',
                                            color: '#0a0e27',
                                            fontSize: '2rem',
                                            fontWeight: 700
                                        }}
                                    >
                                        {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                            {profile.name}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            Patient Profile
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                <Divider sx={{ my: 3 }} />
                                
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            p: 2, 
                                            bgcolor: 'rgba(66, 165, 245, 0.1)', 
                                            borderRadius: 2,
                                            border: '1px solid rgba(66, 165, 245, 0.2)'
                                        }}>
                                            <CakeIcon sx={{ mr: 2, color: 'primary.main' }} />
                                            <Box>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Age
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    {profile.age} years
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            p: 2, 
                                            bgcolor: 'rgba(66, 165, 245, 0.1)', 
                                            borderRadius: 2,
                                            border: '1px solid rgba(66, 165, 245, 0.2)'
                                        }}>
                                            <WcIcon sx={{ mr: 2, color: 'primary.main' }} />
                                            <Box>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Gender
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                                                    {profile.gender}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            p: 2, 
                                            bgcolor: 'rgba(66, 165, 245, 0.1)', 
                                            borderRadius: 2,
                                            border: '1px solid rgba(66, 165, 245, 0.2)'
                                        }}>
                                            <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                                            <Box>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    Contact Number
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    {profile.contact}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card sx={{ textAlign: 'center', py: 6, mb: 4 }}>
                            <CardContent>
                                <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" sx={{ mb: 1 }}>
                                    Profile Not Found
                                </Typography>
                                <Typography color="text.secondary">
                                    Unable to load your profile information
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                    
                    {/* Appointments Section */}
                    <Card>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                                My Appointments
                            </Typography>
                            
                            {appointments.length > 0 ? (
                                <Grid container spacing={3}>
                                    {appointments.map(app => (
                                        <Grid item xs={12} key={app._id}>
                                            <Card 
                                                variant="outlined" 
                                                sx={{ 
                                                    p: 2,
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    background: 'rgba(255, 255, 255, 0.05)'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                                                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                                Dr. {app.doctor_id.name}
                                                            </Typography>
                                                        </Box>
                                                        
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                                                            <EventIcon sx={{ mr: 1, fontSize: 20 }} />
                                                            <Typography variant="body2">
                                                                {app.date} at {app.time}
                                                            </Typography>
                                                        </Box>
                                                        
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                            <strong>Reason:</strong> {app.reason}
                                                        </Typography>
                                                        
                                                        <StatusChip status={app.status} />
                                                    </Box>
                                                    
                                                    <Box sx={{ ml: 2 }}>
                                                        {app.status === 'pending_payment' && (
                                                            <Button
                                                                variant="contained"
                                                                color="success"
                                                                startIcon={<PaymentIcon />}
                                                                onClick={() => handleConfirmPayment(app._id)}
                                                                size="small"
                                                            >
                                                                Pay Now
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <EventIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        No Appointments
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Your appointments will appear here
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                
                {/* Quick Actions Sidebar */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ 
                        background: 'linear-gradient(135deg, #42a5f5 0%, #2196f3 100%)',
                        color: 'white',
                        height: 'fit-content' 
                    }}>
                        <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <PersonIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                                Quick Actions
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Use the navigation above to find doctors, book appointments, or view your medical records
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PatientDashboard;