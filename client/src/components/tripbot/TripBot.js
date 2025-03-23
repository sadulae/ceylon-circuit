import React, { useState } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Typography } from '@mui/material';
import PreferenceCollector from './PreferenceCollector';
import TripPlanGenerator from './TripPlanGenerator';
import TripPlanViewer from './TripPlanViewer';

const steps = ['Travel Preferences', 'Generate Plan', 'View & Customize'];

const TripBot = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [preferences, setPreferences] = useState(null);
  const [tripPlan, setTripPlan] = useState(null);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePreferenceSubmit = (collectedPreferences) => {
    setPreferences(collectedPreferences);
    handleNext();
  };

  const handlePlanGenerated = (generatedPlan) => {
    setTripPlan(generatedPlan);
    handleNext();
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <PreferenceCollector onSubmit={handlePreferenceSubmit} />;
      case 1:
        return <TripPlanGenerator preferences={preferences} onPlanGenerated={handlePlanGenerated} />;
      case 2:
        return <TripPlanViewer plan={tripPlan} />;
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        TripBot Smart Assistant
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2, mb: 2 }}>
        {getStepContent(activeStep)}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
      </Box>
    </Box>
  );
};

export default TripBot; 