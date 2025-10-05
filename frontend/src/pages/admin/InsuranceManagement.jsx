import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  VerifiedUser,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Close,
  Visibility,
} from '@mui/icons-material';
import api from '../../services/api';

// Insurance Table Component (Moved before the main component to avoid reference errors)
const InsuranceTable = ({ requests, getStatusColor, onView, onVerify, onReject, showActions }) => {
  if (requests.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No insurance requests in this category
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Patient Name</TableCell>
            <TableCell>Insurance Provider</TableCell>
            <TableCell>Policy Number</TableCell>
            <TableCell>Coverage Amount</TableCell>
            <TableCell>Request Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request._id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
              <TableCell>{request.patientId?.name || 'N/A'}</TableCell>
              <TableCell>{request.insuranceProvider}</TableCell>
              <TableCell>{request.policyNumber}</TableCell>
              <TableCell>
                <Typography variant="body1" fontWeight={600}>
                  ${request.coverageAmount}
                </Typography>
              </TableCell>
              <TableCell>
                {new Date(request.requestDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Chip
                  label={request.status.toUpperCase()}
                  color={getStatusColor(request.status)}
                  size="small"
                />
              </TableCell>
              <TableCell align="center">
                <IconButton
                  color="info"
                  onClick={() => onView(request)}
                  size="small"
                >
                  <Visibility />
                </IconButton>
                {showActions && (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => onVerify(request)}
                      sx={{ ml: 1 }}
                    >
                      Verify
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => onReject(request)}
                      sx={{ ml: 1 }}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};


const InsuranceManagement = () => {
  const [insuranceRequests, setInsuranceRequests] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchInsuranceData();
  }, []);

  const fetchInsuranceData = async () => {
    try {
      setLoading(true);
      // NOTE: You will need to create this backend endpoint
      const response = await api.get('/admin/insurance-requests');
      setInsuranceRequests(response.data.requests || []);
      setStats(response.data.stats || {
        pending: 0,
        verified: 0,
        rejected: 0,
        total: 0,
      });
      setError('');
    } catch (err) {
      setError('Failed to load insurance requests. Please ensure the backend admin routes are set up.');
      setInsuranceRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openViewDialog = (request) => {
    setSelectedRequest(request);
    setViewDialog(true);
  };

  const closeViewDialog = () => {
    setViewDialog(false);
    setSelectedRequest(null);
  };

  const openActionDialog = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setActionDialog(true);
  };

  const closeActionDialog = () => {
    setActionDialog(false);
    setSelectedRequest(null);
    setActionType('');
    setNotes('');
  };

  const handleAction = async () => {
    if (!notes.trim()) {
      setError('Please provide notes');
      return;
    }

    try {
      // NOTE: You will need to create this backend endpoint
      await api.put(`/admin/insurance/${selectedRequest._id}`, {
        status: actionType,
        notes,
      });
      setSuccess(`Insurance ${actionType} successfully!`);
      fetchInsuranceData();
      closeActionDialog();
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

  const pendingRequests = insuranceRequests.filter((req) => req.status === 'pending');
  const verifiedRequests = insuranceRequests.filter((req) => req.status === 'verified');
  const rejectedRequests = insuranceRequests.filter((req) => req.status === 'rejected');

  if (loading && insuranceRequests.length === 0) {
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <VerifiedUser sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Insurance Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Verify and manage patient insurance claims
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

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <HourglassEmpty sx={{ fontSize: 40, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight={600} color="warning.main">
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Requests
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    {stats.verified}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verified
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Cancel sx={{ fontSize: 40, color: 'error.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight={600} color="error.main">
                    {stats.rejected}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejected
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <VerifiedUser sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight={600} color="primary.main">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Requests
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
                All Requests
                <Chip label={insuranceRequests.length} size="small" />
              </Box>
            }
          />
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
            <InsuranceTable
              requests={insuranceRequests}
              getStatusColor={getStatusColor}
              onView={openViewDialog}
              onVerify={(req) => openActionDialog(req, 'verified')}
              onReject={(req) => openActionDialog(req, 'rejected')}
              showActions={false}
            />
          )}
          {tabValue === 1 && (
            <InsuranceTable
              requests={pendingRequests}
              getStatusColor={getStatusColor}
              onView={openViewDialog}
              onVerify={(req) => openActionDialog(req, 'verified')}
              onReject={(req) => openActionDialog(req, 'rejected')}
              showActions={true}
            />
          )}
          {tabValue === 2 && (
            <InsuranceTable
              requests={verifiedRequests}
              getStatusColor={getStatusColor}
              onView={openViewDialog}
              showActions={false}
            />
          )}
          {tabValue === 3 && (
            <InsuranceTable
              requests={rejectedRequests}
              getStatusColor={getStatusColor}
              onView={openViewDialog}
              showActions={false}
            />
          )}
        </Box>
      </Paper>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={closeViewDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Insurance Request Details
          <IconButton
            onClick={closeViewDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Grid container spacing={2}>
              <Grid xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Patient Name
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedRequest.patientId?.name}
                </Typography>
              </Grid>

              <Grid xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Insurance Provider
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedRequest.insuranceProvider}
                </Typography>
              </Grid>

              <Grid xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Policy Number
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedRequest.policyNumber}
                </Typography>
              </Grid>

              <Grid xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Coverage Amount
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  ${selectedRequest.coverageAmount}
                </Typography>
              </Grid>

              <Grid xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Request Date
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {new Date(selectedRequest.requestDate).toLocaleDateString()}
                </Typography>
              </Grid>

              <Grid xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={selectedRequest.status.toUpperCase()}
                    color={getStatusColor(selectedRequest.status)}
                    size="small"
                  />
                </Box>
              </Grid>

              {selectedRequest.notes && (
                <Grid xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Notes
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {selectedRequest.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialog} onClose={closeActionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'verified' ? 'Verify Insurance' : 'Reject Insurance'}
        </DialogTitle>
        <DialogContent dividers>
          {selectedRequest && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Insurance Details
              </Typography>
              <Grid container spacing={1}>
                <Grid xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Patient:
                  </Typography>
                  <Typography variant="body2">
                    {selectedRequest.patientId?.name}
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Provider:
                  </Typography>
                  <Typography variant="body2">
                    {selectedRequest.insuranceProvider}
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Policy:
                  </Typography>
                  <Typography variant="body2">
                    {selectedRequest.policyNumber}
                  </Typography>
                </Grid>
                <Grid xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Coverage:
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
            label={actionType === 'verified' ? 'Verification Notes' : 'Rejection Reason'}
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
            placeholder={
              actionType === 'verified'
                ? 'Enter verification details and approval notes'
                : 'Enter reason for rejection'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActionDialog}>Cancel</Button>
          <Button
            onClick={handleAction}
            variant="contained"
            color={actionType === 'verified' ? 'success' : 'error'}
            disabled={!notes.trim()}
          >
            {actionType === 'verified' ? 'Verify' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InsuranceManagement;
