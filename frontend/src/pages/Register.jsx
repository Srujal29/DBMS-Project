import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  Grid,
  MenuItem,
  InputAdornment,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  LocalHospital, 
  Person, 
  Healing,
  AdminPanelSettings 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [role, setRole] = useState('patient');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    // Patient specific
    dob: '',
    gender: '',
    address: '',
    // Doctor specific
    specialization: '',
    // Admin specific
    email: '',
    // Common
    contact: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setRole(newRole);
      // Reset form data when role changes
      setFormData({
        name: '',
        username: '',
        password: '',
        confirmPassword: '',
        dob: '',
        gender: '',
        address: '',
        specialization: '',
        email: '',
        contact: '',
      });
    }
  };

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
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;
      const payload = { ...registrationData, role };
      
      await register(payload);

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LocalHospital sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
              Create an Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join our network as a Patient, Doctor, or Admin
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ToggleButtonGroup
              value={role}
              exclusive
              onChange={handleRoleChange}
              aria-label="user role"
            >
              <ToggleButton value="patient" aria-label="patient">
                <Person sx={{ mr: 1 }} />
                Patient
              </ToggleButton>
              <ToggleButton value="doctor" aria-label="doctor">
                <Healing sx={{ mr: 1 }} />
                Doctor
              </ToggleButton>
              <ToggleButton value="admin" aria-label="admin">
                <AdminPanelSettings sx={{ mr: 1 }} />
                Admin
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Common Fields */}
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Full Name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Username" 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  required 
                  autoComplete="username" 
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Contact Number" 
                  name="contact" 
                  value={formData.contact} 
                  onChange={handleChange} 
                  required 
                  type="tel" 
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  label="Confirm Password" 
                  name="confirmPassword" 
                  type={showPassword ? 'text' : 'password'} 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                  autoComplete="new-password" 
                />
              </Grid>

              {/* Patient Specific Fields */}
              {role === 'patient' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth 
                      label="Date of Birth" 
                      name="dob" 
                      type="date" 
                      value={formData.dob} 
                      onChange={handleChange} 
                      required 
                      InputLabelProps={{ shrink: true }} 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      fullWidth 
                      select 
                      label="Gender" 
                      name="gender" 
                      value={formData.gender} 
                      onChange={handleChange} 
                      required 
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      label="Address" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChange} 
                      required 
                      multiline 
                      rows={2} 
                    />
                  </Grid>
                </>
              )}

              {/* Doctor Specific Fields */}
              {role === 'doctor' && (
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Specialization" 
                    name="specialization" 
                    value={formData.specialization} 
                    onChange={handleChange} 
                    required 
                    helperText="e.g., Cardiology, Neurology" 
                  />
                </Grid>
              )}

              {/* Admin Specific Fields */}
              {role === 'admin' && (
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Email" 
                    name="email" 
                    type="email"
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    helperText="Official admin email address" 
                  />
                </Grid>
              )}
            </Grid>

            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              size="large" 
              disabled={loading} 
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'Registering...' : `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link 
                  component="button" 
                  variant="body2" 
                  onClick={() => navigate('/login')} 
                  sx={{ cursor: 'pointer', textDecoration: 'none' }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;