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
  LightMode as LightModeIcon
} from '@mui/icons-material';

const StyledContainer = styled(Container)(({ theme }) => ({
  position: 'fixed',
  top: '80px',
  left: 0,
  right: 0,
  bottom: 0,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' 
    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
  '@media (max-width: 600px)': {
    top: '64px',
    padding: theme.spacing(2),
  },
}));

const FloatingActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '28px',
  padding: theme.spacing(1.5, 3),
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 16px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)'
    : '0 8px 16px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05)',
  textTransform: 'none',
  fontWeight: 500,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255,255,255,0.05)'
    : theme.palette.background.paper,
  color: theme.palette.primary.main,
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : theme.palette.primary.main}`,
  backdropFilter: 'blur(8px)',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    transform: 'translateY(-2px) scale(1.02)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 12px 24px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)'
      : '0 12px 20px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)',
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
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255,255,255,0.05)'
    : theme.palette.primary.main,
  color: theme.palette.mode === 'dark'
    ? theme.palette.primary.main
    : theme.palette.common.white,
  width: 56,
  height: 56,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.1)'
      : theme.palette.primary.dark,
    transform: 'scale(1.1) rotate(90deg)',
  },
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 16px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)'
    : '0 8px 16px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05)',
}));

const ThemeModeButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(3),
  right: theme.spacing(3),
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(255,255,255,0.05)'
    : 'rgba(0,0,0,0.05)',
  color: theme.palette.mode === 'dark'
    ? theme.palette.common.white
    : theme.palette.grey[900],
  backdropFilter: 'blur(8px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.1)'
      : 'rgba(0,0,0,0.1)',
    transform: 'scale(1.1)',
  },
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const generateId = () => Math.random().toString(36).substr(2, 9);

const TripBot = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSuggestionClick = useCallback((suggestion) => {
    handleSendMessage(suggestion);
  }, []);

  useEffect(() => {
    const welcomeMessage = {
      id: generateId(),
      type: 'bot',
      content: (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            👋 Welcome to Ceylon Circuit!
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ color: 'text.secondary', mb: 3 }}>
            I'm your personal travel assistant for planning the perfect Sri Lankan adventure. How can I help you today?
          </Typography>
        </Box>
      ),
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = (message) => {
    const userMessage = {
      id: generateId(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setShowActions(false);

    setTimeout(() => {
      const botMessage = {
        id: generateId(),
        type: 'bot',
        content: generateBotResponse(message),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('plan') && lowerMessage.includes('trip')) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
            Excellent choice! Let's create your perfect Sri Lankan itinerary 🌴
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ color: 'text.secondary', mb: 2 }}>
            To personalize your experience, I'll need a few details:
          </Typography>
          <Box sx={{ 
            bgcolor: 'background.paper', 
            p: 2, 
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            mb: 2
          }}>
            <Box component="ul" sx={{ pl: 2, mb: 0, '& li': { mb: 1 } }}>
              <li>📅 When would you like to travel?</li>
              <li>⏱️ How long do you plan to stay?</li>
              <li>💰 What's your budget range?</li>
              <li>🎯 What interests you most?</li>
            </Box>
          </Box>
          <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
            Let's start with your travel dates - when are you thinking of visiting Sri Lanka?
          </Typography>
        </Box>
      );
    }
    
    if (lowerMessage.includes('popular destinations')) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
            Discover Sri Lanka's Most Beautiful Places 🌟
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
              { name: 'Yala National Park', desc: 'Wildlife paradise with leopards', icon: '🐆' },
              { name: 'Mirissa', desc: 'Stunning beaches and whale watching', icon: '🐋' }
            ].map((place) => (
              <Paper
                key={place.name}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                <Typography variant="h3" sx={{ mb: 1, fontSize: '2rem' }}>{place.icon}</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>{place.name}</Typography>
                <Typography variant="body2" color="text.secondary">{place.desc}</Typography>
              </Paper>
            ))}
          </Box>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Would you like to learn more about any of these places or start planning a visit?
          </Typography>
        </Box>
      );
    }

    if (lowerMessage.includes('best time')) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
            Best Times to Visit Sri Lanka 🗓️
          </Typography>
          <Box sx={{ 
            bgcolor: 'background.paper',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            mb: 2
          }}>
            {[
              { season: 'December to March', desc: 'Perfect for the west and south coasts', icon: '🏖️' },
              { season: 'April to September', desc: 'Ideal for the east coast', icon: '🌅' },
              { season: 'January to March', desc: 'Best for wildlife watching', icon: '🦁' },
              { season: 'Year-round', desc: 'Cultural sites and attractions', icon: '🏛️' }
            ].map((time, index) => (
              <Box
                key={time.season}
                sx={{
                  p: 2,
                  borderBottom: index < 3 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {time.icon} {time.season}
                </Typography>
                <Typography variant="body2" color="text.secondary">{time.desc}</Typography>
              </Box>
            ))}
          </Box>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            When are you planning to travel? I can help you choose the perfect destinations for that time of year!
          </Typography>
        </Box>
      );
    }

    if (lowerMessage.includes('budget')) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
            Sri Lanka Travel Budget Guide 💰
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            mb: 3
          }}>
            {[
              { level: 'Budget', cost: '$30-50/day', desc: 'Basic accommodations, local food', icon: '🏨' },
              { level: 'Mid-range', cost: '$100-200/day', desc: '3-star hotels, guided tours', icon: '⭐' },
              { level: 'Luxury', cost: '$200+/day', desc: '5-star resorts, private tours', icon: '🌟' }
            ].map((budget) => (
              <Paper
                key={budget.level}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center'
                }}
              >
                <Typography variant="h3" sx={{ mb: 1, fontSize: '2rem' }}>{budget.icon}</Typography>
                <Typography variant="h6" sx={{ mb: 0.5 }}>{budget.level}</Typography>
                <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 600, mb: 1 }}>
                  {budget.cost}
                </Typography>
                <Typography variant="body2" color="text.secondary">{budget.desc}</Typography>
              </Paper>
            ))}
          </Box>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            What's your preferred budget range? I can help plan activities and accommodations accordingly!
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
          Ready to Plan Your Sri Lankan Adventure! 🌴
        </Typography>
        <Box sx={{ 
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          mb: 2
        }}>
          {[
            { title: 'Destinations', desc: 'Find the perfect places to visit', icon: '📍' },
            { title: 'Trip Planning', desc: 'Customize your itinerary', icon: '📅' },
            { title: 'Accommodations', desc: 'Find the best places to stay', icon: '🏨' },
            { title: 'Activities', desc: 'Discover amazing experiences', icon: '🎯' }
          ].map((service) => (
            <Paper
              key={service.title}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Typography variant="h3" sx={{ mb: 1, fontSize: '2rem' }}>{service.icon}</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{service.title}</Typography>
              <Typography variant="body2" color="text.secondary">{service.desc}</Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <StyledContainer maxWidth="md">
      <ThemeModeButton onClick={() => setIsDarkMode(!isDarkMode)}>
        {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </ThemeModeButton>
      
      <Paper 
        elevation={0}
        sx={{ 
          height: '100%',
          borderRadius: 4,
          overflow: 'hidden',
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.05)'
            : theme.palette.background.paper,
          display: 'flex',
          flexDirection: 'column',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.1)'
            : 'rgba(0,0,0,0.1)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0,0,0,0.4), 0 2px 16px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)'
            : '0 8px 32px rgba(0,0,0,0.1), 0 2px 16px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.05)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: theme.palette.mode === 'dark'
              ? '0 12px 48px rgba(0,0,0,0.5), 0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)'
              : '0 12px 48px rgba(0,0,0,0.15), 0 4px 24px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.1)',
          }
        }}
      >
        <ChatWindow
          messages={messages}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          isDarkMode={isDarkMode}
        />
      </Paper>

      <FloatingButtonContainer>
        <Zoom in={showActions}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {!isMobile && (
              <>
                <Fade in={showActions}>
                  <FloatingActionButton
                    startIcon={<ExploreOutlined />}
                    onClick={() => handleSuggestionClick("I want to plan a new trip")}
                  >
                    Plan New Trip
                  </FloatingActionButton>
                </Fade>
                <Fade in={showActions} style={{ transitionDelay: showActions ? '50ms' : '0ms' }}>
                  <FloatingActionButton
                    startIcon={<InfoOutlined />}
                    onClick={() => handleSuggestionClick("Show me popular destinations")}
                  >
                    Popular Destinations
                  </FloatingActionButton>
                </Fade>
                <Fade in={showActions} style={{ transitionDelay: showActions ? '100ms' : '0ms' }}>
                  <FloatingActionButton
                    startIcon={<AccessTimeOutlined />}
                    onClick={() => handleSuggestionClick("When is the best time to visit?")}
                  >
                    Best Time to Visit
                  </FloatingActionButton>
                </Fade>
                <Fade in={showActions} style={{ transitionDelay: showActions ? '150ms' : '0ms' }}>
                  <FloatingActionButton
                    startIcon={<AttachMoneyOutlined />}
                    onClick={() => handleSuggestionClick("What's the typical budget needed?")}
                  >
                    Travel Budget
                  </FloatingActionButton>
                </Fade>
              </>
            )}
      </Box>
        </Zoom>
        <SpeedDialButton 
          onClick={() => setShowActions(!showActions)}
          sx={{
            transform: showActions ? 'rotate(45deg)' : 'none',
          }}
        >
          {showActions ? <CloseIcon /> : <AddIcon />}
        </SpeedDialButton>
      </FloatingButtonContainer>
    </StyledContainer>
  );
};

export default TripBot; 