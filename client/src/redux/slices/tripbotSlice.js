import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Async thunks
export const generateTripPlan = createAsyncThunk(
  'tripbot/generatePlan',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await api.post('/tripbot/generate-plan', preferences);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to generate trip plan');
    }
  }
);

export const getTripSuggestions = createAsyncThunk(
  'tripbot/suggestions',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await api.post('/tripbot/suggestions', preferences);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to get trip suggestions');
    }
  }
);

export const getDestinationInfo = createAsyncThunk(
  'tripbot/destination',
  async (destination, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tripbot/destination/${destination}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to get destination info');
    }
  }
);

// Initial state
const initialState = {
  tripPlan: null,
  suggestions: null,
  destinationInfo: null,
  loading: false,
  error: null
};

// Create slice
const tripbotSlice = createSlice({
  name: 'tripbot',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Generate Trip Plan
      .addCase(generateTripPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateTripPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.tripPlan = action.payload;
      })
      .addCase(generateTripPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Trip Suggestions
      .addCase(getTripSuggestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTripSuggestions.fulfilled, (state, action) => {
        state.loading = false;
        state.suggestions = action.payload;
      })
      .addCase(getTripSuggestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Destination Info
      .addCase(getDestinationInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDestinationInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.destinationInfo = action.payload;
      })
      .addCase(getDestinationInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = tripbotSlice.actions;
export default tripbotSlice.reducer;