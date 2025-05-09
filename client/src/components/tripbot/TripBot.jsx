import React, { useState, useEffect } from 'react';
import { Box, Paper, ToggleButton, ToggleButtonGroup, Typography, Container, ThemeProvider, createTheme } from '@mui/material';
import { Chat as ChatIcon, Map as MapIcon } from '@mui/icons-material';
import TripPlanViewer from './TripPlanViewer';
import ChatInterface from './chat/ChatInterface';
import TripBotLoader from './TripBotLoader';

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4FD1C5',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
});

const TripBot = () => {
  const [view, setView] = useState('chat');
  const [tripPlan, setTripPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('TripBot mounted with view:', view);
    
    // Add dark-theme class to body when component mounts
    document.body.classList.add('dark-theme');
    
    // Remove dark-theme class when component unmounts
    return () => {
      document.body.classList.remove('dark-theme');
    };
  }, []);

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      console.log('Changing view to:', newView);
      setView(newView);
    }
  };

  const handleLoadComplete = () => {
    setLoading(false);
  };

  const handleTripPlanGenerated = (plan) => {
    setTripPlan(plan);
    setView('planner');
  };

  // Show the loader while loading is true
  if (loading) {
    return <TripBotLoader onLoadComplete={handleLoadComplete} />;
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Box className="dark-theme" sx={{ 
        bgcolor: '#121212',
        minHeight: '100vh',
        width: '100vw',
        maxWidth: '100%',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Header */}
        <Box 
          sx={{ 
            width: '100%',
            py: 3,
            px: { xs: 2, sm: 4 },
            textAlign: 'center',
            bgcolor: '#121212',
          }}
        >
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 600, 
              color: '#4FD1C5',
              mb: 3,
              fontFamily: "'Poppins', sans-serif" 
            }}
          >
            Sri Lanka Trip Planner
          </Typography>
          
          {/* View Toggle */}
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: 2, 
              bgcolor: '#1E1E1E', 
              display: 'inline-block',
              mx: 'auto'
            }}
          >
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={handleViewChange}
              aria-label="view mode"
            >
              <ToggleButton 
                value="chat" 
                aria-label="chat view"
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  color: '#E2E8F0',
                  '&.Mui-selected': {
                    backgroundColor: '#4FD1C5',
                    color: '#121212',
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
                  color: '#E2E8F0',
                  '&.Mui-selected': {
                    backgroundColor: '#4FD1C5',
                    color: '#121212',
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
          maxWidth: '1600px',  
          flexGrow: 1,
          height: 'calc(100vh - 140px)',
          position: 'relative',
          mx: 'auto',
          bgcolor: '#121212'
        }}>
          <Paper 
            elevation={4} 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              bgcolor: '#1E1E1E',
              position: 'relative',
              overflow: 'hidden',
              width: '100%'
            }}
          >
            <Box sx={{ 
              display: view === 'chat' ? 'block' : 'none',
              height: '100%',
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: 'hidden',
              bgcolor: '#1E1E1E'
            }}>
              <ChatInterface onTripPlanGenerated={handleTripPlanGenerated} isDarkMode={true} />
            </Box>
            <Box sx={{ 
              display: view === 'planner' ? 'block' : 'none',
              height: '100%',
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: 'hidden',
              bgcolor: '#1E1E1E'
            }}>
              <TripPlanViewer tripPlan={tripPlan} isDarkMode={true} />
            </Box>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default TripBot; 