// ============================================================================
// SPEAKERS SLICE - Speaker Search & Management
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import type { 
  SpeakersState, 
  Speaker, 
  SpeakerFilters,
  ApiResponse 
} from '../types';

// Initial state
const initialState: SpeakersState = {
  speakers: [],
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    hasMore: true,
  },
  filters: {
    searchQuery: '',
    location: '',
    expertise: [],
    topics: [],
    yearsOfExperience: 0,
    availabilityDate: '',
    eventTypes: [],
    deliveryModes: [],
    requestedStartTime: '',
    requestedEndTime: '',
    priceRange: { min: 0, max: 10000 },
  },
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
  lastFetchTime: 0,
  searchSuggestions: [],
  availableEventTypes: [],
};

// Speakers slice
const speakersSlice = createSlice({
  name: 'speakers',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.isError = false;
      state.error = null;
    },
    
    // Set speakers (for initial load)
    setSpeakers: (state, action: PayloadAction<Speaker[]>) => {
      state.speakers = action.payload;
      state.isLoading = false;
      state.isSuccess = true;
      state.lastFetchTime = Date.now();
    },
    
    // Add speakers (for pagination/infinite scroll)
    addSpeakers: (state, action: PayloadAction<Speaker[]>) => {
      state.speakers = [...state.speakers, ...action.payload];
      state.isLoading = false;
    },
    
    // Update speaker (for profile updates, etc.)
    updateSpeaker: (state, action: PayloadAction<{ id: string; updates: Partial<Speaker> }>) => {
      const index = state.speakers.findIndex(speaker => speaker._id === action.payload.id);
      if (index !== -1) {
        state.speakers[index] = { ...state.speakers[index], ...action.payload.updates };
      }
    },
    
    // Remove speaker
    removeSpeaker: (state, action: PayloadAction<string>) => {
      state.speakers = state.speakers.filter(speaker => speaker._id !== action.payload);
    },
    
    // Set pagination
    setPagination: (state, action: PayloadAction<Partial<SpeakersState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Set filters
    setFilters: (state, action: PayloadAction<Partial<SpeakerFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Clear filters
    clearFilters: (state) => {
      state.filters = {
        searchQuery: '',
        location: '',
        expertise: [],
        topics: [],
        yearsOfExperience: 0,
        availabilityDate: '',
        eventTypes: [],
        deliveryModes: [],
        requestedStartTime: '',
        requestedEndTime: '',
        priceRange: { min: 0, max: 10000 },
      };
    },
    
    // Set search suggestions
    setSearchSuggestions: (state, action: PayloadAction<Speaker[]>) => {
      state.searchSuggestions = action.payload;
    },
    
    // Set available event types
    setAvailableEventTypes: (state, action: PayloadAction<{ category: string; events: { name: string; price: number; currency: string }[] }[]>) => {
      state.availableEventTypes = action.payload;
    },
    
    // Set error
    setError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isError = true;
      state.error = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.isError = false;
      state.error = null;
    },
    
    // Reset speakers
    resetSpeakers: () => initialState,
  },
});

// Speakers API endpoints
export const speakersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all speakers (basic list)
    getSpeakers: builder.query<
      ApiResponse<{
        speakers: Speaker[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalCount: number;
          hasNextPage: boolean;
          hasPrevPage: boolean;
          limit: number;
        };
      }>,
      {
        page?: number;
        limit?: number;
      }
    >({
      query: (params = {}) => {
        const { page = 1, limit = 12 } = params;
        console.log('🔍 Fetching speakers with params:', { page, limit });
        return {
          url: '/speaker-search/filter',
          params: { page, limit },
        };
      },
      providesTags: ['Speaker'],
      // Cache for 5 minutes
      keepUnusedDataFor: 300,
    }),
    
    // Search speakers with keywords
    searchSpeakers: builder.query<
      ApiResponse<{
        speakers: Speaker[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalCount: number;
          hasNextPage: boolean;
          hasPrevPage: boolean;
          limit: number;
        };
      }>,
      {
        q: string;
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => {
        console.log('🔍 Searching speakers with keywords:', params);
        return {
          url: '/speaker-search/search',
          params,
        };
      },
      providesTags: ['Speaker'],
      keepUnusedDataFor: 300,
    }),

    // Search speakers with filters
    searchSpeakersWithFilters: builder.query<
      ApiResponse<{
        speakers: Speaker[];
        pagination: {
          currentPage: number;
          totalPages: number;
          totalCount: number;
          hasNextPage: boolean;
          hasPrevPage: boolean;
          limit: number;
        };
        filters: {
          availabilityDate?: string;
          eventTypes?: string[];
          events?: string[];
          subTypes?: string[];
          minFee?: number;
          maxFee?: number;
          deliveryModes?: string[];
          yearsOfExperience?: number;
          location?: string;
          expertise?: string[];
          topics?: string[];
        };
      }>,
      {
        // Search query
        q?: string;
        page?: number;
        limit?: number;
        
        // Availability filters
        availabilityDate?: string;
        eventTypes?: string[];
        events?: string[];
        subTypes?: string[];
        minFee?: number;
        maxFee?: number;
        deliveryModes?: string[];
        
        // Time slot filters
        requestedStartTime?: string;
        requestedEndTime?: string;
        
        // Profile filters
        yearsOfExperience?: number;
        location?: string;
        expertise?: string[];
        topics?: string[];
      }
    >({
      query: (params) => {
        console.log('🔍 Searching speakers with filters:', params);
        return {
          url: '/speaker-search/filter',
          params,
        };
      },
      providesTags: ['Speaker'],
      keepUnusedDataFor: 300,
    }),
    
    // Get speaker suggestions for autocomplete
    getSpeakerSuggestions: builder.query<
      ApiResponse<Speaker[]>,
      {
        q: string;
        limit?: number;
      }
    >({
      query: ({ q, limit = 5 }) => ({
        url: '/speaker-search/suggestions',
        params: { q, limit },
      }),
      // Don't cache suggestions as they're user-specific
      keepUnusedDataFor: 60,
    }),
    
    // Get available event types for filtering
    getAvailableEventTypes: builder.query<
      ApiResponse<{ category: string; events: { name: string; price: number; currency: string }[] }[]>,
      void
    >({
      query: () => '/speaker-search/event-types',
      providesTags: ['Speaker'],
      // Cache event types for 1 hour as they don't change often
      keepUnusedDataFor: 3600,
    }),
    
    // Get speaker by ID (for detailed view)
    getSpeakerById: builder.query<
      ApiResponse<Speaker>,
      string
    >({
      query: (id) => `/speaker-search/speaker/${id}`,
      providesTags: (result, error, id) => [{ type: 'Speaker', id }],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),
    

    // Book speaker (for future implementation)
    bookSpeaker: builder.mutation<
      ApiResponse<{ bookingId: string }>,
      {
        speakerId: string;
        eventDetails: {
          title: string;
          date: string;
          startTime: string;
          endTime: string;
          location?: string;
          meetingUrl?: string;
          rate: number;
          currency: string;
        };
      }
    >({
      query: ({ speakerId, eventDetails }) => ({
        url: `/speaker-search/speaker/${speakerId}/book`,
        method: 'POST',
        body: eventDetails,
      }),
      invalidatesTags: ['Speaker'],
    }),
  }),
});

// Export actions
export const {
  setLoading,
  setSpeakers,
  addSpeakers,
  updateSpeaker,
  removeSpeaker,
  setPagination,
  setFilters,
  clearFilters,
  setSearchSuggestions,
  setAvailableEventTypes,
  setError,
  clearError,
  resetSpeakers,
} = speakersSlice.actions;

// Export API hooks
export const {
  useGetSpeakersQuery,
  useSearchSpeakersQuery,
  useSearchSpeakersWithFiltersQuery,
  useGetSpeakerSuggestionsQuery,
  useGetAvailableEventTypesQuery,
  useGetSpeakerByIdQuery,
  useBookSpeakerMutation,
} = speakersApi;

// Selectors
export const selectSpeakers = (state: { speakers: SpeakersState }) => state.speakers.speakers;
export const selectSpeakersPagination = (state: { speakers: SpeakersState }) => state.speakers.pagination;
export const selectSpeakersFilters = (state: { speakers: SpeakersState }) => state.speakers.filters;
export const selectSpeakersLoading = (state: { speakers: SpeakersState }) => state.speakers.isLoading;
export const selectSpeakersError = (state: { speakers: SpeakersState }) => state.speakers.error;
export const selectSearchSuggestions = (state: { speakers: SpeakersState }) => state.speakers.searchSuggestions;
export const selectAvailableEventTypes = (state: { speakers: SpeakersState }) => state.speakers.availableEventTypes;
export const selectLastFetchTime = (state: { speakers: SpeakersState }) => state.speakers.lastFetchTime;

// Export reducer
export default speakersSlice.reducer;
