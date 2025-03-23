import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Alert,
  LinearProgress
} from '@mui/material';
import axios from 'axios';

const TripPlanGenerator = ({ preferences, onPlanGenerated }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const generatePlan = async () => {
      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setProgress((prevProgress) => {
            const newProgress = prevProgress + 10;
            return newProgress >= 90 ? 90 : newProgress;
          });
        }, 1000);

        // API call to generate trip plan
        const response = await axios.post('/api/tripbot/generate-plan', preferences);
        
        clearInterval(progressInterval);
        setProgress(100);
        setLoading(false);
        
        // Pass the generated plan back to parent
        onPlanGenerated(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to generate trip plan');
        setLoading(false);
      }
    };

    generatePlan();
  }, [preferences, onPlanGenerated]);

  if (error) {
    return (
      <Box sx={{ mt: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px'
    }}>
      {loading && (
        <>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>
            Generating Your Perfect Trip Plan
          </Typography>
          <Box sx={{ width: '100%', maxWidth: 400, mt: 3 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              {progress}% Complete
            </Typography>
          </Box>
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Analyzing your preferences...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Matching with the best destinations and experiences in Sri Lanka
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default TripPlanGenerator;
