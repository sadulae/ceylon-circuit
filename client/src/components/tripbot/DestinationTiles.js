import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  Chip,
  alpha
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';

const DestinationTiles = ({ destinations, onAction }) => {
  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Grid container spacing={2}>
        {destinations.map((destination) => (
          <Grid item xs={12} sm={6} key={destination.id}>
            <Card 
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 55, 0.9) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(178, 245, 234, 0.1)',
                borderRadius: 2,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(178, 245, 234, 0.2)',
                }
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={destination.image || 'https://via.placeholder.com/400x200?text=No+Image'}
                alt={destination.name}
                sx={{ 
                  objectFit: 'cover',
                  borderBottom: '1px solid rgba(178, 245, 234, 0.1)'
                }}
              />
              <CardContent sx={{ 
                flexGrow: 1, 
                p: 2,
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 55, 0.8) 100%)'
              }}>
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 1,
                      color: '#B2F5EA',
                      textShadow: '0 0 10px rgba(178,245,234,0.3)'
                    }}
                  >
                    {destination.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 18, mr: 0.5, color: '#B2F5EA' }} />
                    <Typography variant="body2" sx={{ color: '#E2E8F0' }}>
                      {destination.location}
                    </Typography>
                  </Box>
                  <Chip 
                    label={destination.category} 
                    size="small"
                    sx={{ 
                      bgcolor: alpha('#B2F5EA', 0.1),
                      color: '#B2F5EA',
                      fontWeight: 500,
                      mb: 1,
                      border: '1px solid rgba(178, 245, 234, 0.2)'
                    }}
                  />
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 2,
                    color: '#E2E8F0',
                    opacity: 0.8
                  }}
                >
                  {destination.summary}
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1,
                  mt: 'auto'
                }}>
                  {destination.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={index === 0 ? "contained" : "outlined"}
                      size="small"
                      onClick={() => onAction(action.type, destination)}
                      sx={{ 
                        borderRadius: 1,
                        textTransform: 'none',
                        flex: 1,
                        ...(index === 0 ? {
                          background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                          }
                        } : {
                          borderColor: 'rgba(178, 245, 234, 0.3)',
                          color: '#B2F5EA',
                          '&:hover': {
                            borderColor: 'rgba(178, 245, 234, 0.6)',
                            backgroundColor: 'rgba(178, 245, 234, 0.1)'
                          }
                        })
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DestinationTiles; 