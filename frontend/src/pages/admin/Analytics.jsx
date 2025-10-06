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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme, // Import useTheme to access theme colors
} from '@mui/material';
import {
  TrendingUp,
  People,
  LocalHospital,
  Event,
  AttachMoney,
} from '@mui/icons-material';
// Using @mui/x-charts for seamless theme integration
import { BarChart, LineChart, PieChart } from '@mui/x-charts';
import api from '../../services/api';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    appointmentsOverTime: [],
    revenueOverTime: [],
    appointmentsBySpecialization: [],
    doctorWorkload: [],
    summaryStats: {},
    appointmentStatusDistribution: [],
    revenueBySpecialization: [],
    mostCommonDiagnoses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month');
  const theme = useTheme(); // Hook to get the current theme for chart colors

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/analytics?timeRange=${timeRange}`);
      setAnalyticsData({
        appointmentsOverTime: response.data.appointmentsOverTime || [],
        revenueOverTime: response.data.revenueOverTime || [],
        appointmentsBySpecialization: response.data.appointmentsBySpecialization || [],
        doctorWorkload: response.data.doctorWorkload || [],
        summaryStats: response.data.summaryStats || {},
        appointmentStatusDistribution: response.data.appointmentStatusDistribution || [],
        revenueBySpecialization: response.data.revenueBySpecialization || [],
        mostCommonDiagnoses: response.data.mostCommonDiagnoses || [],
      });
      setError('');
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  // Create a color palette directly from the theme for consistent styling
  const themeColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.light,
    theme.palette.warning.light,
    theme.palette.error.light,
    theme.palette.info.light,
  ];
  
  // Data transformation for @mui/x-charts
  const appointmentsChartData = {
      xAxis: [{ scaleType: 'band', data: analyticsData.appointmentsOverTime.map(d => d._id) }],
      series: [{ data: analyticsData.appointmentsOverTime.map(d => d.count), label: 'Appointments' }]
  };
  const revenueChartData = {
      xAxis: [{ scaleType: 'band', data: analyticsData.revenueOverTime.map(d => d._id) }],
      series: [{ data: analyticsData.revenueOverTime.map(d => d.total), label: 'Revenue ($)', area: true, color: theme.palette.primary.main }]
  };
  const statusPieData = analyticsData.appointmentStatusDistribution.map((d, i) => ({ id: i, value: d.count, label: d._id }));
  const diagnosisPieData = analyticsData.mostCommonDiagnoses.map((d, i) => ({ id: i, value: d.count, label: d._id }));
  const specializationRevenueData = {
      xAxis: [{ scaleType: 'band', data: analyticsData.revenueBySpecialization.map(d => d._id) }],
      series: [{ data: analyticsData.revenueBySpecialization.map(d => d.totalRevenue), label: 'Revenue ($)', color: theme.palette.secondary.main }]
  };
  const doctorWorkloadData = {
      yAxis: [{ scaleType: 'band', data: analyticsData.doctorWorkload.map(d => d.doctorName) }],
      series: [{ data: analyticsData.doctorWorkload.map(d => d.count), label: 'Appointments Handled', color: theme.palette.info.main }]
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 4, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h4">Hospital Analytics</Typography>
              <Typography variant="body2" color="text.secondary">In-depth insights into hospital operations and patient data</Typography>
            </Box>
          </Box>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Time Range</InputLabel>
            <Select value={timeRange} label="Time Range" onChange={handleTimeRangeChange}>
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {error && (<Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>)}
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', gap: 2}}><People color="primary" sx={{ fontSize: 40 }}/><Box><Typography variant="h4">{analyticsData.summaryStats.totalPatients || 0}</Typography><Typography variant="body2" color="text.secondary">Total Patients</Typography></Box></Box></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', gap: 2}}><LocalHospital color="secondary" sx={{ fontSize: 40 }}/><Box><Typography variant="h4">{analyticsData.summaryStats.totalDoctors || 0}</Typography><Typography variant="body2" color="text.secondary">Active Doctors</Typography></Box></Box></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', gap: 2}}><Event color="warning" sx={{ fontSize: 40 }}/><Box><Typography variant="h4">{analyticsData.summaryStats.totalAppointments || 0}</Typography><Typography variant="body2" color="text.secondary">Total Appointments</Typography></Box></Box></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', gap: 2}}><AttachMoney color="success" sx={{ fontSize: 40 }}/><Box><Typography variant="h4">${(analyticsData.summaryStats.totalRevenue || 0).toLocaleString()}</Typography><Typography variant="body2" color="text.secondary">Gross Revenue</Typography></Box></Box></CardContent></Card></Grid>
      </Grid>
      
      <Grid container spacing={3}>
        {/* Row 1 */}
        <Grid item xs={12} md={7}>
          <Card><CardContent><Typography variant="h6" gutterBottom>Appointment Frequency</Typography><Box sx={{height: 350}}><BarChart {...appointmentsChartData} colors={[theme.palette.primary.main]} /></Box></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card><CardContent><Typography variant="h6" gutterBottom>Appointment Status</Typography><Box sx={{height: 350}}><PieChart series={[{ data: statusPieData, innerRadius: 80, outerRadius: 100 }]} colors={themeColors} /></Box></CardContent></Card>
        </Grid>
        
        {/* Row 2 */}
        <Grid item xs={12} md={5}>
          <Card><CardContent><Typography variant="h6" gutterBottom>Most Common Diagnoses</Typography><Box sx={{height: 350}}><PieChart series={[{ data: diagnosisPieData, innerRadius: 80, outerRadius: 100 }]} colors={themeColors.slice(1)} /></Box></CardContent></Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card><CardContent><Typography variant="h6" gutterBottom>Revenue by Specialization</Typography><Box sx={{height: 350}}><BarChart {...specializationRevenueData} /></Box></CardContent></Card>
        </Grid>
        
        {/* Row 3 */}
        <Grid item xs={12}>
          <Card><CardContent><Typography variant="h6" gutterBottom>Revenue Trends</Typography><Box sx={{height: 400}}><LineChart {...revenueChartData} /></Box></CardContent></Card>
        </Grid>
        
        {/* Row 4 */}
        <Grid item xs={12}>
          <Card><CardContent><Typography variant="h6" gutterBottom>Doctor Workload</Typography><Box sx={{height: 400}}><BarChart layout="horizontal" {...doctorWorkloadData} /></Box></CardContent></Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;

