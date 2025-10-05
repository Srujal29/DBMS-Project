import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import {
  CalendarMonth,
  AccessTime,
  Person,
  LocalHospital,
} from '@mui/icons-material';

const AppointmentCard = ({ appointment, onAction, actionButtons }) => {
  const getStatusColor = (status) => {
    const statusColors = {
      pending_approval: 'warning',
      approved: 'info',
      completed: 'success',
      cancelled: 'error',
      pending_payment: 'warning',
    };
    return statusColors[status] || 'default';
  };

  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card sx={{ mb: 2, '&:hover': { boxShadow: 6 }, transition: 'box-shadow 0.3s' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div">
            Appointment Details
          </Typography>
          <Chip
            label={appointment.status?.replace(/_/g, ' ').toUpperCase()}
            color={getStatusColor(appointment.status)}
            size="small"
          />
        </Box>

        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {appointment.doctorId?.name || appointment.patientId?.name || 'N/A'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonth color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {formatDate(appointment.date)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {appointment.time}
            </Typography>
          </Box>

          {appointment.reason && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <LocalHospital color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {appointment.reason}
              </Typography>
            </Box>
          )}
        </Stack>

        {actionButtons && actionButtons.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {actionButtons.map((button, index) => (
                <Button
                  key={index}
                  variant={button.variant || 'contained'}
                  color={button.color || 'primary'}
                  size="small"
                  onClick={() => onAction && onAction(button.action, appointment)}
                  startIcon={button.icon}
                >
                  {button.label}
                </Button>
              ))}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;