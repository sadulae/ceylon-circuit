import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Button,
  Typography,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const INTERESTS = [
  'Beaches',
  'Wildlife',
  'Cultural Sites',
  'Adventure',
  'Food & Dining',
  'Shopping',
  'Nature',
  'History',
  'Relaxation',
  'Photography'
];

const BUDGETS = [
  'Budget',
  'Moderate',
  'Luxury'
];

const PreferenceCollector = ({ onSubmit }) => {
  const [preferences, setPreferences] = useState({
    startDate: null,
    endDate: null,
    interests: [],
    budget: '',
    travelStyle: '',
    accommodation: '',
    transportation: '',
    specialRequirements: ''
  });

  const handleChange = (field) => (event) => {
    setPreferences({
      ...preferences,
      [field]: event.target.value
    });
  };

  const handleDateChange = (field) => (date) => {
    setPreferences({
      ...preferences,
      [field]: date
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(preferences);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Tell us about your dream Sri Lankan vacation
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={preferences.startDate}
              onChange={handleDateChange('startDate')}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="End Date"
              value={preferences.endDate}
              onChange={handleDateChange('endDate')}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Interests</InputLabel>
            <Select
              multiple
              value={preferences.interests}
              onChange={handleChange('interests')}
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
                  <Checkbox checked={preferences.interests.indexOf(interest) > -1} />
                  <ListItemText primary={interest} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Budget Range</InputLabel>
            <Select
              value={preferences.budget}
              onChange={handleChange('budget')}
              label="Budget Range"
            >
              {BUDGETS.map((budget) => (
                <MenuItem key={budget} value={budget.toLowerCase()}>
                  {budget}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Preferred Transportation</InputLabel>
            <Select
              value={preferences.transportation}
              onChange={handleChange('transportation')}
              label="Preferred Transportation"
            >
              <MenuItem value="public">Public Transport</MenuItem>
              <MenuItem value="private">Private Vehicle</MenuItem>
              <MenuItem value="mixed">Mixed</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Special Requirements"
            multiline
            rows={4}
            value={preferences.specialRequirements}
            onChange={handleChange('specialRequirements')}
            placeholder="Any special requirements or preferences..."
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
          >
            Generate My Trip Plan
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PreferenceCollector; 