import React, { useRef, useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress, Fade } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const pulseAnimation = keyframes`
  0% { transform: scale(0.95); opacity: 0.6; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.6; }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ChatContainer = styled(Paper)(({ theme, isDarkMode }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: isDarkMode 
    ? 'rgba(30, 41, 55, 0.8)' 
    : theme.palette.background.default,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  position: 'relative',
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(10px)',
  border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
}));

const MessagesContainer = styled(Box)(({ theme, isDarkMode }) => ({
  flexGrow: 1,
  overflow: 'auto',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  scrollBehavior: 'smooth',
  backgroundColor: isDarkMode 
    ? 'rgba(18, 18, 18, 0.4)' 
    : 'rgba(255, 255, 255, 0.8)',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: isDarkMode 
      ? 'rgba(255, 255, 255, 0.05)'
      : theme.palette.background.default,
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: isDarkMode 
      ? 'rgba(255, 255, 255, 0.1)'
      : theme.palette.grey[400],
    borderRadius: '4px',
    '&:hover': {
      background: isDarkMode 
        ? 'rgba(255, 255, 255, 0.2)'
        : theme.palette.grey[500],
    },
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const TypingIndicator = styled(Box)(({ theme, isDarkMode }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5, 2.5),
  backgroundColor: isDarkMode 
    ? 'rgba(255, 255, 255, 0.05)'
    : theme.palette.background.paper,
  borderRadius: '1.5rem',
  width: 'fit-content',
  marginBottom: theme.spacing(1),
  boxShadow: isDarkMode
    ? '0 2px 12px rgba(0,0,0,0.2)'
    : '0 2px 12px rgba(0,0,0,0.1)',
  animation: `${pulseAnimation} 2s ease-in-out infinite`,
  backdropFilter: 'blur(8px)',
  border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : 'none',
}));

const InputWrapper = styled(Box)(({ theme, isDarkMode }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : theme.palette.divider}`,
  backgroundColor: isDarkMode
    ? 'rgba(30, 41, 55, 0.8)'
    : theme.palette.background.paper,
  backdropFilter: 'blur(10px)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5, 2),
  },
}));

const MessageWrapper = styled(Box)(({ theme }) => ({
  animation: `${fadeInUp} 0.3s ease-out forwards`,
}));

const ChatWindow = ({ 
  messages = [], 
  onSendMessage, 
  isTyping = false,
  disabled = false,
  isDarkMode = false,
  className 
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <ChatContainer elevation={0} className={className} isDarkMode={isDarkMode}>
      <MessagesContainer ref={messagesContainerRef} isDarkMode={isDarkMode}>
        {messages.map((message, index) => (
          <Fade 
            key={message.id} 
            in={true} 
            timeout={300}
            style={{ 
              transitionDelay: `${index * 50}ms`,
              transformOrigin: message.type === 'user' ? 'right' : 'left'
            }}
          >
            <MessageWrapper>
              <ChatMessage message={message} isDarkMode={isDarkMode} />
            </MessageWrapper>
          </Fade>
        ))}
        
        {isTyping && (
          <Fade in={isTyping} timeout={200}>
            <TypingIndicator isDarkMode={isDarkMode}>
              <CircularProgress 
                size={16} 
                thickness={5} 
                color="primary"
                sx={{
                  color: isDarkMode ? 'primary.light' : 'primary.main'
                }}
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: isDarkMode ? 'grey.300' : 'text.primary',
                  fontWeight: 500,
                  letterSpacing: 0.2,
                }}
              >
                Ceylon Circuit is thinking...
              </Typography>
            </TypingIndicator>
          </Fade>
        )}
        
        <div ref={messagesEndRef} style={{ height: 1 }} />
      </MessagesContainer>
      
      <InputWrapper isDarkMode={isDarkMode}>
        <ChatInput 
          onSend={onSendMessage} 
          disabled={disabled || isTyping}
          isDarkMode={isDarkMode}
          autoFocus
        />
      </InputWrapper>
    </ChatContainer>
  );
};

export default ChatWindow; 