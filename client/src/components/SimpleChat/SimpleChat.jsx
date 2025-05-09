import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

const SimpleChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Add initial greeting when component mounts
  useEffect(() => {
    setMessages([{
      type: 'bot',
      content: 'Hello! 👋 I\'m your AI assistant. How can I help you today?'
    }]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { type: 'user', content: input }]);
    const userMessage = input;
    setInput('');
    setIsLoading(true);

    try {
      // Send message to AI backend using the api instance
      const response = await api.post('/api/chat', {
        message: userMessage
      });

      if (response.data.success) {
        // Add AI response
        setMessages(prev => [...prev, {
          type: 'bot',
          content: response.data.response
        }]);
      } else {
        throw new Error(response.data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: "I apologize, but I'm having trouble connecting to the server. Please check if the server is running on port 5000.",
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">AI Chat Assistant</Typography>
      </Box>

      {/* Chat messages */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '70%' }}>
              {message.type === 'bot' && (
                <Avatar 
                  sx={{ mr: 1, bgcolor: 'primary.main' }}
                  alt="AI"
                >
                  AI
                </Avatar>
              )}
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  bgcolor: message.type === 'user' ? 'primary.main' : 'background.paper',
                  color: message.type === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                  ...(message.error && {
                    bgcolor: 'error.light',
                    color: 'error.contrastText'
                  })
                }}
              >
                <Typography variant="body1">
                  {message.content}
                </Typography>
              </Paper>
              {message.type === 'user' && (
                <Avatar 
                  sx={{ ml: 1, bgcolor: 'secondary.main' }}
                  alt="User"
                >
                  U
                </Avatar>
              )}
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Loading indicator */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* Input area */}
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <IconButton 
            type="submit"
            color="primary" 
            disabled={!input.trim() || isLoading}
          >
            <SendIcon />
          </IconButton>
        </form>
      </Box>
    </Box>
  );
};

export default SimpleChat; 