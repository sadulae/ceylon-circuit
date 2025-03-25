import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const MessagePaper = styled(Paper)(({ theme, type }) => ({
  padding: theme.spacing(2),
  maxWidth: '80%',
  borderRadius: type === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
  marginBottom: theme.spacing(1),
  backgroundColor: type === 'user' ? theme.palette.primary.main : theme.palette.grey[100],
  color: type === 'user' ? theme.palette.primary.contrastText : theme.palette.text.primary,
  marginLeft: type === 'user' ? 'auto' : 0,
  marginRight: type === 'user' ? 0 : 'auto',
  boxShadow: theme.shadows[1],
  animation: `${fadeIn} 0.3s ease-out`,
  '& strong': {
    color: type === 'user' ? theme.palette.primary.contrastText : theme.palette.primary.main,
  },
  '& ul, & ol': {
    margin: 0,
    paddingLeft: theme.spacing(2.5),
  },
  '& li': {
    marginBottom: theme.spacing(0.5),
    '&:last-child': {
      marginBottom: 0,
    },
  },
}));

const TimeStamp = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  opacity: 0.8,
}));

const MessageContainer = styled(Box)(({ type }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: type === 'user' ? 'flex-end' : 'flex-start',
  maxWidth: '100%',
  animation: `${fadeIn} 0.3s ease-out`,
}));

const formatTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

const ChatMessage = ({ message }) => {
  return (
    <MessageContainer type={message.type}>
      <MessagePaper type={message.type} elevation={1}>
        {typeof message.content === 'string' ? (
          <Typography variant="body1">{message.content}</Typography>
        ) : (
          message.content
        )}
      </MessagePaper>
      <TimeStamp>{formatTime(message.timestamp)}</TimeStamp>
    </MessageContainer>
  );
};

export default ChatMessage; 