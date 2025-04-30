import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Paper, Tooltip, Zoom } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Send as SendIcon } from '@mui/icons-material';

const InputContainer = styled(Paper)(({ theme, isDarkMode }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: isDarkMode
    ? 'rgba(255, 255, 255, 0.05)'
    : theme.palette.background.paper,
  borderRadius: '2rem',
  boxShadow: isDarkMode
    ? '0 2px 12px rgba(0,0,0,0.2)'
    : '0 2px 12px rgba(0,0,0,0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
  '&:hover': {
    boxShadow: isDarkMode
      ? '0 4px 20px rgba(0,0,0,0.3)'
      : '0 4px 20px rgba(0,0,0,0.12)',
    backgroundColor: isDarkMode
      ? 'rgba(255, 255, 255, 0.08)'
      : theme.palette.background.paper,
  },
}));

const StyledTextField = styled(TextField)(({ theme, isDarkMode }) => ({
  flex: 1,
  '& .MuiInputBase-root': {
    padding: theme.spacing(1, 2),
    borderRadius: '2rem',
    backgroundColor: 'transparent',
    color: isDarkMode ? '#E2E8F0' : theme.palette.text.primary,
    '&.Mui-focused': {
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.05)'
        : theme.palette.background.default,
    },
    '&:hover': {
      backgroundColor: isDarkMode
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.02)',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '& .MuiInputBase-input': {
    padding: 0,
    fontSize: '1rem',
    lineHeight: 1.5,
    '&::placeholder': {
      color: isDarkMode 
        ? 'rgba(226, 232, 240, 0.5)'
        : theme.palette.text.secondary,
      opacity: 0.8,
    },
  },
}));

const SendButton = styled(IconButton)(({ theme, isDarkMode }) => ({
  backgroundColor: isDarkMode ? '#B2F5EA' : theme.palette.primary.main,
  color: isDarkMode ? '#1E2937' : theme.palette.common.white,
  width: 40,
  height: 40,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: isDarkMode ? '#A5F3E0' : theme.palette.primary.dark,
    transform: 'scale(1.05) rotate(10deg)',
  },
  '&.Mui-disabled': {
    backgroundColor: isDarkMode
      ? 'rgba(255, 255, 255, 0.1)'
      : theme.palette.action.disabledBackground,
    color: isDarkMode
      ? 'rgba(255, 255, 255, 0.3)'
      : theme.palette.action.disabled,
  },
}));

const ChatInput = ({ 
  onSend, 
  disabled = false,
  autoFocus = false,
  isDarkMode = false,
  placeholder = "Type your message..."
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <InputContainer elevation={0} isDarkMode={isDarkMode}>
        <StyledTextField
          inputRef={inputRef}
          fullWidth
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          multiline
          maxRows={4}
          isDarkMode={isDarkMode}
          sx={{ 
            '& .MuiInputBase-root': {
              transition: 'background-color 0.3s ease',
            }
          }}
        />
        <Tooltip 
          title="Send message" 
          placement="top" 
          TransitionComponent={Zoom}
          arrow
        >
          <Box>
            <SendButton
              type="submit"
              disabled={!message.trim() || disabled}
              size="medium"
              isDarkMode={isDarkMode}
            >
              <SendIcon fontSize="small" />
            </SendButton>
          </Box>
        </Tooltip>
      </InputContainer>
    </Box>
  );
};

export default ChatInput; 