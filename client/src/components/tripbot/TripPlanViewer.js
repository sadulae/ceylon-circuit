import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip
} from '@mui/material';
import { 
  ExpandMore, 
  Favorite, 
  FavoriteBorder, 
  Share, 
  MoreVert, 
  LocationOn, 
  Hotel, 
  Restaurant, 
  DirectionsCar, 
  DownloadForOffline, 
  Star, 
  StarBorder,
  Language,
  Person,
  LocalActivity,
  AccessTimeOutlined
} from '@mui/icons-material';
import { saveTripPlan } from '../../services/aiService';

const TripPlanViewer = ({ plan, onSave, onModify }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [saved, setSaved] = useState(false);
  
  if (!plan || !plan.itinerary) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1">No trip plan available</Typography>
      </Box>
    );
  }
  
  const { summary, itinerary, tourGuide, tourPackages } = plan;
  
  const handleSave = async () => {
    try {
      await onSave();
      setSaved(true);
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepClick = (step) => {
    setActiveStep(step);
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="body1" sx={{ color: '#E2E8F0', mb: 3 }}>
        {summary}
      </Typography>
      
      {/* Day-by-day itinerary */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ color: '#B2F5EA', mb: 2, fontWeight: 600 }}>
          Day-by-Day Itinerary
        </Typography>
        
        <Stepper 
          activeStep={activeStep} 
          orientation="vertical" 
          nonLinear
          sx={{ 
            '.MuiStepLabel-label': { color: '#E2E8F0' },
            '.MuiStepLabel-iconContainer': { color: '#B2F5EA' },
            '.MuiStepConnector-line': { borderColor: 'rgba(178,245,234,0.2)' }
          }}
        >
          {itinerary.map((day, index) => (
            <Step key={index} completed={false}>
              <StepLabel 
                onClick={() => handleStepClick(index)}
                StepIconProps={{ 
                  icon: `${day.day}`,
                  sx: { cursor: 'pointer' }
                }}
              >
                <Typography 
                  variant="subtitle1" 
                  sx={{ color: activeStep === index ? '#B2F5EA' : '#E2E8F0', cursor: 'pointer' }}
                >
                  Day {day.day}
                </Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  {/* Destinations */}
                  {day.destinations.map((dest, destIndex) => (
                    <Card 
                      key={destIndex} 
                      sx={{ 
                        mb: 2, 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(8px)',
                        color: '#E2E8F0'
                      }}
                    >
                      {dest.image && (
                        <CardMedia
                          component="img"
                          height="140"
                          image={dest.image}
                          alt={dest.name}
                          sx={{ objectFit: 'cover' }}
                        />
                      )}
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h6" sx={{ color: '#B2F5EA', fontWeight: 600 }}>
                            {dest.name}
                          </Typography>
                          <Chip 
                            label={dest.category} 
                            size="small" 
                            sx={{ 
                              backgroundColor: 'rgba(178,245,234,0.1)',
                              color: '#B2F5EA', 
                              border: '1px solid rgba(178,245,234,0.2)'
                            }} 
                          />
                        </Box>
                        
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5, color: '#B2F5EA' }} />
                          {dest.location}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {dest.description}
                        </Typography>
                        
                        {dest.activities && dest.activities.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" sx={{ color: '#B2F5EA', mb: 1 }}>
                              Activities:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {dest.activities.map((activity, actIndex) => (
                                <Chip 
                                  key={actIndex}
                                  label={activity}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: 'rgba(255,255,255,0.05)',
                                    color: '#E2E8F0'
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Accommodation */}
                  {day.accommodation && (
                    <Card 
                      sx={{ 
                        mb: 2, 
                        backgroundColor: 'rgba(30,41,55,0.7)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(8px)',
                        color: '#E2E8F0'
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Hotel sx={{ color: '#B2F5EA', mr: 1 }} />
                          <Typography variant="h6" sx={{ color: '#B2F5EA', fontWeight: 600 }}>
                            {day.accommodation.name}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <LocationOn fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5, color: '#B2F5EA' }} />
                          {day.accommodation.location}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {day.accommodation.address}
                        </Typography>
                        
                        {day.accommodation.facilities && day.accommodation.facilities.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                            {day.accommodation.facilities.map((facility, facIndex) => (
                              <Chip 
                                key={facIndex}
                                label={facility}
                                size="small"
                                sx={{ 
                                  backgroundColor: 'rgba(255,255,255,0.05)',
                                  color: '#E2E8F0'
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Meals */}
                  {day.meals && day.meals.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {day.meals.map((meal, mealIndex) => (
                        <Chip 
                          key={mealIndex}
                          icon={<Restaurant sx={{ color: '#B2F5EA !important' }} />}
                          label={meal}
                          sx={{ 
                            backgroundColor: 'rgba(178,245,234,0.1)',
                            color: '#B2F5EA', 
                            border: '1px solid rgba(178,245,234,0.2)'
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
                
                {/* Navigation buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ 
                      color: '#B2F5EA',
                      '&.Mui-disabled': {
                        color: 'rgba(178,245,234,0.3)'
                      }
                    }}
                  >
                    Previous Day
                  </Button>
                  <Button
                    disabled={activeStep === itinerary.length - 1}
                    onClick={handleNext}
                    sx={{ 
                      color: '#B2F5EA',
                      '&.Mui-disabled': {
                        color: 'rgba(178,245,234,0.3)'
                      }
                    }}
                  >
                    Next Day
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Box>
      
      {/* Tour Guide */}
      {tourGuide && (
        <Accordion 
          sx={{ 
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: '#E2E8F0',
            mb: 2,
            '&:before': {
              display: 'none',
            },
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#B2F5EA' }} />}>
            <Typography variant="h6" sx={{ color: '#B2F5EA', fontWeight: 600 }}>
              Tour Guide
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Avatar 
                sx={{ 
                  width: 56, 
                  height: 56,
                  backgroundColor: 'rgba(178,245,234,0.2)', 
                  color: '#B2F5EA',
                  border: '1px solid rgba(178,245,234,0.3)',
                }}
              >
                <Person />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#B2F5EA', fontWeight: 600 }}>
                  {tourGuide.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    {[...Array(5)].map((_, i) => (
                      i < Math.floor(tourGuide.rating) 
                        ? <Star key={i} fontSize="small" sx={{ color: '#F59E0B' }} />
                        : <StarBorder key={i} fontSize="small" sx={{ color: '#F59E0B' }} />
                    ))}
                  </Box>
                  <Typography variant="body2">
                    {tourGuide.experience}+ years experience
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Language fontSize="small" sx={{ color: '#B2F5EA', mr: 0.5 }} />
                  <Typography variant="body2">
                    Languages: {tourGuide.languages.join(', ')}
                  </Typography>
                </Box>
                
                {tourGuide.specializations && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {tourGuide.specializations.map((spec, index) => (
                      <Chip 
                        key={index}
                        label={spec}
                        size="small"
                        icon={<LocalActivity sx={{ color: '#B2F5EA !important' }} />}
                        sx={{ 
                          backgroundColor: 'rgba(178,245,234,0.1)',
                          color: '#B2F5EA', 
                          border: '1px solid rgba(178,245,234,0.2)'
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      
      {/* Tour Packages */}
      {tourPackages && tourPackages.length > 0 && (
        <Accordion 
          sx={{ 
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: '#E2E8F0',
            mb: 2,
            '&:before': {
              display: 'none',
            },
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#B2F5EA' }} />}>
            <Typography variant="h6" sx={{ color: '#B2F5EA', fontWeight: 600 }}>
              Recommended Tour Packages
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {tourPackages.map((pack, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card sx={{ 
                    backgroundColor: 'rgba(30,41,55,0.7)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#E2E8F0'
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#B2F5EA', fontWeight: 600, mb: 1 }}>
                        {pack.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                        <Chip 
                          icon={<AccessTimeOutlined sx={{ color: '#B2F5EA !important' }} />}
                          label={`${pack.duration} days`}
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(178,245,234,0.1)',
                            color: '#B2F5EA', 
                            border: '1px solid rgba(178,245,234,0.2)'
                          }}
                        />
                        <Chip 
                          label={pack.difficulty}
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            color: '#E2E8F0'
                          }}
                        />
                        <Chip 
                          label={pack.mealOptions}
                          icon={<Restaurant sx={{ color: '#B2F5EA !important' }} />}
                          size="small"
                          sx={{ 
                            backgroundColor: 'rgba(178,245,234,0.1)',
                            color: '#B2F5EA', 
                            border: '1px solid rgba(178,245,234,0.2)'
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {pack.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ color: '#B2F5EA', fontWeight: 600 }}>
                          ${pack.price} USD
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          sx={{ 
                            borderColor: 'rgba(178,245,234,0.3)', 
                            color: '#B2F5EA',
                            '&:hover': {
                              borderColor: 'rgba(178,245,234,0.6)',
                              backgroundColor: 'rgba(178,245,234,0.1)'
                            }
                          }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}
      
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button 
          variant="outlined" 
          onClick={onModify}
          sx={{ 
            borderColor: 'rgba(178,245,234,0.3)', 
            color: '#B2F5EA',
            '&:hover': {
              borderColor: 'rgba(178,245,234,0.6)',
              backgroundColor: 'rgba(178,245,234,0.1)'
            }
          }}
        >
          Modify Plan
        </Button>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSave}
          disabled={saved}
          sx={{ 
            backgroundColor: saved ? 'rgba(52,211,153,0.8)' : 'rgba(178,245,234,0.2)',
            color: '#B2F5EA',
            '&:hover': {
              backgroundColor: 'rgba(178,245,234,0.3)'
            }
          }}
        >
          {saved ? 'Plan Saved!' : 'Save Plan'}
        </Button>
      </Box>
    </Box>
  );
};

export default TripPlanViewer; 