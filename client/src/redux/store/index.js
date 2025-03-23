import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/authSlice';
import tripbotReducer from '../slices/tripbotSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    tripbot: tripbotReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.token'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.token']
      }
    })
});

export default store; 