// ============================================================================
// REDUX STORE CONFIGURATION - Production Ready Setup
// ============================================================================

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import API slices
import { baseApi } from './api/baseApi';
import { disputeApi } from '../store/api/disputApi'; // disputeApi with all dispute & events endpoints

// Import other slices
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import postsReducer from './slices/postsSlice';
import feedReducer from './slices/feedSlice';
import workExperienceReducer from './slices/workExperienceSlice';
import educationReducer from './slices/educationSlice';
import awardsReducer from './slices/awardsSlice';
import videosReducer from './slices/videosSlice';
import calendarReducer from './slices/calendarSlice';
import availabilityReducer from './slices/availabilitySlice';
import speakersReducer from './slices/speakersSlice';
import speakerProfileReducer from './slices/speakerProfileSlice';
import bookingReducer from './slices/bookingSlice';
import messagingReducer from './slices/messagingSlice';
import negotiationReducer from './slices/negotiationSlice';
import organizerBookingsReducer from './slices/organizerBookingsSlice';
import savedSpeakersReducer from './slices/savedSpeakersSlice';
import enhancedEventReducer from './slices/enhancedEventSlice';

// Persist configuration
const persistConfig = {
  key: 'voxvertex-root',
  version: 1,
  storage,
  whitelist: ['auth'],
  blacklist: [
    'api',
    'disputeApi',
    'posts',
    'feed',
    'workExperience',
    'education',
    'awards',
    'videos',
    'calendar',
    'availability',
    'speakers',
    'speakerProfile',
    'booking',
    'messaging',
    'negotiation',
    'organizerBookings',
    'savedSpeakers',
    'enhancedEvent'
  ],
};

// Auth persist configuration
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated', 'token', 'role'],
};

// Custom middleware to suppress File object serialization warnings
const ignoreFileObjectsMiddleware = (store: any) => (next: any) => (action: any) => {
  // Suppress warnings for File objects in enhancedEvent formData
  if (action.type?.includes('enhancedEvent') && action.payload?.image instanceof File) {
    // Create a sanitized action without the File object for logging
    const sanitizedAction = {
      ...action,
      payload: {
        ...action.payload,
        image: `File(${action.payload.image.name})`
      }
    };
    return next(action);
  }
  return next(action);
};

// Root reducer
const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  [disputeApi.reducerPath]: disputeApi.reducer, // Add only disputeApi reducer
  auth: persistReducer(authPersistConfig, authReducer),
  profile: profileReducer,
  posts: postsReducer,
  feed: feedReducer,
  workExperience: workExperienceReducer,
  education: educationReducer,
  awards: awardsReducer,
  videos: videosReducer,
  calendar: calendarReducer,
  availability: availabilityReducer,
  speakers: speakersReducer,
  speakerProfile: speakerProfileReducer,
  booking: bookingReducer,
  messaging: messagingReducer,
  negotiation: negotiationReducer,
  organizerBookings: organizerBookingsReducer,
  savedSpeakers: savedSpeakersReducer,
  enhancedEvent: enhancedEventReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['enhancedEvent.formData.image'], // Ignore File objects in enhancedEvent
      },
      immutableCheck: {
        warnAfter: 128,
      },
      serializableStateInvariantCheck: {
        warnAfter: 128,
      },
    }).concat(baseApi.middleware).concat(disputeApi.middleware).concat(ignoreFileObjectsMiddleware), // Add both APIs middleware
  devTools: process.env.NODE_ENV !== 'production',
  preloadedState: undefined,
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

// Store reset utility
export const resetStore = () => {
  persistor.purge();
  store.dispatch({ type: 'auth/resetAuth' });
  store.dispatch({ type: 'profile/resetProfile' });
  store.dispatch({ type: 'posts/resetPosts' });
  store.dispatch({ type: 'feed/resetFeed' });
  store.dispatch({ type: 'workExperience/resetWorkExperience' });
  store.dispatch({ type: 'education/resetEducation' });
  store.dispatch({ type: 'awards/resetAwards' });
  store.dispatch({ type: 'videos/resetVideos' });
  store.dispatch({ type: 'calendar/resetCalendar' });
  store.dispatch({ type: 'availability/resetAvailability' });
  store.dispatch({ type: 'speakers/resetSpeakers' });
  store.dispatch({ type: 'speakerProfile/resetProfile' });
  store.dispatch({ type: 'booking/resetBooking' });
  store.dispatch({ type: 'messaging/resetMessagingState' });
  store.dispatch({ type: 'negotiation/resetNegotiation' });
  store.dispatch({ type: 'organizerBookings/clearOrganizerBookings' });
  store.dispatch({ type: 'savedSpeakers/clearSavedSpeakers' });
  store.dispatch({ type: 'enhancedEvent/resetForm' });
  
  // Reset API cache
  store.dispatch(baseApi.util.resetApiState());
  store.dispatch(disputeApi.util.resetApiState());
};

// Selective cache invalidation
export const invalidateUserData = () => {
  store.dispatch(
    baseApi.util.invalidateTags([
      'User', 
      'Profile', 
      'Post', 
      'WorkExperience', 
      'Education', 
      'Award', 
      'Video', 
      'CalendarEvent',
      'Speaker',
      'SpeakerProfile',
      'Conversation',
      'Message',
      'Negotiation',
      'OrganizerBooking',
      'SavedSpeaker',
      'EnhancedEvent'
    ])
  );
};

// Performance monitoring (development only)
if (process.env.NODE_ENV === 'development') {
  // Log store state changes
  store.subscribe(() => {
    const state = store.getState();
    console.log('Store updated:', {
      auth: state.auth.isAuthenticated,
      api: Object.keys(state.api.queries).length,
      timestamp: new Date().toISOString(),
    });
  });
}

// ============================================================================
// EXPORT INDIVIDUAL STORE PARTS FOR TESTING
// ============================================================================

export {
  authReducer,
  profileReducer,
  postsReducer,
  feedReducer,
  workExperienceReducer,
  educationReducer,
  awardsReducer,
  videosReducer,
  calendarReducer,
  availabilityReducer,
  speakersReducer,
  speakerProfileReducer,
  bookingReducer,
  messagingReducer,
  negotiationReducer,
  organizerBookingsReducer,
  savedSpeakersReducer,
  enhancedEventReducer,
  
  // API
  baseApi,
  disputeApi,
  rootReducer,
};
