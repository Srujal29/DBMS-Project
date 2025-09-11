import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import AuthContext from '../../context/AuthContext';
import { 
    Typography, Paper, Grid, Box, CircularProgress, Card, CardContent, 
    Avatar, Divider 
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake';
import WcIcon from '@mui/icons-material/Wc';

const PatientDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            api.get('/patient/my-profile')
                .then(res => {
                    setProfile(res.data.profile);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch profile", err);
                    setLoading(false);
                });
        }
    }, [user]);

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
                    Patient Dashboard
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                    Welcome to your personal health portal
                </Typography>
            </Box>

            {profile ? (
                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        <Card sx={{ height: 'fit-content' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Avatar 
                                        sx={{ 
                                            width: 80, 
                                            height: 80, 
                                            mr: 3,
                                            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
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
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: 'primary.main', color: 'white', height: 'fit-content' }}>
                            <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                <PersonIcon sx={{ fontSize: 48, mb: 2, opacity: 0.8 }} />
                                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                                    Quick Actions
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Use the navigation above to book appointments or view your medical records
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            ) : (
                <Card sx={{ textAlign: 'center', py: 6 }}>
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
        </Box>
    );
};

export default PatientDashboard;