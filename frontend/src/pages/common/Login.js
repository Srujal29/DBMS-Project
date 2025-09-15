import React, { useState, useContext } from 'react';
import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { Button, TextField, Typography, Container, Paper, Box, Alert, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { username, password });
            login(response.data.user, response.data.token);
        } catch (err) {
            setError('Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={0} sx={{ 
                    p: 6, 
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        <Box sx={{ 
                            p: 2, 
                            borderRadius: '50%', 
                            background: 'linear-gradient(45deg, #42a5f5 30%, #80d6ff 90%)',
                            mb: 2 
                        }}>
                            <LoginIcon sx={{ color: '#0a0e27', fontSize: 32 }} />
                        </Box>
                        <Typography component="h1" variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                            Welcome Back
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Sign in to your account
                        </Typography>
                    </Box>
                    
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            InputProps={{
                                startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                            sx={{ mb: 2 }}
                        />
                        
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
                                position: 'relative',
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} sx={{ color: '#0a0e27' }} />
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                        
                        <Box sx={{ textAlign: 'center', mt: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                Don't have an account?{' '}
                                <Link 
                                    to="/register" 
                                    style={{ 
                                        color: '#42a5f5',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                    }}
                                >
                                    Sign Up
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;