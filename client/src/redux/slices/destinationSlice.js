import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Check the API URL and add console logging for debugging
const API_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/destinations` 
  : 'http://localhost:5000/api/destinations';

console.log('Destinations API URL:', API_URL);

// Helper function to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Async thunks
export const fetchDestinations = createAsyncThunk(
  'destinations/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching destinations from:', API_URL);
      const response = await axios.get(API_URL);
      console.log('Destinations response:', response);
      
      // Check if the data is an object with a 'data' property (nested structure)
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      // Return the data directly if it's not nested
      return response.data;
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch destinations. Please check server connection.'
      );
    }
  }
);

export const fetchDestination = createAsyncThunk(
  'destinations/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      console.log(`Fetching destination ${id} from: ${API_URL}/${id}`);
      const response = await axios.get(`${API_URL}/${id}`);
      console.log('Single destination response:', response);
      
      // Get the destination data - either from nested structure or directly
      let destinationData = response.data && response.data.data ? response.data.data : response.data;
      
      // Normalize the data structure to ensure all required properties exist
      const normalizedData = {
        ...destinationData,
        location: destinationData.location || {
          address: '',
          district: '',
          province: '',
          coordinates: [0, 0]
        },
        bestTimeToVisit: destinationData.bestTimeToVisit || {
          season: 'Year Round',
          months: [],
          notes: ''
        },
        entryFee: destinationData.entryFee || {
          local: 0,
          foreign: 0,
          notes: ''
        },
        openingHours: destinationData.openingHours || {
          open: '',
          close: '',
          daysClosed: [],
          notes: ''
        },
        features: destinationData.features || [],
        images: destinationData.images || [],
        tips: destinationData.tips || ['']
      };
      
      // Ensure nested arrays exist
      if (!normalizedData.location.coordinates) normalizedData.location.coordinates = [0, 0];
      if (!normalizedData.bestTimeToVisit.months) normalizedData.bestTimeToVisit.months = [];
      if (!normalizedData.openingHours.daysClosed) normalizedData.openingHours.daysClosed = [];
      
      console.log('Normalized destination data:', normalizedData);
      return normalizedData;
    } catch (error) {
      console.error(`Error fetching destination ${id}:`, error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch destination details'
      );
    }
  }
);

export const createDestination = createAsyncThunk(
  'destinations/create',
  async (destinationData, { rejectWithValue }) => {
    try {
      // Get token for auth header
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return rejectWithValue('Authentication required. Please log in again.');
      }

      console.log('Creating destination with FormData, data entries:', [...destinationData.entries()].map(entry => {
        // Don't log file contents for privacy/performance reasons
        if (entry[0] === 'mainImage' || entry[0] === 'images') {
          return [entry[0], 'File data omitted from logs'];
        }
        return entry;
      }));

      // When using FormData, don't set Content-Type as the browser will set it automatically with boundary
      // The server needs to see this is multipart/form-data to handle the file uploads
      const response = await axios.post(
        API_URL,
        destinationData,
        {
          headers: {
            Authorization: `Bearer ${token}`
            // Don't set Content-Type here, let the browser handle it with FormData
          },
          withCredentials: true,
          // Add timeout to prevent hanging requests
          timeout: 60000 // 60 seconds
        }
      );
      
      console.log('Destination created successfully, server response:', response.data);
      return response.data.data ? response.data.data : response.data;
    } catch (error) {
      console.error('Create destination error:', error);
      
      // Log more detailed error info
      if (error.response) {
        console.error('Server response error data:', error.response.data);
        console.error('Server response status:', error.response.status);
        console.error('Server response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received from server:', error.request);
      }
      
      // Show detailed error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create destination';
      console.error('Error message:', errorMessage);
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateDestination = createAsyncThunk(
  'destinations/update',
  async ({ id, destinationData }, { rejectWithValue }) => {
    try {
      // Get token for auth header
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found for update');
        return rejectWithValue('Authentication required. Please log in again.');
      }

      console.log(`Updating destination ${id} with FormData`);

      // When using FormData, don't set Content-Type
      const response = await axios.put(
        `${API_URL}/${id}`,
        destinationData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true,
          timeout: 60000 // 60 seconds
        }
      );
      
      console.log('Destination updated successfully:', response.data);
      return response.data.data ? response.data.data : response.data;
    } catch (error) {
      console.error(`Error updating destination ${id}:`, error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update destination'
      );
    }
  }
);

export const deleteDestination = createAsyncThunk(
  'destinations/delete',
  async (id, { rejectWithValue }) => {
    try {
      console.log(`Attempting to delete destination ${id} from: ${API_URL}/${id}`);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      console.log('Token available for delete:', token ? 'Yes' : 'No');
      
      // Get stored user data to check admin status
      let isAdmin = false;
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          isAdmin = userData.isAdmin === true;
          console.log('Current user is admin:', isAdmin);
        }
      } catch (e) {
        console.error('Error checking admin status:', e);
      }
      
      if (!token) {
        console.error('No authentication token found for delete operation');
        return rejectWithValue('Authentication required. Please log in again.');
      }
      
      if (!isAdmin) {
        console.error('User is not an admin, cannot delete destinations');
        return rejectWithValue('Admin privileges required to delete destinations.');
      }
      
      // Make the delete request with proper headers
      const response = await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true // Send cookies if they exist
      });
      
      console.log('Delete destination response:', response);
      
      return id;
    } catch (error) {
      console.error('Error deleting destination:', error);
      console.error('Error response:', error.response?.data);
      
      // Show more specific error messages based on HTTP status code
      if (error.response?.status === 403) {
        return rejectWithValue('You do not have permission to delete this destination. Admin privileges required.');
      } else if (error.response?.status === 401) {
        return rejectWithValue('Authentication failed. Please log in again.');
      }
      
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete destination'
      );
    }
  }
);

const initialState = {
  destinations: [],
  currentDestination: null,
  loading: false,
  error: null,
  success: false,
};

const destinationSlice = createSlice({
  name: 'destinations',
  initialState,
  reducers: {
    clearDestinationError: (state) => {
      state.error = null;
    },
    clearCurrentDestination: (state) => {
      state.currentDestination = null;
    },
    setDestinationSuccess: (state, action) => {
      state.success = action.payload;
    },
    clearDestinationSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all destinations
      .addCase(fetchDestinations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDestinations.fulfilled, (state, action) => {
        state.loading = false;
        state.destinations = action.payload;
        state.error = null;
      })
      .addCase(fetchDestinations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single destination
      .addCase(fetchDestination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDestination.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDestination = action.payload;
        state.error = null;
      })
      .addCase(fetchDestination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create destination
      .addCase(createDestination.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createDestination.fulfilled, (state, action) => {
        state.loading = false;
        state.destinations.push(action.payload);
        state.success = true;
        state.error = null;
      })
      .addCase(createDestination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update destination
      .addCase(updateDestination.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateDestination.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update in the destinations array
        const index = state.destinations.findIndex(
          (dest) => dest._id === action.payload._id
        );
        if (index !== -1) {
          state.destinations[index] = action.payload;
        }
        
        // Update current destination
        state.currentDestination = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateDestination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete destination
      .addCase(deleteDestination.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDestination.fulfilled, (state, action) => {
        state.loading = false;
        state.destinations = state.destinations.filter(
          (dest) => dest._id !== action.payload
        );
        state.success = true;
        state.error = null;
      })
      .addCase(deleteDestination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearDestinationError,
  clearCurrentDestination,
  setDestinationSuccess,
  clearDestinationSuccess,
} = destinationSlice.actions;

export default destinationSlice.reducer; 