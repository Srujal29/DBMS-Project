import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MonitorHeart from '@mui/icons-material/MonitorHeart';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(formData.username, formData.password);
      
      if (data.user.role === 'patient') {
        navigate('/patient/dashboard');
      } else if (data.user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Paper 
        elevation={6} 
        sx={{ 
            maxWidth: 1000, 
            width: '100%', 
            display: 'flex', 
            borderRadius: 2, 
            overflow: 'hidden',
            flexDirection: { xs: 'column', md: 'row' } 
        }}
      >
        {/* Left Side: Login Form */}
        <Box
          sx={{
            p: { xs: 3, sm: 5 },
            width: { xs: '100%', md: '50%' }, 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <MonitorHeart sx={{ color: 'primary.main', fontSize: 48, mb: 2 }} />
            <Typography component="h1" variant="h4">
              Welcome Back
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Sign in to access your account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
              <Grid container justifyContent="center">
                <Grid item>
                  <MuiLink component={Link} to="/register" variant="body2">
                    {"Don't have an account? Register"}
                  </MuiLink>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
        
        {/* Right Side: Image and Text Section */}
        <Box
          sx={{
              display: { xs: 'none', md: 'flex' }, 
              width: '50%', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
          }}
        >
            <Box
              component="img"
              sx={{
                height: 300,
                width: 300,
                objectFit: 'contain',
                mb: 4,
              }}
              alt="Online Doctor Consultation"
              src="/login.png" // UPDATED: Direct path to the image in the public folder
            />
            <Typography variant="h5" align="center" fontWeight={600}>
              Your Health, Connected
            </Typography>
            <Typography variant="body1" align="center" sx={{ mt: 1, opacity: 0.8 }}>
                Access your appointments, medical records, and more, all in one secure place.
            </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;

