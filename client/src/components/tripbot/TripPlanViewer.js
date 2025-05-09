import React, { useState } from 'react';
import {
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Divider,
  Card, 
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  LocationOn,
  Hotel,
  Restaurant,
  DirectionsCar,
  AccessTime,
  ExpandMore,
  Today,
  CheckCircleOutline,
  Info,
  LightMode,
  Nightlight,
  LocalActivity,
  Luggage,
  AttachMoney,
  TravelExplore,
} from '@mui/icons-material';

const TripPlanViewer = ({ tripPlan }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Handle empty or missing trip plan
  if (!tripPlan) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        bgcolor: '#f9fafb',
      }}>
        <Box 
          component="img" 
          src="https://placehold.co/300x200?text=Trip+Planner" 
          alt="Map placeholder"
          sx={{ 
            width: '60%', 
            maxWidth: 300,
            opacity: 0.6,
            mb: 4
          }}
        />
        <Typography variant="h5" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
          No trip plan available yet
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Chat with our AI assistant to create your personalized Sri Lanka travel itinerary
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => window.location.reload()}
          sx={{
            bgcolor: '#4FD1C5',
            '&:hover': {
              bgcolor: '#38A89D',
            }
          }}
        >
          Start Planning
        </Button>
      </Box>
    );
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const renderDayCard = (day, index) => {
    return (
      <Card 
        elevation={2} 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          overflow: 'visible',
          position: 'relative'
        }}
        key={`day-${index}`}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="180"
            image={`https://source.unsplash.com/featured/?srilanka,${day.destinations.join(',')}`}
            alt={day.title}
            sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
          />
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8
          }} />
          <Box sx={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            p: 2, 
            width: '100%', 
            color: 'white'
          }}>
            <Typography variant="h6" fontWeight="bold">
              Day {day.day}: {day.title}
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, color: '#4FD1C5' }} />
                  Destinations
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {day.destinations.map((dest, i) => (
                    <Chip
                      key={`dest-${i}`}
                      label={dest}
                      size="small"
                      icon={<TravelExplore fontSize="small" />}
                      sx={{ 
                        bgcolor: 'rgba(79, 209, 197, 0.1)', 
                        color: '#2C7A7B',
                        borderColor: 'rgba(79, 209, 197, 0.3)',
                        border: '1px solid'
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Hotel sx={{ mr: 1, color: '#4FD1C5' }} />
                Accommodation
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {day.accommodation}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DirectionsCar sx={{ mr: 1, color: '#4FD1C5' }} />
                  Travel Details
                </Typography>
                <List dense disablePadding>
                  {day.travelTimes?.map((travel, i) => (
                    <ListItem key={`travel-${i}`} disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <AccessTime fontSize="small" color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={travel} 
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          color: 'text.secondary'
                        }} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocalActivity sx={{ mr: 1, color: '#4FD1C5' }} />
                  Activities
                </Typography>
                <List dense disablePadding>
                  {day.activities?.map((activity, i) => (
                    <ListItem key={`activity-${i}`} disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckCircleOutline fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={activity} 
                        primaryTypographyProps={{ variant: 'body2' }} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Restaurant sx={{ mr: 1, color: '#4FD1C5' }} />
                  Meals
                </Typography>
                <List dense disablePadding>
                  {day.meals?.breakfast && (
                    <ListItem disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <LightMode fontSize="small" color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`Breakfast: ${day.meals.breakfast}`} 
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          color: 'text.secondary'
                        }} 
                      />
                    </ListItem>
                  )}
                  {day.meals?.lunch && (
                    <ListItem disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <Today fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`Lunch: ${day.meals.lunch}`} 
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          color: 'text.secondary'
                        }} 
                      />
                    </ListItem>
                  )}
                  {day.meals?.dinner && (
                    <ListItem disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <Nightlight fontSize="small" color="action" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`Dinner: ${day.meals.dinner}`} 
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          color: 'text.secondary'
                        }} 
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Grid>
          </Grid>

          <Accordion 
            elevation={0} 
            sx={{ 
              '&:before': { display: 'none' },
              bgcolor: 'transparent' 
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{ 
                px: 0, 
                '&.Mui-expanded': { minHeight: 0 },
                '& .MuiAccordionSummary-content.Mui-expanded': { margin: '12px 0' }
              }}
            >
              <Typography variant="subtitle2" color="primary">
                View Day Details
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0 }}>
              <Typography variant="body2" color="text.secondary" paragraph>
                {day.description}
              </Typography>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    );
  };

  const renderEssentials = () => {
    const { essentials } = tripPlan;
    
    if (!essentials) {
      return (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
          No trip essentials available.
        </Typography>
      );
    }
    
    return (
      <Box sx={{ p: 2 }}>
        <Grid container spacing={3}>
          {/* Packing List */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Luggage sx={{ mr: 1, color: '#4FD1C5' }} />
                  Packing List
                </Typography>
                <List dense>
                  {essentials.packingList?.map((item, i) => (
                    <ListItem key={`packing-${i}`} disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckCircleOutline fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Travel Tips */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Info sx={{ mr: 1, color: '#4FD1C5' }} />
                  Travel Tips
                </Typography>
                <List dense>
                  {essentials.travelTips?.map((tip, i) => (
                    <ListItem key={`tip-${i}`} disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckCircleOutline fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText primary={tip} primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Cultural Notes */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TravelExplore sx={{ mr: 1, color: '#4FD1C5' }} />
                  Cultural Notes
                </Typography>
                <List dense>
                  {essentials.culturalNotes?.map((note, i) => (
                    <ListItem key={`note-${i}`} disablePadding sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CheckCircleOutline fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText primary={note} primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Estimated Cost */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney sx={{ mr: 1, color: '#4FD1C5' }} />
                  Estimated Cost
                </Typography>
                <Typography variant="body1" paragraph>
                  {essentials.estimatedCost}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#f9fafb'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        bgcolor: '#4FD1C5', 
        color: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h6" sx={{ fontFamily: "'Poppins', sans-serif" }}>
          {tripPlan.title || `${tripPlan.duration}-Day Sri Lanka Trip Plan`}
        </Typography>
        <Typography variant="body2">
          {tripPlan.summary || 'Your personalized day-by-day Sri Lanka travel itinerary'}
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'white' }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9rem',
            },
            '& .Mui-selected': {
              color: '#4FD1C5',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#4FD1C5',
            }
          }}
        >
          <Tab label="Day-by-Day Itinerary" />
          <Tab label="Trip Essentials" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        p: 2,
      }}>
        {/* Day-by-Day Itinerary */}
        <Box sx={{ display: currentTab === 0 ? 'block' : 'none' }}>
          {isMobile ? (
            <Box>
              {tripPlan.itinerary?.map((day, index) => renderDayCard(day, index))}
            </Box>
          ) : (
            <Stepper orientation="vertical" nonLinear activeStep={-1}>
              {tripPlan.itinerary?.map((day, index) => (
                <Step key={`step-${index}`} expanded>
                  <StepLabel 
                    StepIconProps={{ 
                      active: true,
                      icon: day.day
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {day.title}
                    </Typography>
                  </StepLabel>
                  <StepContent sx={{ pb: 3 }}>
                    {renderDayCard(day, index)}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          )}
        </Box>

        {/* Trip Essentials */}
        <Box sx={{ display: currentTab === 1 ? 'block' : 'none' }}>
          {renderEssentials()}
        </Box>
      </Box>
    </Box>
  );
};

export default TripPlanViewer;