import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Container, Paper, Typography, Button, IconButton, Zoom, Fade, useTheme, useMediaQuery, LinearProgress } from '@mui/material';
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
  SmartToy as SmartToyIcon,
  SaveAlt as SaveIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { sendMessageToAI } from '../../services/aiService';
import TripPlanViewer from './TripPlanViewer';

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

const SuggestionButton = styled(Button)(({ theme }) => ({
  borderRadius: '28px',
  padding: theme.spacing(1, 2),
  margin: theme.spacing(0.5),
  textTransform: 'none',
  fontWeight: 500,
  backgroundColor: 'rgba(178,245,234,0.1)',
  color: '#B2F5EA',
  border: '1px solid rgba(178,245,234,0.2)',
  backdropFilter: 'blur(8px)',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(178,245,234,0.2)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  },
}));

const TripPlanContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: 'rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#fff',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
  overflow: 'auto',
  margin: theme.spacing(2, 0),
  maxHeight: '60vh',
  transition: 'all 0.3s ease',
  position: 'relative',
}));

const generateId = () => Math.random().toString(36).substr(2, 9);

const TripBot = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showPlanViewer, setShowPlanViewer] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const planRef = useRef(null);

  // Suggested messages to help users get started
  const suggestedMessages = [
    "I want to plan a trip to Sri Lanka for 7 days",
    "What are the best beaches to visit?",
    "I'm interested in wildlife and hiking",
    "Create an itinerary for Kandy and Ella"
  ];

  // Initialize chat with welcome message
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
            I'm your AI travel assistant for planning the perfect Sri Lankan adventure. I can create personalized itineraries based on your preferences and our extensive database of destinations, accommodations, and tour packages.
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
                    cursor: 'pointer'
                  }
                }}
                onClick={() => handleSendMessage(`Tell me about ${place.name}`)}
              >
                <Typography variant="h3" sx={{ mb: 1, fontSize: '2rem' }}>{place.icon}</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: '#B2F5EA' }}>{place.name}</Typography>
                <Typography variant="body2" sx={{ color: '#E2E8F0' }}>{place.desc}</Typography>
              </Paper>
            ))}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', mt: 3 }}>
            {suggestedMessages.map((msg, index) => (
              <SuggestionButton 
                key={index}
                onClick={() => handleSendMessage(msg)}
                startIcon={index % 2 === 0 ? <ExploreOutlined /> : <AccessTimeOutlined />}
              >
                {msg}
              </SuggestionButton>
            ))}
          </Box>
        </Box>
      ),
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Handle scroll to plan when it's rendered
  useEffect(() => {
    if (showPlanViewer && planRef.current) {
      planRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showPlanViewer]);

  // Format AI response based on type
  const formatBotResponse = (response) => {
    // Extract main content from response
    const { type, content, sessionId: responseSessionId } = response;
    
    // Update session ID if returned
    if (responseSessionId) {
      setSessionId(responseSessionId);
    }
    
    // Handle different response types
    if (type === 'text') {
      return {
        id: generateId(),
        type: 'bot',
        content: (
          <Typography variant="body1" sx={{ color: '#E2E8F0' }}>
            {content}
          </Typography>
        ),
        timestamp: new Date()
      };
    }
    
    if (type === 'preferences_request') {
      return {
        id: generateId(),
        type: 'bot',
        content: (
          <Box>
            <Typography variant="body1" sx={{ color: '#E2E8F0', mb: 2 }}>
              {content}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1, 
              justifyContent: { xs: 'center', sm: 'flex-start' } 
            }}>
              {response.missingInfo.includes('destinations') && (
                <SuggestionButton 
                  onClick={() => handleSendMessage("I want to visit Kandy, Sigiriya, and Ella")}
                  startIcon={<ExploreOutlined />}
                >
                  Popular destinations
                </SuggestionButton>
              )}
              {response.missingInfo.includes('trip duration') && (
                <SuggestionButton 
                  onClick={() => handleSendMessage("I'm planning a 7-day trip")}
                  startIcon={<AccessTimeOutlined />}
                >
                  7-day trip
                </SuggestionButton>
              )}
              {response.missingInfo.includes('interests') && (
                <SuggestionButton 
                  onClick={() => handleSendMessage("I'm interested in beaches, wildlife, and cultural sites")}
                  startIcon={<InfoOutlined />}
                >
                  My interests
                </SuggestionButton>
              )}
            </Box>
          </Box>
        ),
        timestamp: new Date()
      };
    }
    
    if (type === 'trip_plan') {
      // Store trip plan in state for detailed viewing
      setCurrentPlan(content);
      setShowPlanViewer(true);
      
      // Return summarized version for chat
      return {
        id: generateId(),
        type: 'bot',
        content: (
          <Box>
            <Typography variant="body1" sx={{ color: '#E2E8F0', mb: 2 }}>
              {content.summary}
            </Typography>
            
            <TripPlanContainer ref={planRef}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#B2F5EA', fontWeight: 600 }}>
                  Your Trip Plan
                </Typography>
                <Box>
                  <IconButton 
                    sx={{ color: '#B2F5EA' }}
                    onClick={() => setShowPlanViewer(state => !state)}
                  >
                    {showPlanViewer ? <CloseIcon /> : <SmartToyIcon />}
                  </IconButton>
                </Box>
              </Box>
              
              {showPlanViewer && (
                <TripPlanViewer 
                  plan={content} 
                  onSave={handleSavePlan}
                  onModify={() => handleSendMessage("I'd like to modify this plan")}
                />
              )}
              
              {!showPlanViewer && (
                <Button 
                  fullWidth 
                  variant="outlined" 
                  sx={{ 
                    borderColor: 'rgba(178,245,234,0.3)', 
                    color: '#B2F5EA',
                    mt: 1,
                    '&:hover': {
                      borderColor: 'rgba(178,245,234,0.6)',
                      backgroundColor: 'rgba(178,245,234,0.1)'
                    }
                  }}
                  onClick={() => setShowPlanViewer(true)}
                >
                  View Complete Itinerary
                </Button>
              )}
            </TripPlanContainer>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              <SuggestionButton 
                onClick={() => handleSendMessage("Can you modify this plan to include more beaches?")}
                startIcon={<ExploreOutlined />}
              >
                Add more beaches
              </SuggestionButton>
              <SuggestionButton 
                onClick={() => handleSendMessage("I'd like to extend this trip to 10 days")}
                startIcon={<AccessTimeOutlined />}
              >
                Extend trip
              </SuggestionButton>
              <SuggestionButton 
                onClick={() => handleSendMessage("Save this trip plan")}
                startIcon={<SaveIcon />}
              >
                Save plan
              </SuggestionButton>
            </Box>
          </Box>
        ),
        timestamp: new Date()
      };
    }
    
    if (type === 'confirmation') {
      return {
        id: generateId(),
        type: 'bot',
        content: (
          <Box>
            <Typography variant="body1" sx={{ color: '#E2E8F0', mb: 2 }}>
              {content.message}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <SuggestionButton 
                onClick={() => handleSendMessage("Yes, I'd like to proceed with booking")}
                startIcon={<SaveIcon />}
                sx={{ backgroundColor: 'rgba(52,211,153,0.2)' }}
              >
                Proceed to booking
              </SuggestionButton>
              <SuggestionButton 
                onClick={() => handleSendMessage("I'd like to make changes")}
              >
                Make changes
              </SuggestionButton>
              <SuggestionButton 
                onClick={() => handleSendMessage("Share this plan")}
                startIcon={<ShareIcon />}
              >
                Share plan
              </SuggestionButton>
            </Box>
          </Box>
        ),
        timestamp: new Date(),
        planId: content.planId
      };
    }
    
    // Default format for unknown response types
    return {
      id: generateId(),
      type: 'bot',
      content: (
        <Typography variant="body1" sx={{ color: '#E2E8F0' }}>
          {typeof content === 'string' ? content : 'I\'ve processed your request. What else would you like to know?'}
        </Typography>
      ),
      timestamp: new Date()
    };
  };

  // Handler for sending messages
  const handleSendMessage = async (message) => {
    // Add user message to chat
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
      // Send message to AI service with session ID if available
      const response = await sendMessageToAI(message, sessionId);
      
      // Format and add AI response to chat
      const botMessage = formatBotResponse(response);
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        id: generateId(),
        type: 'bot',
        content: (
          <Box>
            <Typography variant="body1" color="error" gutterBottom>
              I'm having trouble connecting to my AI service.
            </Typography>
            <Typography variant="body2" sx={{ color: '#E2E8F0' }}>
              Please try again later or contact support if the problem persists.
            </Typography>
          </Box>
        ),
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handler for suggestion clicks
  const handleSuggestionClick = useCallback((suggestion) => {
    handleSendMessage(suggestion);
  }, []);

  // Handler for saving trip plan
  const handleSavePlan = async () => {
    if (!currentPlan) return;
    
    setIsTyping(true);
    try {
      // Call save plan endpoint
      const saveMessage = "I'd like to save this trip plan";
      await handleSendMessage(saveMessage);
    } catch (error) {
      console.error('Error saving plan:', error);
      setMessages(prev => [...prev, {
        id: generateId(),
        type: 'bot',
        content: (
          <Typography variant="body1" color="error">
            There was an error saving your plan. Please try again.
          </Typography>
        ),
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <StyledContainer maxWidth="xl">
      <Box sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <ChatWindow 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isTyping={isTyping}
          disabled={false}
          isDarkMode={isDarkMode}
          sx={{ flexGrow: 1 }}
        />
      </Box>
      
      <FloatingButtonContainer>
        <Zoom in={true} style={{ transitionDelay: '300ms' }}>
          <SpeedDialButton 
            aria-label="Theme toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </SpeedDialButton>
        </Zoom>
      </FloatingButtonContainer>
    </StyledContainer>
  );
};

export default TripBot; 