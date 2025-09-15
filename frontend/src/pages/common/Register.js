import React, { useState } from 'react';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Button, TextField, Typography, Container, Paper, Box, Alert, 
    Select, MenuItem, FormControl, InputLabel, CircularProgress 
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '', password: '', role: 'patient', name: '', age: '', 
        gender: '', contact: '', specialization: '', experience: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err) {
            setError('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={0} sx={{ 
                    p: 6, 
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                        <Box sx={{ 
                            p: 2, 
                            borderRadius: '50%', 
                            background: 'linear-gradient(45deg, #42a5f5 30%, #80d6ff 90%)',
                            mb: 2 
                        }}>
                            <PersonAddIcon sx={{ color: '#0a0e27', fontSize: 32 }} />
                        </Box>
                        <Typography component="h1" variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                            Join HealthApp
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Create your account to get started
                        </Typography>
                    </Box>
                    
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                required
                                fullWidth
                                label="Username"
                                name="username"
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                            />
                            <TextField
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                onChange={handleChange}
                            />
                        </Box>
                        
                        <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Role</InputLabel>
                            <Select 
                                value={formData.role} 
                                label="Role" 
                                name="role" 
                                onChange={handleChange}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(255, 255, 255, 0.3)',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(66, 165, 245, 0.5)',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#42a5f5',
                                    },
                                }}
                            >
                                <MenuItem value="patient">Patient</MenuItem>
                                <MenuItem value="doctor">Doctor</MenuItem>
                            </Select>
                        </FormControl>
                        
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                required
                                fullWidth
                                label="Full Name"
                                name="name"
                                onChange={handleChange}
                            />
                            <TextField
                                required
                                fullWidth
                                label="Contact No."
                                name="contact"
                                onChange={handleChange}
                                InputProps={{
                                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                            />
                        </Box>
                        
                        {formData.role === 'patient' ? (
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Age"
                                    name="age"
                                    type="number"
                                    onChange={handleChange}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="Gender"
                                    name="gender"
                                    onChange={handleChange}
                                />
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Specialization"
                                    name="specialization"
                                    onChange={handleChange}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="Experience (years)"
                                    name="experience"
                                    type="number"
                                    onChange={handleChange}
                                />
                            </Box>
                        )}
                        
                        {error && (
                            <Alert severity="error" sx={{ width: '100%', mt: 2, borderRadius: 2 }}>
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
                                mb: 2, 
                                py: 1.5,
                                fontSize: '1.1rem',
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} sx={{ color: '#0a0e27' }} />
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                        
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Link 
                                    to="/login" 
                                    style={{ 
                                        color: '#42a5f5',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                    }}
                                >
                                    Sign In
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;