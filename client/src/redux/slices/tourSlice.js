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
export const fetchTours = createAsyncThunk(
  'tours/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tours');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch tours');
    }
  }
);

export const fetchTourById = createAsyncThunk(
  'tours/fetchById',
  async (tourId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tours/${tourId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch tour');
    }
  }
);

export const createTour = createAsyncThunk(
  'tours/create',
  async (tourData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tours', tourData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create tour');
    }
  }
);

export const updateTour = createAsyncThunk(
  'tours/update',
  async ({ tourId, tourData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tours/${tourId}`, tourData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update tour');
    }
  }
);

export const deleteTour = createAsyncThunk(
  'tours/delete',
  async (tourId, { rejectWithValue }) => {
    try {
      await api.delete(`/tours/${tourId}`);
      return tourId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete tour');
    }
  }
);

// Initial state
const initialState = {
  tours: [],
  currentTour: null,
  loading: false,
  error: null
};

// Create slice
const tourSlice = createSlice({
  name: 'tours',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTour: (state) => {
      state.currentTour = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Tours
      .addCase(fetchTours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTours.fulfilled, (state, action) => {
        state.loading = false;
        state.tours = action.payload;
      })
      .addCase(fetchTours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Tour By ID
      .addCase(fetchTourById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTourById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTour = action.payload;
      })
      .addCase(fetchTourById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Tour
      .addCase(createTour.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTour.fulfilled, (state, action) => {
        state.loading = false;
        state.tours.push(action.payload);
      })
      .addCase(createTour.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Tour
      .addCase(updateTour.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTour.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tours.findIndex(tour => tour._id === action.payload._id);
        if (index !== -1) {
          state.tours[index] = action.payload;
        }
        if (state.currentTour?._id === action.payload._id) {
          state.currentTour = action.payload;
        }
      })
      .addCase(updateTour.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Tour
      .addCase(deleteTour.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTour.fulfilled, (state, action) => {
        state.loading = false;
        state.tours = state.tours.filter(tour => tour._id !== action.payload);
        if (state.currentTour?._id === action.payload) {
          state.currentTour = null;
        }
      })
      .addCase(deleteTour.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentTour } = tourSlice.actions;
export default tourSlice.reducer; 