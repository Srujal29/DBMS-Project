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
} from '@mui/material';
import {
  TrendingUp,
  People,
  LocalHospital,
  Event,
  AttachMoney,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import api from '../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

// A more visually appealing custom tooltip for the charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 2, background: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="body2" fontWeight="bold">{`${label}`}</Typography>
        {payload.map((pld, index) => (
          <Typography key={index} variant="body2" sx={{ color: pld.color || pld.fill }}>
            {`${pld.name}: ${pld.value.toLocaleString()}`}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};


const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    appointmentsOverTime: [],
    revenueOverTime: [],
    appointmentsBySpecialization: [],
    doctorWorkload: [],
    summaryStats: {},
    appointmentStatusDistribution: [],
    revenueBySpecialization: [],
    mostCommonDiagnoses: [], // Added state for the new chart
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month');

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
        mostCommonDiagnoses: response.data.mostCommonDiagnoses || [], // Fetch new data
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h4" fontWeight={600}>
                Hospital Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In-depth insights into hospital operations and patient data
              </Typography>
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {/* Key Metric Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}}>
                <People color="primary" sx={{ fontSize: 40 }}/>
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {analyticsData.summaryStats.totalPatients || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Total Patients</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}}>
                <LocalHospital color="secondary" sx={{ fontSize: 40 }}/>
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {analyticsData.summaryStats.totalDoctors || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Active Doctors</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}}>
                <Event color="warning" sx={{ fontSize: 40 }}/>
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {analyticsData.summaryStats.totalAppointments || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Total Appointments</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}}>
                <AttachMoney color="success" sx={{ fontSize: 40 }}/>
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    ${(analyticsData.summaryStats.totalRevenue || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Gross Revenue</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      <Grid container spacing={4}>
        {/* Revenue Trends */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Revenue Trends
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analyticsData.revenueOverTime}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#00C49F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis tickFormatter={(value) => `$${(value/1000)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#00C49F"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Appointment Frequency & Status Distribution */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Appointment Frequency
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analyticsData.appointmentsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="count" fill="#1976d2" name="Appointments" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Appointment Status
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={analyticsData.appointmentStatusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="_id"
                  >
                    {analyticsData.appointmentStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* NEW: Most Common Diagnoses */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Most Common Diagnoses
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={analyticsData.mostCommonDiagnoses}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#FF8042"
                    dataKey="count"
                    nameKey="_id"
                  >
                    {analyticsData.mostCommonDiagnoses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.slice(2)[index % COLORS.slice(2).length]} />
                    ))}
                  </Pie>
                   <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Revenue by Specialization */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
               <Typography variant="h6" gutterBottom fontWeight={600}>
                Revenue by Specialization
              </Typography>
               <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analyticsData.revenueBySpecialization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill="#FFBB28" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Doctor Workload */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Doctor Workload
              </Typography>
               <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.doctorWorkload} layout="vertical" margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="doctorName" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Appointments Handled" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        
      </Grid>
    </Container>
  );
};

export default Analytics;

