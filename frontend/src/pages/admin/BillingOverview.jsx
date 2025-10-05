import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Receipt,
  AttachMoney,
  PendingActions,
  CheckCircle,
  TrendingUp,
} from '@mui/icons-material';
import api from '../../services/api';

const BillingOverview = () => {
  const [billings, setBillings] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    paidAmount: 0,
    totalBills: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/billing-overview');
      // CORRECTED: Use 'bills' key from backend response
      setBillings(response.data.bills || []); 
      setStats(response.data.stats || {
        totalRevenue: 0,
        pendingAmount: 0,
        paidAmount: 0,
        totalBills: 0,
      });
      setError('');
    } catch (err) {
      setError('Failed to load billing data');
      setBillings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status) => {
    const colors = {
      unpaid: 'warning',
      paid: 'success',
      insurance_pending: 'info',
    };
    return colors[status] || 'default';
  };

  // CORRECTED: Filter by 'status' property, not 'paymentStatus'
  const pendingBills = billings.filter((bill) => bill.status === 'unpaid');
  const paidBills = billings.filter((bill) => bill.status === 'paid');
  const insuranceBills = billings.filter((bill) => bill.status === 'insurance_pending');


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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Receipt sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Billing Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and track all billing and payment information
            </Typography>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AttachMoney sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    ${stats.totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue (Paid)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PendingActions sx={{ fontSize: 40, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight={600} color="warning.main">
                    ${stats.pendingAmount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Amount
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircle sx={{ fontSize: 40, color: 'info.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight={600} color="info.main">
                    ${stats.paidAmount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Insurance Pending
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp sx={{ fontSize: 40, color: 'secondary.main' }} />
                <Box>
                  <Typography variant="h4" fontWeight={600} color="secondary.main">
                    {stats.totalBills}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Bills Generated
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
          <Tab label={<Box>All Bills <Chip label={billings.length} size="small" /></Box>} />
          <Tab label={<Box>Pending <Chip label={pendingBills.length} size="small" color="warning" /></Box>} />
          <Tab label={<Box>Paid <Chip label={paidBills.length} size="small" color="success" /></Box>} />
          <Tab label={<Box>Insurance <Chip label={insuranceBills.length} size="small" color="info" /></Box>} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && <BillingTable billings={billings} getStatusColor={getStatusColor} />}
          {tabValue === 1 && <BillingTable billings={pendingBills} getStatusColor={getStatusColor} />}
          {tabValue === 2 && <BillingTable billings={paidBills} getStatusColor={getStatusColor} />}
          {tabValue === 3 && <BillingTable billings={insuranceBills} getStatusColor={getStatusColor} />}
        </Box>
      </Paper>
    </Container>
  );
};

const BillingTable = ({ billings, getStatusColor }) => {
  if (billings.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No billing records found in this category
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Patient</TableCell>
            <TableCell>Doctor</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Date Issued</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {billings.map((bill) => (
            <TableRow key={bill._id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
              {/* CORRECTED: Directly access populated fields */}
              <TableCell>{bill.patient_id?.name || 'N/A'}</TableCell>
              <TableCell>Dr. {bill.doctor_id?.name || 'N/A'}</TableCell>
              <TableCell>
                <Typography variant="body1" fontWeight={600}>
                  ${bill.amount.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>{new Date(bill.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Chip
                  // CORRECTED: Use 'status' property
                  label={bill.status?.replace(/_/g, ' ').toUpperCase()}
                  color={getStatusColor(bill.status)}
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BillingOverview;
