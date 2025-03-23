import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Map as MapIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

const TripPlanViewer = ({ plan }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  const handleDayClick = (day) => {
    setSelectedDay(day === selectedDay ? null : day);
  };

  const handleMapOpen = () => {
    setMapDialogOpen(true);
  };

  const handleMapClose = () => {
    setMapDialogOpen(false);
  };

  const handleDownloadPDF = () => {
    // Implement PDF download functionality
    console.log('Downloading PDF...');
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing plan...');
  };

  if (!plan) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No trip plan available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Your Personalized Trip Plan</Typography>
        <Box>
          <IconButton onClick={handleMapOpen} title="View on Map">
            <MapIcon />
          </IconButton>
          <IconButton onClick={handleDownloadPDF} title="Download PDF">
            <DownloadIcon />
          </IconButton>
          <IconButton onClick={handleShare} title="Share">
            <ShareIcon />
          </IconButton>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Trip Summary</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                Duration: {plan.duration} days
              </Typography>
              <Typography variant="body1">
                Start Date: {new Date(plan.startDate).toLocaleDateString()}
              </Typography>
              <Typography variant="body1">
                End Date: {new Date(plan.endDate).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                Total Distance: {plan.totalDistance} km
              </Typography>
              <Typography variant="body1">
                Estimated Budget: ${plan.estimatedBudget}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ mb: 3 }}>
        {plan.itinerary.map((day, index) => (
          <Accordion
            key={index}
            expanded={selectedDay === index}
            onChange={() => handleDayClick(index)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography variant="h6">Day {index + 1}</Typography>
                <Box sx={{ ml: 2, flex: 1 }}>
                  <Chip
                    size="small"
                    label={day.location}
                    sx={{ mr: 1 }}
                  />
                </Box>
                <IconButton size="small">
                  <EditIcon />
                </IconButton>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {day.activities.map((activity, actIndex) => (
                  <Grid item xs={12} key={actIndex}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {activity.time} - {activity.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activity.description}
                        </Typography>
                        {activity.location && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            📍 {activity.location}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Dialog
        open={mapDialogOpen}
        onClose={handleMapClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Trip Map View</DialogTitle>
        <DialogContent>
          {/* Implement map view here */}
          <Box sx={{ height: 400, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>Map View Coming Soon</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleMapClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TripPlanViewer; 