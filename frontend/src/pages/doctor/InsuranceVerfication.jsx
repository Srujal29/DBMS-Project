import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  VerifiedUser,
  CheckCircle,
  Cancel,
  Visibility,
  HourglassEmpty,
} from '@mui/icons-material';
import api from '../../services/api';

const InsuranceVerification = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [verifyDialog, setVerifyDialog] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');

  useEffect(() => {
    fetchInsuranceRequests();
  }, []);

  const fetchInsuranceRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/insurance/doctor-requests');
      setRequests(response.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load insurance verification requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openVerifyDialog = (request, status) => {
    setSelectedRequest(request);
    setVerificationStatus(status);
    setVerifyDialog(true);
  };

  const closeVerifyDialog = () => {
    setVerifyDialog(false);
    setSelectedRequest(null);
    setVerificationNotes('');
    setVerificationStatus('');
  };

  const handleVerify = async () => {
    if (!verificationNotes.trim()) {
      setError('Please provide verification notes');
      return;
    }

    try {
      await api.put(`/insurance/verify/${selectedRequest._id}`, {
        status: verificationStatus,
        verificationNotes,
      });
      setSuccess(`Insurance ${verificationStatus} successfully!`);
      fetchInsuranceRequests();
      closeVerifyDialog();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update insurance status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      verified: 'success',
      rejected: 'error',
    };
    return colors[status] || 'default';
  };

  const pendingRequests = requests.filter((req) => req.status === 'pending');
  const verifiedRequests = requests.filter((req) => req.status === 'verified');
  const rejectedRequests = requests.filter((req) => req.status === 'rejected');

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <VerifiedUser sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Insurance Verification
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Verify patient insurance claims and coverage
            </Typography>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <HourglassEmpty sx={{ fontSize: 40, color: '#ff9800' }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {pendingRequests.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Requests
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {verifiedRequests.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verified
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#ffebee' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Cancel sx={{ fontSize: 40, color: '#f44336' }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {rejectedRequests.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejected
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={3}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Pending
                <Chip label={pendingRequests.length} size="small" color="warning" />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Verified
                <Chip label={verifiedRequests.length} size="small" color="success" />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Rejected
                <Chip label={rejectedRequests.length} size="small" color="error" />
              </Box>
            }
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            <InsuranceRequestTable
              requests={pendingRequests}
              onVerify={(request) => openVerifyDialog(request, 'verified')}
              onReject={(request) => openVerifyDialog(request, 'rejected')}
              showActions={true}
            />
          )}

          {tabValue === 1 && (
            <InsuranceRequestTable
              requests={verifiedRequests}
              showActions={false}
            />
          )}

          {tabValue === 2 && (
            <InsuranceRequestTable
              requests={rejectedRequests}
              showActions={false}
            />
          )}
        </Box>
      </Paper>

      {/* Verification Dialog */}
      <Dialog open={verifyDialog} onClose={closeVerifyDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {verificationStatus === 'verified' ? 'Verify Insurance' : 'Reject Insurance'}
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Patient Information
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Patient Name:
                  </Typography>
                  <Typography variant="body2">
                    {selectedRequest.patientId?.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Insurance Provider:
                  </Typography>
                  <Typography variant="body2">
                    {selectedRequest.insuranceProvider}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Policy Number:
                  </Typography>
                  <Typography variant="body2">
                    {selectedRequest.policyNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Coverage Amount:
                  </Typography>
                  <Typography variant="body2">
                    ${selectedRequest.coverageAmount}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <TextField
            fullWidth
            label="Verification Notes"
            multiline
            rows={4}
            value={verificationNotes}
            onChange={(e) => setVerificationNotes(e.target.value)}
            required
            placeholder={
              verificationStatus === 'verified'
                ? 'Enter verification details and coverage confirmation'
                : 'Enter reason for rejection'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeVerifyDialog}>Cancel</Button>
          <Button
            onClick={handleVerify}
            variant="contained"
            color={verificationStatus === 'verified' ? 'success' : 'error'}
            disabled={!verificationNotes.trim()}
          >
            {verificationStatus === 'verified' ? 'Verify' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Table Component for Insurance Requests
const InsuranceRequestTable = ({ requests, onVerify, onReject, showActions }) => {
  if (requests.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No insurance requests found
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.100' }}>
            <TableCell>Patient Name</TableCell>
            <TableCell>Insurance Provider</TableCell>
            <TableCell>Policy Number</TableCell>
            <TableCell>Coverage Amount</TableCell>
            <TableCell>Request Date</TableCell>
            <TableCell>Status</TableCell>
            {showActions && <TableCell align="center">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request._id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
              <TableCell>{request.patientId?.name}</TableCell>
              <TableCell>{request.insuranceProvider}</TableCell>
              <TableCell>{request.policyNumber}</TableCell>
              <TableCell>${request.coverageAmount}</TableCell>
              <TableCell>
                {new Date(request.requestDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Chip
                  label={request.status.toUpperCase()}
                  color={
                    request.status === 'pending'
                      ? 'warning'
                      : request.status === 'verified'
                      ? 'success'
                      : 'error'
                  }
                  size="small"
                />
              </TableCell>
              {showActions && (
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => onVerify(request)}
                    sx={{ mr: 1 }}
                  >
                    Verify
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => onReject(request)}
                  >
                    Reject
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InsuranceVerification;