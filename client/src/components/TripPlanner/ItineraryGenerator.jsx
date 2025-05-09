import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import axios from 'axios';
import { differenceInDays } from 'date-fns';

const ItineraryGenerator = ({ tripData, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateItinerary();
  }, []);

  const generatePrompt = () => {
    const numDays = differenceInDays(tripData.endDate, tripData.startDate) + 1;
    const interests = tripData.preferences.interests.join(', ');
    
    return `Create a detailed ${numDays}-day Sri Lanka travel itinerary for ${tripData.numberOfPeople} person(s) with the following preferences:
    - Budget Level: ${tripData.preferences.budget}
    - Travel Pace: ${tripData.preferences.pace}
    - Interests: ${interests}
    
    Please provide a day-by-day breakdown including:
    - Recommended attractions and activities
    - Estimated time for each activity
    - Suggested meal locations
    - Transportation recommendations
    - Accommodation suggestions
    
    Format the response as a JSON object with the following structure:
    {
      "days": [
        {
          "dayNumber": 1,
          "activities": [
            {
              "time": "9:00 AM",
              "description": "Activity description",
              "duration": "2 hours",
              "location": "Location name",
              "type": "activity|meal|transport|accommodation"
            }
          ]
        }
      ]
    }`;
  };

  const generateItinerary = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/tripbot/generate', {
        prompt: generatePrompt()
      });

      const generatedItinerary = response.data;
      onUpdate({ generatedItinerary });
    } catch (err) {
      setError('Failed to generate itinerary. Please try again.');
      console.error('Error generating itinerary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Generating your perfect itinerary...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!tripData.generatedItinerary) {
    return (
      <Alert severity="info">
        No itinerary generated yet. Please wait...
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Your Generated Itinerary
      </Typography>
      
      {tripData.generatedItinerary.days.map((day) => (
        <Card key={day.dayNumber} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Day {day.dayNumber}
            </Typography>
            
            {day.activities.map((activity, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="primary">
                  {activity.time} ({activity.duration})
                </Typography>
                <Typography variant="body1">
                  {activity.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Location: {activity.location}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default ItineraryGenerator; 