import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';

const ChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with welcome message
  useEffect(() => {
    const initialMessage = {
      type: 'bot',
      content: 'Welcome to Ceylon Circuit! 🌴 Before we start planning your perfect Sri Lankan adventure, I\'d love to know - have you visited our beautiful island before? This will help me tailor the perfect experience for you.',
      suggestions: ['No, first time', 'Yes, I have visited before']
    };
    setMessages([initialMessage]);
  }, []);

  const handleSendMessage = async (messageText) => {
    try {
      const userMessage = messageText || input;
      if (!userMessage.trim()) return;

      // Add user message to chat
      const newUserMessage = { type: 'user', content: userMessage };
      setMessages(prev => [...prev, newUserMessage]);
      setInput('');
      setIsLoading(true);

      // Get all previous messages for context
      const messageHistory = [...messages, newUserMessage];

      // Send request to backend
      const response = await axios.post('/api/tripbot/chat', {
        message: userMessage,
        context: messageHistory
      });

      if (response.data.success) {
        const botResponse = response.data.response;
        setMessages(prev => [...prev, {
          type: 'bot',
          content: botResponse.content,
          suggestions: botResponse.suggestions || []
        }]);
      } else {
        throw new Error(response.data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: "I apologize, but I'm having trouble connecting to the server. Please try again in a moment.",
        error: true
      }]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const handleReset = () => {
    const initialMessage = {
      type: 'bot',
      content: 'Welcome to Ceylon Circuit! 🌴 Before we start planning your perfect Sri Lankan adventure, I\'d love to know - have you visited our beautiful island before? This will help me tailor the perfect experience for you.',
      suggestions: ['No, first time', 'Yes, I have visited before']
    };
    setMessages([initialMessage]);
  };

  const renderMessage = (message, index) => {
    const isBot = message.type === 'bot';

    return (
      <Box
        key={index}
        sx={{
          display: 'flex',
          justifyContent: isBot ? 'flex-start' : 'flex-end',
          mb: 2,
          width: '100%'
        }}
      >
        <Box sx={{ display: 'flex', maxWidth: '70%', alignItems: 'flex-start' }}>
          {isBot && (
            <Avatar 
              sx={{ mr: 1, bgcolor: 'primary.main' }}
              alt="Bot"
            >
              B
            </Avatar>
          )}
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: isBot ? 'grey.100' : 'primary.main',
              color: isBot ? 'text.primary' : 'white',
              borderRadius: 2,
              width: '100%'
            }}
          >
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>

            {isBot && message.suggestions && message.suggestions.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {message.suggestions.map((suggestion, i) => (
                  <Chip
                    key={i}
                    label={suggestion}
                    onClick={() => handleSendMessage(suggestion)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: 'white',
                      '&:hover': {
                        bgcolor: 'primary.light',
                        color: 'white'
                      }
                    }}
                  />
                ))}
              </Box>
            )}
          </Paper>
          {!isBot && (
            <Avatar 
              sx={{ ml: 1, bgcolor: 'secondary.main' }}
              alt="User"
            >
              U
            </Avatar>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Ceylon Circuit Travel Assistant</Typography>
        <IconButton color="inherit" onClick={handleReset} title="Start New Chat">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Chat messages */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message, index) => renderMessage(message, index))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Loading indicator */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Input area */}
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
          />
          <IconButton 
            color="primary" 
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatAssistant; 