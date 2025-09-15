import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { 
    Typography, Grid, Card, CardContent, Button, Box, 
    CircularProgress, Chip, Avatar 
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const FindDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/doctor/list')
            .then(res => {
                setDoctors(res.data.doctors);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch doctors", err);
                setLoading(false);
            });
    }, []);

    const handleBookAppointment = (doctor) => {
        navigate('/patient/book-appointment', {
            state: {
                selectedDoctor: {
                    _id: doctor._id,
                    name: doctor.name,
                    specialization: doctor.specialization
                }
            }
        });
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
                    Find a Doctor
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                    Browse our network of qualified healthcare professionals
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {doctors.length > 0 ? doctors.map((doctor) => (
                    <Grid item xs={12} md={6} lg={4} key={doctor._id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ p: 3, flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Avatar 
                                        sx={{ 
                                            width: 60, 
                                            height: 60, 
                                            mr: 2,
                                            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                                            fontSize: '1.5rem',
                                            fontWeight: 700
                                        }}
                                    >
                                        {/* ✨ THIS LINE IS NOW FIXED */}
                                        {(doctor.name || '').split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                            Dr. {doctor.name}
                                        </Typography>
                                        <Chip 
                                            label={doctor.specialization} 
                                            color="primary" 
                                            variant="outlined"
                                            size="small"
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </Box>
                                </Box>
                                
                                <Box sx={{ mb: 3 }}>
                                    {/* Additional doctor details can be added here if available from API */}
                                </Box>
                                
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<CalendarTodayIcon />}
                                    onClick={() => handleBookAppointment(doctor)}
                                    sx={{ 
                                        mt: 'auto',
                                        py: 1.5,
                                        fontWeight: 600,
                                    }}
                                >
                                    Book Appointment
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                )) : (
                    <Grid item xs={12}>
                        <Card sx={{ textAlign: 'center', py: 6 }}>
                            <CardContent>
                                <MedicalServicesIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" sx={{ mb: 1 }}>
                                    No Doctors Available
                                </Typography>
                                <Typography color="text.secondary">
                                    Please check back later for available doctors
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default FindDoctors;