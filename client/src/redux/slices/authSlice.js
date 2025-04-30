import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper function to set auth data
const setAuthData = (data) => {
  try {
    if (data.token) {
      // Make sure token doesn't have Bearer prefix
      const cleanToken = data.token.startsWith('Bearer ') ? 
        data.token.substring(7) : data.token;
        
      localStorage.setItem('token', cleanToken);
      console.log('Token stored in localStorage:', cleanToken.substring(0, 10) + '...');
      
      // Update the user object with the clean token
      const userData = {...data, token: cleanToken};
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set the token in axios default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
      
      // Also set as cookie for extra reliability
      document.cookie = `token=${cleanToken}; path=/; max-age=2592000`; // 30 days
    } else {
      localStorage.setItem('user', JSON.stringify(data));
    }
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

// Helper function to clear auth data
const clearAuthData = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Remove the token from axios default headers
    delete api.defaults.headers.common['Authorization'];
    console.log('Auth data cleared from localStorage');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Get stored user data
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      setAuthData(response.data);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Attempting login with credentials:', { ...credentials, password: '[REDACTED]' });
      
      const response = await api.post('/auth/login', credentials);
      console.log('Login API response received, status:', response.status);
      
      // Detailed response logging
      if (response.data) {
        console.log('Login response contains data:', {
          hasId: !!response.data._id,
          hasName: !!response.data.name,
          hasEmail: !!response.data.email,
          hasToken: !!response.data.token,
          isAdmin: !!response.data.isAdmin
        });
      } else {
        console.error('Login response missing data object');
      }
      
      // Ensure token is properly stored
      if (response.data) {
        let userData = { ...response.data };
        
        // Server MUST provide a token
        if (!userData.token) {
          console.error('Server response missing token - authentication will fail');
          console.error('Full response data:', JSON.stringify(userData));
          return rejectWithValue('Login failed: Server did not provide authentication token. Please contact support.');
        }
        
        // Log token format
        console.log('Token format check - has periods:', userData.token.includes('.'));
        console.log('Token length:', userData.token.length);
        
        // Verify token format
        if (userData.token.startsWith('Bearer ')) {
          userData.token = userData.token.substring(7);
          console.log('Removed Bearer prefix from token before storage');
        }
        
        console.log('Login successful, storing data with token');
        setAuthData(userData);
        
        // Double-check token was stored
        const storedToken = localStorage.getItem('token');
        console.log('Token storage check:', storedToken ? 'Token successfully stored' : 'Failed to store token');
        
        return userData;
      } else {
        console.warn('Login response missing expected data:', response.data);
        return rejectWithValue('Invalid login response: missing user data. Please try again.');
      }
    } catch (err) {
      console.error('Login failed with error:', err);
      console.error('Error details:', {
        status: err.response?.status,
        message: err.response?.data?.message || err.message,
        data: err.response?.data
      });
      
      // Provide helpful error messages based on different error conditions
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Logout failed. Please try again.'
      );
    }
  }
);

export const verifyAuth = createAsyncThunk(
  'auth/verify',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Verifying auth with token:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        console.log('Token missing in verifyAuth');
        throw new Error('No token found');
      }
      
      // Add token to request headers to ensure it's included
      const response = await api.get('/auth/profile', {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Auth verification successful:', response.data);
      return response.data;
    } catch (err) {
      console.error('Auth verification failed:', err.message);
      clearAuthData(); // Clear auth data on verification failure
      return rejectWithValue(
        err.response?.data?.message || 'Authentication failed. Please login again.'
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const { token } = getState().auth;
      const response = await api.put('/auth/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update stored user data
      const updatedData = { token, user: response.data.user };
      setAuthData(updatedData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Profile update failed. Please try again.'
      );
    }
  }
);

// Initial state
const initialState = {
  user: getStoredUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

// Create slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Verify Auth
      .addCase(verifyAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(verifyAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // Update profile cases
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  }
});

export const { clearError } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;

export default authSlice.reducer; 