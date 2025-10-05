import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { ReportProblem, CheckCircle } from '@mui/icons-material';
import api from '../../services/api';

const FinancialAnomalies = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ai/financial-anomalies');
      setAnomalies(response.data.anomalies || []);
      setError('');
    } catch (err) {
      setError('Could not fetch financial anomalies.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ReportProblem sx={{ fontSize: 30, color: 'warning.main', mr: 2 }} />
        <Typography variant="h6" fontWeight={600}>
          Financial Anomaly Detection
        </Typography>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <List>
          {anomalies.map((anomaly, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       {anomaly.severity === 'success' ? <CheckCircle color="success"/> : <ReportProblem color="warning"/>}
                       <Typography variant="subtitle1" fontWeight="bold">{anomaly.type}</Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        display="block"
                        sx={{ mt: 1}}
                      >
                        {anomaly.message}
                      </Typography>
                      {anomaly.details && anomaly.details.length > 0 && (
                        <Box sx={{ pl: 2, mt: 1, borderLeft: '2px solid', borderColor: 'divider' }}>
                          {anomaly.details.map((detail, i) => (
                            <Typography key={i} variant="caption" display="block">
                              - {detail}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </>
                  }
                />
              </ListItem>
              {index < anomalies.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default FinancialAnomalies;
