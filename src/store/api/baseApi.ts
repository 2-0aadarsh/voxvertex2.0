// ============================================================================
// BASE API - RTK Query Configuration
// ============================================================================

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  credentials: 'include', // Include cookies for authentication
  prepareHeaders: (headers) => {
    // Only use cookie-based authentication - no Bearer tokens needed
    // The backend will read tokens from cookies automatically
    
    // Don't set Content-Type here - let RTK Query handle it based on body type
    // For FormData, RTK Query will automatically set multipart/form-data
    // For JSON, it will set application/json
    
    return headers;
  },
});

// Base query with re-authentication logic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  console.log('=== BASE API DEBUG ===');
  console.log('Making request to:', args.url);
  console.log('Request args:', args);
  console.log('Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');
  console.log('Full URL:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}${args.url}`);
  console.log('=====================');
  
  try {
    const result = await baseQuery(args, api, extraOptions);
    
    console.log('=== BASE API RESPONSE ===');
    console.log('Response status:', result.meta?.response?.status);
    console.log('Response data:', result.data);
    console.log('Response error:', result.error);
    console.log('========================');
    
    // If we get a 401, the session might have expired
    if (result?.error && result.error.status === 401) {
      console.log('Authentication failed - session may have expired');
      console.log('Redirecting to login...');
      
      // For cookie-based auth, we don't need to refresh tokens
      // The backend handles token refresh automatically via cookies
      // Just logout the user and let them re-authenticate
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (api as any).dispatch({ type: 'auth/logout' });
    }

    return result;
  } catch (error) {
    console.log('=== BASE API ERROR ===');
    console.log('Error:', error);
    console.log('======================');
    throw error;
  }
};

// Create the base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Profile', 
    'Post',
    'FeedPost',
    'WorkExperience',
    'Education',
    'Award',
    'Video',
    'CalendarEvent',
    'Availability',
    'Speaker',
    'SpeakerProfile',
    'Booking',
    'Conversation',
    'Message',
    'Negotiation',
    'OrganizerBooking',
    'SavedSpeaker',
    'EnhancedEvent',
    'Document',
    'Subscription'
  ],
  endpoints: () => ({}),
});

// Export hooks for usage in functional components
export const {
  // Will be populated by individual API slices
} = baseApi;


