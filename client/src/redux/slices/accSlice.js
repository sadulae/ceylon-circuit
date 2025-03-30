import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Async thunks

// Fetch all accommodation details
export const fetchAccommodations = createAsyncThunk(
  'accommodation/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/accommodation/fetchAll');
      console.log("response fr get all",response)
      return response.data.accommodations;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch accommodations.'
      );
    }
  }
);

// Add a new accommodation
export const addAccommodation = createAsyncThunk(
  '/accommodation/add',
  async (accommodationData, { rejectWithValue }) => {
    console.log("accommodationData", accommodationData)
    try {
      const response = await api.post('/accommodation/add', accommodationData);
      console.log("accommodationData addo ", accommodationData)
      return response.data;
    } catch (err) {
      // console.log("accommodationData err ", err)
      return rejectWithValue(
        err
      );
    }
  }
);

// Update an existing accommodation
export const updateAccommodation = createAsyncThunk(
  'accommodation/update',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      console.log("id, updatedData", id, updatedData)
      const response = await api.put(`/accommodation/update/${id}`, updatedData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update accommodation.'
      );
    }
  }
);

// Delete an accommodation
export const deleteAccommodation = createAsyncThunk(
  'accommodation/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/accommodation/delete/${id}`);
      return id; // Return the id of the deleted accommodation
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete accommodation.'
      );
    }
  }
);

const initialState = {
  accommodations: [], // List of accommodations
  loading: false,
  error: null
};

const accommodationSlice = createSlice({
  name: 'accommodation',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch accommodations cases
      .addCase(fetchAccommodations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccommodations.fulfilled, (state, action) => {
        state.loading = false;
        state.accommodations = action.payload;
        state.error = null;
      })
      .addCase(fetchAccommodations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add accommodation cases
      .addCase(addAccommodation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAccommodation.fulfilled, (state, action) => {
        state.loading = false;
        state.accommodations.push(action.payload); // Add new accommodation to the list
        state.error = null;
      })
      .addCase(addAccommodation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update accommodation cases
      .addCase(updateAccommodation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAccommodation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.accommodations.findIndex(
          (acc) => acc.id === action.payload.id
        );
        if (index !== -1) {
          state.accommodations[index] = action.payload; // Update accommodation
        }
        state.error = null;
      })
      .addCase(updateAccommodation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete accommodation cases
      .addCase(deleteAccommodation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccommodation.fulfilled, (state, action) => {
        state.loading = false;
        state.accommodations = state.accommodations.filter(
          (acc) => acc.id !== action.payload
        ); // Remove accommodation from the list
        state.error = null;
      })
      .addCase(deleteAccommodation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = accommodationSlice.actions;
export const selectAccommodations = (state) => state.accommodation.accommodations;
export const selectAccommodationError = (state) => state.accommodation.error;
export const selectAccommodationLoading = (state) => state.accommodation.loading;

export default accommodationSlice.reducer;
