import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Typography, Grid, Card, CardContent, Select, MenuItem, FormControl, 
    InputLabel, Chip, Box, CircularProgress, Snackbar, Alert 
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
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
        default: 
            color = 'default';
    }
    return (
        <Chip 
            label={status} 
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

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        api.get('/appointment/my-appointments')
            .then(res => {
                setAppointments(res.data.appointments);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch appointments", err);
                setLoading(false);
            });
    }, []);

    const handleStatusUpdate = async (appointmentId, status) => {
        try {
            const res = await api.put(`/appointment/${appointmentId}/status`, { status });
            setAppointments(apps => apps.map(app => 
                app._id === appointmentId ? res.data.appointment : app
            ));
            setSnackbar({
                open: true,
                message: `Appointment status updated to ${status}`,
                severity: 'success'
            });
        } catch (err) {
            console.error("Failed to update status", err);
            setSnackbar({
                open: true,
                message: 'Failed to update appointment status',
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
                <CircularProgress size={48} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 0 } }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Doctor Dashboard
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                    Manage your appointments and patient consultations
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {appointments.length > 0 ? appointments.map(app => (
                    <Grid item xs={12} md={6} lg={4} key={app._id}>
                        <Card sx={{ height: '100%', position: 'relative' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {app.patient_id.name}
                                    </Typography>
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                                    <EventIcon sx={{ mr: 1, fontSize: 20 }} />
                                    <Typography variant="body2">
                                        {app.date} at {app.time}
                                    </Typography>
                                </Box>
                                
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                        Reason for Visit:
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {app.reason}
                                    </Typography>
                                </Box>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <StatusChip status={app.status} />
                                </Box>
                                
                                <FormControl fullWidth size="small">
                                    <InputLabel>Update Status</InputLabel>
                                    <Select 
                                        value={app.status} 
                                        label="Update Status" 
                                        onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        <MenuItem value="scheduled">Scheduled</MenuItem>
                                        <MenuItem value="completed">Completed</MenuItem>
                                        <MenuItem value="cancelled">Cancelled</MenuItem>
                                    </Select>
                                </FormControl>
                            </CardContent>
                        </Card>
                    </Grid>
                )) : (
                    <Grid item xs={12}>
                        <Card sx={{ textAlign: 'center', py: 6 }}>
                            <CardContent>
                                <MedicalServicesIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" sx={{ mb: 1 }}>
                                    No Appointments Yet
                                </Typography>
                                <Typography color="text.secondary">
                                    Your scheduled appointments will appear here
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
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

export default DoctorDashboard;