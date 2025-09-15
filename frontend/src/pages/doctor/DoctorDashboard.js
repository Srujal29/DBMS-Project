import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
    Typography, Grid, Card, CardContent, Select, MenuItem, FormControl, 
    InputLabel, Chip, Box, CircularProgress, Snackbar, Alert, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DownloadIcon from '@mui/icons-material/Download';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

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

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [invoiceDialog, setInvoiceDialog] = useState({ open: false, appointmentId: null });
    const [invoiceAmount, setInvoiceAmount] = useState('');
    
    // Medical Record Dialog States
    const [medicalRecordDialog, setMedicalRecordDialog] = useState({ 
        open: false, 
        appointmentId: null, 
        patientName: '' 
    });
    const [medicalRecordForm, setMedicalRecordForm] = useState({
        diagnosis: '',
        treatment: '',
        prescribed_medicine: ''
    });
    const [medicalRecordLoading, setMedicalRecordLoading] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = () => {
        api.get('/appointment/my-appointments')
            .then(res => {
                setAppointments(res.data.appointments);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch appointments", err);
                setLoading(false);
            });
    };

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

    const handleManageRequest = async (appointmentId, action) => {
        try {
            const res = await api.put(`/appointment/manage-request/${appointmentId}`, { action });
            setAppointments(apps => apps.map(app => 
                app._id === appointmentId ? res.data.appointment : app
            ));
            setSnackbar({
                open: true,
                message: `Appointment ${action}d successfully`,
                severity: 'success'
            });
        } catch (err) {
            console.error("Failed to manage request", err);
            setSnackbar({
                open: true,
                message: `Failed to ${action} appointment`,
                severity: 'error'
            });
        }
    };

    const handleGenerateInvoice = async () => {
        try {
            await api.post(`/billing/${invoiceDialog.appointmentId}`, { amount: parseFloat(invoiceAmount) });
            setSnackbar({
                open: true,
                message: 'Invoice generated successfully',
                severity: 'success'
            });
            setInvoiceDialog({ open: false, appointmentId: null });
            setInvoiceAmount('');
            fetchAppointments(); // Refresh to get invoice data
        } catch (err) {
            console.error("Failed to generate invoice", err);
            setSnackbar({
                open: true,
                message: 'Failed to generate invoice',
                severity: 'error'
            });
        }
    };

    const handleDownloadInvoice = async (invoiceId) => {
        try {
            const response = await api.get(`/billing/${invoiceId}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${invoiceId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Failed to download invoice", err);
            setSnackbar({
                open: true,
                message: 'Failed to download invoice',
                severity: 'error'
            });
        }
    };

    // Medical Record Functions
    const handleOpenMedicalRecordDialog = (appointmentId, patientName) => {
        setMedicalRecordDialog({ 
            open: true, 
            appointmentId, 
            patientName 
        });
        setMedicalRecordForm({
            diagnosis: '',
            treatment: '',
            prescribed_medicine: ''
        });
    };

    const handleCloseMedicalRecordDialog = () => {
        setMedicalRecordDialog({ 
            open: false, 
            appointmentId: null, 
            patientName: '' 
        });
        setMedicalRecordForm({
            diagnosis: '',
            treatment: '',
            prescribed_medicine: ''
        });
    };

    const handleMedicalRecordFormChange = (field, value) => {
        setMedicalRecordForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveMedicalRecord = async () => {
        setMedicalRecordLoading(true);
        try {
            const medicineArray = medicalRecordForm.prescribed_medicine
                .split(',')
                .map(med => med.trim())
                .filter(med => med.length > 0);

            await api.post('/medical-record/add', {
                appointmentId: medicalRecordDialog.appointmentId,
                diagnosis: medicalRecordForm.diagnosis,
                treatment: medicalRecordForm.treatment,
                prescribed_medicine: medicineArray
            });

            // Update the appointment to mark that medical record has been added
            setAppointments(apps => apps.map(app => 
                app._id === medicalRecordDialog.appointmentId 
                    ? { ...app, hasMedicalRecord: true }
                    : app
            ));

            setSnackbar({
                open: true,
                message: 'Medical record saved successfully',
                severity: 'success'
            });

            handleCloseMedicalRecordDialog();
        } catch (err) {
            console.error("Failed to save medical record", err);
            setSnackbar({
                open: true,
                message: 'Failed to save medical record',
                severity: 'error'
            });
        } finally {
            setMedicalRecordLoading(false);
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
                                
                                {app.status === 'pending_approval' && (
                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="success"
                                            startIcon={<CheckCircleIcon />}
                                            onClick={() => handleManageRequest(app._id, 'approve')}
                                            size="small"
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="error"
                                            startIcon={<CancelIcon />}
                                            onClick={() => handleManageRequest(app._id, 'decline')}
                                            size="small"
                                        >
                                            Decline
                                        </Button>
                                    </Box>
                                )}
                                
                                {app.status === 'pending_payment' && (
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        Waiting for Patient Payment
                                    </Alert>
                                )}
                                
                                {app.status === 'completed' && (
                                    <Box sx={{ mb: 2 }}>
                                        {/* Medical Record Section */}
                                        {app.hasMedicalRecord ? (
                                            <Box sx={{ mb: 2 }}>
                                                <Chip
                                                    label="Medical Record Saved"
                                                    icon={<AssignmentTurnedInIcon />}
                                                    color="success"
                                                    variant="outlined"
                                                    size="small"
                                                    sx={{ 
                                                        width: '100%',
                                                        height: 'auto',
                                                        py: 1,
                                                        '& .MuiChip-label': { 
                                                            px: 2,
                                                            fontWeight: 600
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        ) : (
                                            <Box sx={{ mb: 2 }}>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    color="secondary"
                                                    startIcon={<NoteAddIcon />}
                                                    onClick={() => handleOpenMedicalRecordDialog(app._id, app.patient_id.name)}
                                                    size="small"
                                                    sx={{ mb: 1 }}
                                                >
                                                    Add Medical Record
                                                </Button>
                                            </Box>
                                        )}

                                        {/* Invoice Section */}
                                        {app.invoice ? (
                                            <Box>
                                                <Typography variant="body2" sx={{ mb: 1 }}>
                                                    Invoice: ${app.invoice.amount}
                                                </Typography>
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    startIcon={<DownloadIcon />}
                                                    onClick={() => handleDownloadInvoice(app.invoice._id)}
                                                    size="small"
                                                >
                                                    Download Invoice
                                                </Button>
                                            </Box>
                                        ) : (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                startIcon={<ReceiptIcon />}
                                                onClick={() => setInvoiceDialog({ open: true, appointmentId: app._id })}
                                                size="small"
                                            >
                                                Generate Invoice
                                            </Button>
                                        )}
                                    </Box>
                                )}
                                
                              {['confirmed', 'completed'].includes(app.status) && (
    <FormControl fullWidth size="small" sx={{mt: 2}}>
        <InputLabel>Update Status</InputLabel>
        <Select 
            value={app.status} 
            label="Update Status" 
            onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
        >
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
        </Select>
    </FormControl>
)}
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

            {/* Medical Record Dialog */}
            <Dialog 
                open={medicalRecordDialog.open} 
                onClose={handleCloseMedicalRecordDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NoteAddIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Box>
                            <Typography variant="h6" component="div">
                                Add Medical Record
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Patient: {medicalRecordDialog.patientName}
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                        <TextField
                            label="Diagnosis"
                            multiline
                            rows={4}
                            fullWidth
                            variant="outlined"
                            value={medicalRecordForm.diagnosis}
                            onChange={(e) => handleMedicalRecordFormChange('diagnosis', e.target.value)}
                            placeholder="Enter patient diagnosis..."
                            required
                        />
                        <TextField
                            label="Treatment"
                            multiline
                            rows={4}
                            fullWidth
                            variant="outlined"
                            value={medicalRecordForm.treatment}
                            onChange={(e) => handleMedicalRecordFormChange('treatment', e.target.value)}
                            placeholder="Enter treatment plan..."
                            required
                        />
                        <TextField
                            label="Prescribed Medicine"
                            fullWidth
                            variant="outlined"
                            value={medicalRecordForm.prescribed_medicine}
                            onChange={(e) => handleMedicalRecordFormChange('prescribed_medicine', e.target.value)}
                            placeholder="Enter medicines separated by commas (e.g., Paracetamol, Ibuprofen)"
                            helperText="Separate multiple medicines with commas"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={handleCloseMedicalRecordDialog}
                        variant="outlined"
                        disabled={medicalRecordLoading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSaveMedicalRecord} 
                        variant="contained"
                        disabled={
                            medicalRecordLoading || 
                            !medicalRecordForm.diagnosis.trim() || 
                            !medicalRecordForm.treatment.trim()
                        }
                        startIcon={medicalRecordLoading ? <CircularProgress size={20} /> : <NoteAddIcon />}
                    >
                        {medicalRecordLoading ? 'Saving...' : 'Save Record'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Invoice Generation Dialog */}
            <Dialog open={invoiceDialog.open} onClose={() => setInvoiceDialog({ open: false, appointmentId: null })}>
                <DialogTitle sx={{ pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ReceiptIcon sx={{ mr: 2, color: 'primary.main' }} />
                        Generate Invoice
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Invoice Amount ($)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={invoiceAmount}
                        onChange={(e) => setInvoiceAmount(e.target.value)}
                        sx={{ mt: 2 }}
                        inputProps={{ min: 0, step: 0.01 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={() => setInvoiceDialog({ open: false, appointmentId: null })}
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleGenerateInvoice} 
                        variant="contained"
                        disabled={!invoiceAmount || parseFloat(invoiceAmount) <= 0}
                    >
                        Generate Invoice
                    </Button>
                </DialogActions>
            </Dialog>

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