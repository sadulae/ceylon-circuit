import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tripbotReducer from './slices/tripbotSlice';
import destinationReducer from './slices/destinationSlice';
import tourReducer from './slices/tourSlice';
import accReducer from './slices/accSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    accommodations: accReducer,
    destinations: destinationReducer,
    tripbot: tripbotReducer,
    tours: tourReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'destinations/create/pending',
          'destinations/create/fulfilled', 
          'destinations/update/pending',
          'destinations/update/fulfilled'
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg.destinationData'],
      },
    }),
});

export default store; 