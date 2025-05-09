import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  FormHelperText,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { addDays } from 'date-fns';

const INTERESTS = [
  'Cultural',
  'Adventure',
  'Nature',
  'Beach',
  'Food',
  'History',
  'Shopping',
  'Relaxation',
  'Wildlife',
  'Photography'
];

const TripPreferences = ({ tripData, onUpdate }) => {
  const handleDateChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  const handlePeopleChange = (event) => {
    onUpdate({ numberOfPeople: event.target.value });
  };

  const handlePreferenceChange = (field, value) => {
    onUpdate({
      preferences: {
        ...tripData.preferences,
        [field]: value
      }
    });
  };

  const handleInterestsChange = (event) => {
    const {
      target: { value },
    } = event;
    handlePreferenceChange('interests', typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <DatePicker
            label="Start Date"
            value={tripData.startDate}
            onChange={(newValue) => handleDateChange('startDate', newValue)}
            minDate={new Date()}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <DatePicker
            label="End Date"
            value={tripData.endDate}
            onChange={(newValue) => handleDateChange('endDate', newValue)}
            minDate={tripData.startDate ? addDays(tripData.startDate, 1) : new Date()}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Number of People"
            value={tripData.numberOfPeople}
            onChange={handlePeopleChange}
            InputProps={{ inputProps: { min: 1 } }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Budget Level</InputLabel>
            <Select
              value={tripData.preferences.budget}
              onChange={(e) => handlePreferenceChange('budget', e.target.value)}
              label="Budget Level"
            >
              <MenuItem value="budget">Budget</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="luxury">Luxury</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Travel Pace</InputLabel>
            <Select
              value={tripData.preferences.pace}
              onChange={(e) => handlePreferenceChange('pace', e.target.value)}
              label="Travel Pace"
            >
              <MenuItem value="relaxed">Relaxed</MenuItem>
              <MenuItem value="moderate">Moderate</MenuItem>
              <MenuItem value="intense">Intense</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Interests</InputLabel>
            <Select
              multiple
              value={tripData.preferences.interests}
              onChange={handleInterestsChange}
              input={<OutlinedInput label="Interests" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {INTERESTS.map((interest) => (
                <MenuItem key={interest} value={interest}>
                  {interest}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Select your travel interests</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TripPreferences; 