import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Typography, Accordion, AccordionSummary, AccordionDetails, 
    Box, Chip, Card, CardContent, CircularProgress, Divider 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MedicationIcon from '@mui/icons-material/Medication';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const MyRecords = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/medical-record/my-records')
            .then(res => {
                setRecords(res.data.records);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch records", err);
                setLoading(false);
            });
    }, []);

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
                    My Medical Records
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                    Your complete medical history and treatment records
                </Typography>
            </Box>

            {records.length > 0 ? records.map((record) => (
                <Accordion 
                    key={record._id} 
                    sx={{ 
                        mb: 3, 
                        '&:before': { display: 'none' },
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    <AccordionSummary 
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ 
                            p: 3,
                            '&.Mui-expanded': {
                                minHeight: 'auto',
                            },
                            '& .MuiAccordionSummary-content': {
                                '&.Mui-expanded': {
                                    margin: '12px 0',
                                },
                            },
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <MedicalInformationIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                    Dr. {record.doctor_id.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Chip 
                                        label={record.doctor_id.specialization} 
                                        size="small" 
                                        color="primary" 
                                        variant="outlined"
                                    />
                                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                        <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                        <Typography variant="body2">
                                            {record.appointment_id.date}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </AccordionSummary>
                    
                    <AccordionDetails sx={{ p: 3, pt: 0 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <LocalHospitalIcon sx={{ mr: 1, color: 'error.main' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Diagnosis
                                    </Typography>
                                </Box>
                                <Typography paragraph sx={{ pl: 4, color: 'text.secondary' }}>
                                    {record.diagnosis}
                                </Typography>
                            </Box>
                            
                            <Divider />
                            
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <MedicalInformationIcon sx={{ mr: 1, color: 'success.main' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Treatment
                                    </Typography>
                                </Box>
                                <Typography paragraph sx={{ pl: 4, color: 'text.secondary' }}>
                                    {record.treatment}
                                </Typography>
                            </Box>
                            
                            <Divider />
                            
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <MedicationIcon sx={{ mr: 1, color: 'warning.main' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        Prescribed Medications
                                    </Typography>
                                </Box>
                                <Box sx={{ pl: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {record.prescribed_medicine.map((medicine, index) => (
                                        <Chip 
                                            key={index}
                                            label={medicine} 
                                            variant="outlined" 
                                            size="small"
                                            sx={{ 
                                                borderColor: 'warning.main',
                                                color: 'warning.main',
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </AccordionDetails>
                </Accordion>
            )) : (
                <Card sx={{ textAlign: 'center', py: 6 }}>
                    <CardContent>
                        <MedicalInformationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            No Medical Records
                        </Typography>
                        <Typography color="text.secondary">
                            Your medical records from appointments will appear here
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};

export default MyRecords;