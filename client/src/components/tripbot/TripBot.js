import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Paper, Typography, Button, IconButton, Zoom, Fade, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatWindow from './chat/ChatWindow';
import { 
  ExploreOutlined, 
  InfoOutlined, 
  AccessTimeOutlined, 
  AttachMoneyOutlined,
  Close as CloseIcon,
  Add as AddIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  SmartToy as SmartToyIcon
} from '@mui/icons-material';
import { generateAIResponse } from '../../services/aiService';
import { testHuggingFaceAPI } from '../../services/testApi';

const StyledContainer = styled(Container)(({ theme }) => ({
  position: 'fixed',
  top: '80px',
  left: 0,
  right: 0,
  bottom: 0,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, #0F172A 0%, #1E2937 100%)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("https://images.unsplash.com/photo-1528181304800-259b08848526?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.1,
    zIndex: 0,
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
  '@media (max-width: 600px)': {
    top: '64px',
    padding: theme.spacing(2),
  },
}));

const FloatingRobot = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: '50%',
  right: theme.spacing(4),
  transform: 'translateY(-50%)',
  zIndex: 1000,
  animation: 'float 6s ease-in-out infinite',
  '@keyframes float': {
    '0%, 100%': {
      transform: 'translateY(-50%) translateX(0)',
    },
    '50%': {
      transform: 'translateY(-50%) translateX(20px)',
    },
  },
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(178,245,234,0.2) 0%, rgba(178,245,234,0) 70%)',
    borderRadius: '50%',
    animation: 'pulse 4s ease-in-out infinite',
    zIndex: -1,
  },
  '@keyframes pulse': {
    '0%, 100%': {
      transform: 'translate(-50%, -50%) scale(1)',
      opacity: 0.5,
    },
    '50%': {
      transform: 'translate(-50%, -50%) scale(1.2)',
      opacity: 0.2,
    },
  },
}));

const FloatingActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '28px',
  padding: theme.spacing(1.5, 3),
  boxShadow: '0 8px 16px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
  textTransform: 'none',
  fontWeight: 500,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: 'rgba(178,245,234,0.1)',
  color: '#B2F5EA',
  border: '1px solid rgba(178,245,234,0.2)',
  backdropFilter: 'blur(8px)',
  '&:hover': {
    backgroundColor: 'rgba(178,245,234,0.2)',
    color: '#B2F5EA',
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)',
  },
}));

const FloatingButtonContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: theme.spacing(2),
  zIndex: 1000,
}));

const SpeedDialButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(178,245,234,0.1)',
  color: '#B2F5EA',
  width: 56,
  height: 56,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid rgba(178,245,234,0.2)',
  '&:hover': {
    backgroundColor: 'rgba(178,245,234,0.2)',
    transform: 'scale(1.1) rotate(90deg)',
  },
  boxShadow: '0 8px 16px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
}));

const generateId = () => Math.random().toString(36).substr(2, 9);

const TripBot = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [context, setContext] = useState({});
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'connected', 'error'
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Test API connection on component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        await testHuggingFaceAPI();
        setApiStatus('connected');
        console.log('API connection successful');
      } catch (error) {
        console.error('API connection failed:', error);
        setApiStatus('error');
        // Add error message to chat
        setMessages(prev => [...prev, {
          id: generateId(),
          type: 'bot',
          content: (
            <Box>
              <Typography variant="body1" color="error" gutterBottom>
                I'm having trouble connecting to my AI service.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                I'll still help you with basic travel information while we resolve this issue.
              </Typography>
            </Box>
          ),
          timestamp: new Date()
        }]);
      }
    };

    checkApiConnection();
  }, []);

  const handleSuggestionClick = useCallback((suggestion) => {
    handleSendMessage(suggestion);
  }, []);

  useEffect(() => {
    const welcomeMessage = {
      id: generateId(),
      type: 'bot',
      content: (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ 
            fontWeight: 600, 
            color: '#B2F5EA',
            textShadow: '0 0 10px rgba(178,245,234,0.3)',
          }}>
            Ayubowan! 👋
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ color: '#E2E8F0', mb: 3 }}>
            I'm your personal travel assistant for planning the perfect Sri Lankan adventure. How can I help you today?
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            mb: 2
          }}>
            {[
              { name: 'Sigiriya', desc: 'Ancient rock fortress with panoramic views', icon: '🏰' },
              { name: 'Kandy', desc: 'Cultural heart with the Temple of the Tooth', icon: '🏛️' },
              { name: 'Galle', desc: 'Charming colonial fort city by the sea', icon: '🌊' },
              { name: 'Yala National Park', desc: 'Wildlife paradise with leopards', icon: '🐆' }
            ].map((place) => (
              <Paper
                key={place.name}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.1)',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    bgcolor: 'rgba(255,255,255,0.08)',
                  }
                }}
              >
                <Typography variant="h3" sx={{ mb: 1, fontSize: '2rem' }}>{place.icon}</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: '#B2F5EA' }}>{place.name}</Typography>
                <Typography variant="body2" sx={{ color: '#E2E8F0' }}>{place.desc}</Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      ),
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async (message) => {
    const userMessage = {
      id: generateId(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setShowActions(false);

    try {
      const response = await generateAIResponse(message, context);
      
      // Update context based on the response
      if (response.type === 'accommodation' && Array.isArray(response.content)) {
        setContext(prev => ({ ...prev, location: response.content[0]?.location }));
      }
      
      const botMessage = {
        id: generateId(),
        type: 'bot',
        content: formatBotResponse(response),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage = {
        id: generateId(),
        type: 'bot',
        content: (
          <Box>
            <Typography variant="body1" color="error" gutterBottom>
              I apologize, but I encountered an error processing your request.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please try rephrasing your question or ask about something else.
            </Typography>
          </Box>
        ),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatBotResponse = (response) => {
    switch (response.type) {
      case 'accommodation':
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#B2F5EA', fontWeight: 600 }}>
              Here are some accommodations that match your preferences:
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              mb: 2
            }}>
              {response.content.map((acc) => (
                <Paper
                  key={acc.name}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.1)',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      bgcolor: 'rgba(255,255,255,0.08)',
                    }
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: '#B2F5EA' }}>
                    {acc.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#E2E8F0', mb: 1 }}>
                    {acc.location}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#E2E8F0' }}>
                    ${acc.price} per night
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        );
      
      case 'activity':
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#B2F5EA', fontWeight: 600 }}>
              Here are some activities you might enjoy:
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              mb: 2
            }}>
              {response.content.map((activity) => (
                <Paper
                  key={activity.name}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.1)',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      bgcolor: 'rgba(255,255,255,0.08)',
                    }
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: '#B2F5EA' }}>
                    {activity.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#E2E8F0', mb: 1 }}>
                    {activity.location}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#E2E8F0' }}>
                    ${activity.price} - {activity.duration}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        );
      
      case 'transport':
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#B2F5EA', fontWeight: 600 }}>
              Here are some transport options:
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              mb: 2
            }}>
              {response.content.map((t) => (
                <Paper
                  key={t.name}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.1)',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      bgcolor: 'rgba(255,255,255,0.08)',
                    }
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: '#B2F5EA' }}>
                    {t.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#E2E8F0', mb: 1 }}>
                    {t.type}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#E2E8F0' }}>
                    ${t.price} - Capacity: {t.capacity}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        );
      
      case 'itinerary':
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#B2F5EA', fontWeight: 600 }}>
              Here's a suggested itinerary for your trip:
            </Typography>
            {response.content.days.map((day) => (
              <Paper
                key={day.day}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.1)',
                  bgcolor: 'rgba(255,255,255,0.05)',
                  mb: 2,
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    bgcolor: 'rgba(255,255,255,0.08)',
                  }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#B2F5EA' }}>
                  Day {day.day}
                </Typography>
                {day.activities.map((activity, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#E2E8F0' }}>
                      {activity.time}: {activity.activity.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#E2E8F0', ml: 2 }}>
                      Transport: {activity.transport.name}
                    </Typography>
                  </Box>
                ))}
                <Typography variant="body2" sx={{ color: '#E2E8F0', mt: 1 }}>
                  Accommodation: {day.accommodation.name}
                </Typography>
              </Paper>
            ))}
          </Box>
        );
      
      case 'budget':
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#B2F5EA', fontWeight: 600 }}>
              Budget Information
            </Typography>
            <Typography variant="body1" sx={{ color: '#E2E8F0' }}>
              {response.content}
            </Typography>
          </Box>
        );
      
      case 'location':
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: '#B2F5EA', fontWeight: 600 }}>
              Available Locations
            </Typography>
            <Typography variant="body1" sx={{ color: '#E2E8F0' }}>
              {response.content}
            </Typography>
          </Box>
        );
      
      default:
        return (
          <Box>
            <Typography variant="body1" sx={{ color: '#E2E8F0' }}>
              {response.content}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <StyledContainer>
      <FloatingRobot>
        <SmartToyIcon sx={{ fontSize: 120, color: '#B2F5EA', opacity: 0.8 }} />
      </FloatingRobot>
      <ChatWindow
        messages={messages}
        onSendMessage={handleSendMessage}
        isTyping={isTyping}
        isDarkMode={true}
      />
      <FloatingButtonContainer>
        <FloatingActionButton
          onClick={() => setShowActions(!showActions)}
          startIcon={<AddIcon />}
        >
          {showActions ? 'Close' : 'Quick Actions'}
        </FloatingActionButton>
        {showActions && (
          <Zoom in={showActions}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <SpeedDialButton onClick={() => handleSuggestionClick("Plan my trip")}>
                <ExploreOutlined />
              </SpeedDialButton>
              <SpeedDialButton onClick={() => handleSuggestionClick("Show popular destinations")}>
                <InfoOutlined />
              </SpeedDialButton>
      </Box>
          </Zoom>
        )}
      </FloatingButtonContainer>
    </StyledContainer>
  );
};

export default TripBot; 