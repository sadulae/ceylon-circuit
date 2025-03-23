import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const generateTripPlan = createAsyncThunk(
  'tripbot/generatePlan',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/tripbot/generate-plan', preferences);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const saveTripPlan = createAsyncThunk(
  'tripbot/savePlan',
  async (plan, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/tripbot/save-plan', plan);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const getTripPlan = createAsyncThunk(
  'tripbot/getPlan',
  async (planId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/tripbot/plan/${planId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateTripPlan = createAsyncThunk(
  'tripbot/updatePlan',
  async ({ planId, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/tripbot/plan/${planId}`, updates);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const initialState = {
  currentPlan: null,
  savedPlans: [],
  preferences: null,
  loading: false,
  error: null,
  generatingPlan: false,
  savingPlan: false
};

const tripbotSlice = createSlice({
  name: 'tripbot',
  initialState,
  reducers: {
    setPreferences: (state, action) => {
      state.preferences = action.payload;
    },
    clearCurrentPlan: (state) => {
      state.currentPlan = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Generate Plan
      .addCase(generateTripPlan.pending, (state) => {
        state.generatingPlan = true;
        state.error = null;
      })
      .addCase(generateTripPlan.fulfilled, (state, action) => {
        state.generatingPlan = false;
        state.currentPlan = action.payload;
      })
      .addCase(generateTripPlan.rejected, (state, action) => {
        state.generatingPlan = false;
        state.error = action.payload?.message || 'Failed to generate plan';
      })
      
      // Save Plan
      .addCase(saveTripPlan.pending, (state) => {
        state.savingPlan = true;
        state.error = null;
      })
      .addCase(saveTripPlan.fulfilled, (state, action) => {
        state.savingPlan = false;
        state.savedPlans.push(action.payload);
      })
      .addCase(saveTripPlan.rejected, (state, action) => {
        state.savingPlan = false;
        state.error = action.payload?.message || 'Failed to save plan';
      })
      
      // Get Plan
      .addCase(getTripPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTripPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlan = action.payload;
      })
      .addCase(getTripPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch plan';
      })
      
      // Update Plan
      .addCase(updateTripPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTripPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlan = action.payload;
        const index = state.savedPlans.findIndex(plan => plan._id === action.payload._id);
        if (index !== -1) {
          state.savedPlans[index] = action.payload;
        }
      })
      .addCase(updateTripPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update plan';
      });
  }
});

export const { setPreferences, clearCurrentPlan, clearError } = tripbotSlice.actions;

export default tripbotSlice.reducer;