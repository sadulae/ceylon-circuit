import React, { useState } from 'react';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Typography,
  Paper,
  Container
} from '@mui/material';
import TripPreferences from './TripPreferences';
import ItineraryGenerator from './ItineraryGenerator';
import ItineraryCustomizer from './ItineraryCustomizer';
import ItineraryExport from './ItineraryExport';

const steps = [
  'Trip Preferences',
  'Generate Itinerary',
  'Customize Plan',
  'Export & Download'
];

const TripPlanner = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [tripData, setTripData] = useState({
    startDate: null,
    endDate: null,
    numberOfPeople: 1,
    preferences: {
      budget: 'medium',
      pace: 'moderate',
      interests: []
    },
    generatedItinerary: null,
    customizedItinerary: null
  });

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleTripDataUpdate = (newData) => {
    setTripData((prev) => ({ ...prev, ...newData }));
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <TripPreferences 
            tripData={tripData} 
            onUpdate={handleTripDataUpdate} 
          />
        );
      case 1:
        return (
          <ItineraryGenerator 
            tripData={tripData} 
            onUpdate={handleTripDataUpdate} 
          />
        );
      case 2:
        return (
          <ItineraryCustomizer 
            tripData={tripData} 
            onUpdate={handleTripDataUpdate} 
          />
        );
      case 3:
        return (
          <ItineraryExport 
            tripData={tripData} 
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Plan Your Perfect Trip
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4 }}>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={activeStep === steps.length - 1}
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default TripPlanner; 