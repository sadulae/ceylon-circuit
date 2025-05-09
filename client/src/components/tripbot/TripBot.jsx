import React, { useState, useEffect } from 'react';
import { Box, Paper, ToggleButton, ToggleButtonGroup, Typography, Container } from '@mui/material';
import { Chat as ChatIcon, Map as MapIcon } from '@mui/icons-material';
import TripPlanViewer from './TripPlanViewer';
import ChatInterface from './chat/ChatInterface';

const TripBot = () => {
  const [view, setView] = useState('chat');
  const [tripPlan, setTripPlan] = useState(null);

  useEffect(() => {
    console.log('TripBot mounted with view:', view);
  }, [view]);

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      console.log('Changing view to:', newView);
      setView(newView);
    }
  };

  const handleTripPlanGenerated = (plan) => {
    setTripPlan(plan);
    setView('planner');
  };

  return (
    <Container maxWidth="xl" sx={{ 
      minHeight: '100vh',
      bgcolor: '#f5f5f5',
      py: 4,
      px: { xs: 2, md: 4 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 600, 
          color: '#1A365D',
          textAlign: 'center',
          mb: 3,
          fontFamily: "'Poppins', sans-serif" 
        }}
      >
        Sri Lanka Trip Planner
      </Typography>
      
      {/* View Toggle */}
      <Box sx={{ mb: 3, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={3} sx={{ borderRadius: 2 }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={handleViewChange}
            aria-label="view mode"
            sx={{ width: '100%' }}
          >
            <ToggleButton 
              value="chat" 
              aria-label="chat view"
              sx={{ 
                px: 4, 
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: '#4FD1C5',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#38A89D',
                  },
                }
              }}
            >
              <ChatIcon sx={{ mr: 1 }} /> AI Assistant
            </ToggleButton>
            <ToggleButton 
              value="planner" 
              aria-label="planner view"
              sx={{ 
                px: 4, 
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: '#4FD1C5',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#38A89D',
                  },
                }
              }}
            >
              <MapIcon sx={{ mr: 1 }} /> Trip Plan
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>
      </Box>

      {/* Content */}
      <Box sx={{ 
        width: '100%',
        maxWidth: '1200px', 
        mx: 'auto',
        flexGrow: 1,
        height: { xs: 'calc(100vh - 180px)', md: 'calc(100vh - 200px)' },
        position: 'relative'
      }}>
        <Paper 
          elevation={4} 
          sx={{ 
            height: '100%',
            overflow: 'hidden',
            borderRadius: 2
          }}
        >
          <Box sx={{ 
            display: view === 'chat' ? 'block' : 'none',
            height: '100%'
          }}>
            <ChatInterface onTripPlanGenerated={handleTripPlanGenerated} />
          </Box>
          <Box sx={{ 
            display: view === 'planner' ? 'block' : 'none',
            height: '100%'
          }}>
            <TripPlanViewer tripPlan={tripPlan} />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default TripBot; 