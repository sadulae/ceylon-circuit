import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies with requests
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Add token to headers
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Async thunks

// Fetch all accommodation details
export const fetchAccommodations = createAsyncThunk(
  'accommodation/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/accommodation/fetchAll');
      console.log("Response from fetchAll accommodations:", response.data);
      
      // Check different response formats and handle accordingly
      if (response.data && response.data.data) {
        // If the data is nested in a 'data' property
        return response.data.data;
      } else if (response.data && response.data.accommodations) {
        // If the data is nested in an 'accommodations' property
      return response.data.accommodations;
      } else if (response.data && Array.isArray(response.data)) {
        // If the data is directly an array
        return response.data;
      } else {
        // If the data format is unexpected
        console.error("Unexpected response format:", response.data);
        return [];
      }
    } catch (err) {
      console.error("Error fetching accommodations:", err);
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch accommodations.'
      );
    }
  }
);

// Fetch single accommodation
export const fetchAccommodation = createAsyncThunk(
  'accommodation/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/accommodation/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Failed to fetch accommodation.'
      );
    }
  }
);

// Create new accommodation
export const createAccommodation = createAsyncThunk(
  'accommodation/create',
  async (accommodationData, { rejectWithValue }) => {
    try {
      // Get token directly and add to request headers for this specific operation
      const token = localStorage.getItem('token');
      
      // Format data to ensure all fields are properly formatted
      const formattedData = {
        ...accommodationData,
        availableSingleRooms: Number(accommodationData.availableSingleRooms),
        availableDoubleRooms: Number(accommodationData.availableDoubleRooms),
        availableRooms: Number(accommodationData.availableSingleRooms) + Number(accommodationData.availableDoubleRooms)
      };
      
      console.log('Sending accommodation data:', formattedData);
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Using token for accommodation creation');
      } else {
        console.warn('No token available for accommodation creation - this will fail authorization');
      }
      
      const response = await axios.post(
        `http://localhost:5000/api/accommodation/add`, 
        formattedData,
        {
          headers,
          withCredentials: true
        }
      );
      
      console.log('Create accommodation response:', response.data);
      
      // Handle different response formats
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data && response.data.success) {
        return response.data;
      } else {
        console.warn('Unexpected response format:', response.data);
      return response.data;
      }
    } catch (err) {
      console.error('Error creating accommodation:', err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.message || 'Failed to create accommodation.'
      );
    }
  }
);

// Update accommodation
export const updateAccommodation = createAsyncThunk(
  'accommodation/update',
  async ({ id, accommodationData }, { rejectWithValue }) => {
    try {
      // Get token directly and add to request headers for this specific operation
      const token = localStorage.getItem('token');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Using token for accommodation update');
      } else {
        console.warn('No token available for accommodation update - this will fail authorization');
      }
      
      const response = await axios.put(
        `http://localhost:5000/api/accommodation/update/${id}`, 
        accommodationData,
        {
          headers,
          withCredentials: true
        }
      );
      
      return response.data.data;
    } catch (err) {
      console.error('Error updating accommodation:', err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.message || 'Failed to update accommodation.'
      );
    }
  }
);

// Delete accommodation
export const deleteAccommodation = createAsyncThunk(
  'accommodation/delete',
  async (id, { rejectWithValue }) => {
    try {
      // Get token directly and add to request headers for this specific operation
      const token = localStorage.getItem('token');
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Using token for accommodation deletion');
      } else {
        console.warn('No token available for accommodation deletion - this will fail authorization');
      }
      
      await axios.delete(
        `http://localhost:5000/api/accommodation/delete/${id}`, 
        {
          headers,
          withCredentials: true
        }
      );
      
      return id;
    } catch (err) {
      console.error('Error deleting accommodation:', err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data?.message || 'Failed to delete accommodation.'
      );
    }
  }
);

// Initial state
const initialState = {
  accommodations: [],
  currentAccommodation: null,
  loading: false,
  error: null
};

// Create slice
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
      // Fetch all
      .addCase(fetchAccommodations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccommodations.fulfilled, (state, action) => {
        state.loading = false;
        state.accommodations = action.payload;
      })
      .addCase(fetchAccommodations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch one
      .addCase(fetchAccommodation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccommodation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAccommodation = action.payload;
      })
      .addCase(fetchAccommodation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createAccommodation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAccommodation.fulfilled, (state, action) => {
        state.loading = false;
        state.accommodations.push(action.payload);
      })
      .addCase(createAccommodation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateAccommodation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAccommodation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.accommodations.findIndex(acc => acc._id === action.payload._id);
        if (index !== -1) {
          state.accommodations[index] = action.payload;
        }
      })
      .addCase(updateAccommodation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteAccommodation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccommodation.fulfilled, (state, action) => {
        state.loading = false;
        state.accommodations = state.accommodations.filter(acc => acc._id !== action.payload);
      })
      .addCase(deleteAccommodation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = accommodationSlice.actions;
export default accommodationSlice.reducer;
