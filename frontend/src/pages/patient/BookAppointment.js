import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { 
    Button, TextField, Typography, Container, Paper, Box, Alert, 
    CircularProgress, Stepper, Step, StepLabel 
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import NotesIcon from '@mui/icons-material/Notes';

const BookAppointment = () => {
    const [formData, setFormData] = useState({ doctorId: '', date: '', time: '', reason: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        
        try {
            await api.post('/appointment/book', formData);
            setMessage('Appointment booked successfully!');
            setTimeout(() => navigate('/patient/dashboard'), 2000);
        } catch (err) {
            setError('Failed to book appointment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="md">
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={0} sx={{ 
                    p: 6, 
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                        <Box sx={{ 
                            p: 2, 
                            borderRadius: '50%', 
                            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                            mb: 2 
                        }}>
                            <CalendarTodayIcon sx={{ color: 'white', fontSize: 32 }} />
                        </Box>
                        <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
                            Book an Appointment
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                            Schedule your consultation with our healthcare professionals
                        </Typography>
                    </Box>
                    
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                            <TextField
                                required
                                fullWidth
                                label="Doctor ID"
                                name="doctorId"
                                onChange={handleChange}
                                placeholder="Enter doctor's ID"
                                InputProps={{
                                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                                sx={{ flex: 1 }}
                            />
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
                            <TextField
                                required
                                fullWidth
                                name="date"
                                label="Appointment Date"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                                sx={{ flex: 1 }}
                            />
                            <TextField
                                required
                                fullWidth
                                name="time"
                                label="Appointment Time"
                                type="time"
                                InputLabelProps={{ shrink: true }}
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                                sx={{ flex: 1 }}
                            />
                        </Box>
                        
                        <TextField
                            required
                            fullWidth
                            label="Reason for Visit"
                            name="reason"
                            multiline
                            rows={4}
                            onChange={handleChange}
                            placeholder="Please describe your symptoms or reason for the appointment"
                            InputProps={{
                                startAdornment: <NotesIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 2 }} />
                            }}
                            sx={{ mb: 3 }}
                        />
                        
                        {message && (
                            <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                                {message}
                            </Alert>
                        )}
                        {error && (
                            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ 
                                mt: 3, 
                                py: 1.5,
                                fontSize: '1.1rem',
                                fontWeight: 600,
                            }}
                        >
                            {loading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CircularProgress size={20} sx={{ color: 'white' }} />
                                    Booking Appointment...
                                </Box>
                            ) : (
                                'Book Appointment'
                            )}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default BookAppointment;