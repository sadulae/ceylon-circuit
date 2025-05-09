import React from 'react';
import { Box, Paper, Typography, Chip, Avatar } from '@mui/material';
import { SmartToy as BotIcon, Person as PersonIcon } from '@mui/icons-material';

// Our database destinations - IMPORTANT: This MUST match the DATABASE_DESTINATIONS in ChatInterface.jsx
// Using only the names here for easier comparison in filters
const DATABASE_DESTINATIONS = [
  'Sigiriya Rock Fortress',
  'Mirissa Beach', 
  'Ella Rock',
  'Temple of the Tooth',
  'Yala National Park',
  'Galle Fort'
];

// Filter suggestions to remove any non-database destinations
const filterSuggestions = (suggestions) => {
  // First check if any suggestions contain destination names that aren't in our database
  const filteredSuggestions = suggestions.filter(suggestion => {
    // Check if this suggestion mentions any destination not in our database
    const mentionsNonDbDestination = [
      'Anuradhapura', 'Polonnaruwa', 'Dambulla', 'Nuwara Eliya', 'Colombo', 
      'Jaffna', 'Trincomalee', 'Arugam Bay', 'Negombo', 'Hikkaduwa', 
      'Batticaloa', 'Unawatuna', 'Bentota', 'Matara', 'Beruwala'
    ].some(nonDbDest => 
      suggestion.toLowerCase().includes(nonDbDest.toLowerCase())
    );
    
    return !mentionsNonDbDestination;
  });
  
  return filteredSuggestions.length > 0 ? filteredSuggestions : ['Show destinations', 'Tell me about Sri Lanka'];
};

// Filter message content to highlight when non-database destinations are mentioned
const filterMessageContent = (content) => {
  // List of destinations not in our database that we should highlight warnings for
  const nonDbDestinations = [
    'Anuradhapura', 'Polonnaruwa', 'Dambulla', 'Nuwara Eliya', 'Colombo', 
    'Jaffna', 'Trincomalee', 'Arugam Bay', 'Negombo', 'Hikkaduwa', 
    'Batticaloa', 'Unawatuna', 'Bentota', 'Matara', 'Beruwala',
    'Kandy' // Kandy city itself is not in database (only Temple of the Tooth)
  ];
  
  let filteredContent = content;
  
  // Check if content mentions any non-database destinations
  const mentionedNonDbDests = nonDbDestinations.filter(dest => 
    content.toLowerCase().includes(dest.toLowerCase())
  );
  
  if (mentionedNonDbDests.length > 0) {
    // Add a warning to the message content
    filteredContent += `\n\n⚠️ Note: ${mentionedNonDbDests.join(', ')} ${mentionedNonDbDests.length === 1 ? 'is not a destination' : 'are not destinations'} in our database. Please select from the available destinations shown in the cards.`;
  }
  
  return filteredContent;
};

// Add function to check if any database destinations are mentioned and provide custom response
const containsDatabaseDestinations = (content) => {
  return DATABASE_DESTINATIONS.some(dest => 
    content.toLowerCase().includes(dest.toLowerCase())
  );
};

const ChatMessage = ({ message, onSuggestionClick }) => {
  const isBot = message.type === 'bot';
  
  // Filter suggestions if this is a bot message
  const filteredSuggestions = isBot && message.suggestions ? 
    filterSuggestions(message.suggestions) : 
    message.suggestions;
  
  // Filter content if this is a bot message
  const filteredContent = isBot ? 
    filterMessageContent(message.content) : 
    message.content;
  
  // Check if bot message mentions database destinations
  const hasDbDestinations = isBot && containsDatabaseDestinations(message.content);
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isBot ? 'flex-start' : 'flex-end',
        width: '100%',
        mb: 2.5
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        maxWidth: { xs: '90%', sm: '75%' }, 
        alignItems: 'flex-start'
      }}>
        {isBot && (
          <Avatar 
            sx={{ 
              mr: 1.5, 
              bgcolor: '#4FD1C5',
              width: 42,
              height: 42,
              boxShadow: '0 2px 8px rgba(79, 209, 197, 0.25)',
              border: '2px solid #FFFFFF'
            }}
            alt="Bot"
          >
            <BotIcon fontSize="small" />
          </Avatar>
        )}
        
        <Box sx={{ maxWidth: 'calc(100% - 56px)' }}>
          <Paper
            elevation={1}
            sx={{
              py: 2.5,
              px: 3,
              bgcolor: isBot ? 'white' : '#4FD1C5',
              color: isBot ? '#2D3748' : 'white',
              borderRadius: isBot ? '0px 18px 18px 18px' : '18px 0px 18px 18px',
              width: '100%',
              boxShadow: isBot 
                ? '0 4px 16px rgba(0,0,0,0.06)' 
                : '0 4px 16px rgba(79, 209, 197, 0.25)'
            }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                whiteSpace: 'pre-wrap',
                fontFamily: "'Poppins', sans-serif",
                fontSize: '1rem',
                lineHeight: 1.6,
                fontWeight: 400,
                letterSpacing: '0.01em'
              }}
            >
              {filteredContent}
            </Typography>
            
            {/* Display button to show database destinations when bot suggests non-database places */}
            {hasDbDestinations && (
              <Box sx={{ 
                mt: 2.5, 
                p: 2, 
                bgcolor: 'rgba(79, 209, 197, 0.08)', 
                borderRadius: 2,
                border: '1px solid rgba(79, 209, 197, 0.15)'
              }}>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', color: '#2C7A7B', fontWeight: 500 }}>
                  I see you're interested in destinations from our database! Click below to see all available options.
                </Typography>
                <Box sx={{ mt: 1.5 }}>
                  <Chip
                    label="Show all destinations"
                    onClick={() => onSuggestionClick('Show destinations')}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: '#4FD1C5',
                      color: 'white',
                      py: 2.5,
                      px: 1,
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      '&:hover': {
                        bgcolor: '#38A89D',
                      }
                    }}
                  />
                </Box>
              </Box>
            )}
          </Paper>

          {isBot && filteredSuggestions && filteredSuggestions.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1.2 }}>
              {filteredSuggestions.map((suggestion, i) => (
                <Chip
                  key={i}
                  label={suggestion}
                  onClick={() => onSuggestionClick(suggestion)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: 'rgba(79, 209, 197, 0.08)',
                    color: '#2C7A7B',
                    borderColor: 'rgba(79, 209, 197, 0.2)',
                    border: '1px solid',
                    borderRadius: '16px',
                    py: 2,
                    px: 1,
                    '&:hover': {
                      bgcolor: 'rgba(79, 209, 197, 0.15)',
                      boxShadow: '0 2px 6px rgba(79, 209, 197, 0.2)',
                    },
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
        
        {!isBot && (
          <Avatar 
            sx={{ 
              ml: 1.5, 
              bgcolor: '#805AD5',
              width: 42,
              height: 42,
              boxShadow: '0 2px 8px rgba(128, 90, 213, 0.25)',
              border: '2px solid #FFFFFF'
            }}
            alt="User"
          >
            <PersonIcon fontSize="small" />
          </Avatar>
        )}
      </Box>
    </Box>
  );
};

export default ChatMessage; 