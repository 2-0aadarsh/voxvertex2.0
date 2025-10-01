import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';

// Types for saved speakers
export interface SavedSpeaker {
  _id: string;
  organizer: string;
  speaker: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    email: string;
    profileImageUrl: string;
    bio: string;
    professionalTitle: string;
    location: string;
    areaOfExpertise: string[];
    yearsOfExperience: number;
    roleSpecificData?: {
      industry: string;
      activities: string[];
      workEmail?: string;
    };
    isProfileComplete: boolean;
    createdAt: string;
  };
  customTags: string[];
  notes: string;
  savedAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavedSpeakersResponse {
  success: boolean;
  message: string;
  data: {
    savedSpeakers: SavedSpeaker[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface CustomTagsResponse {
  success: boolean;
  message: string;
  data: {
    customTags: string[];
    count: number;
  };
}

export interface SavedSpeakersState {
  savedSpeakers: SavedSpeaker[];
  customTags: string[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

// RTK Query API endpoints for saved speakers
export const savedSpeakersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all saved speakers for organizer
    getSavedSpeakers: builder.query<SavedSpeakersResponse, { page?: number; limit?: number; tags?: string[] }>({
      query: (params = {}) => ({
        url: '/saved-speakers',
        method: 'GET',
        credentials: 'include',
        params,
      }),
      providesTags: ['SavedSpeaker'],
      transformResponse: (response: SavedSpeakersResponse) => response,
    }),

    // Get saved speakers for database view (with merged tags)
    getSavedSpeakersForDatabase: builder.query<SavedSpeakersResponse, { page?: number; limit?: number; tags?: string[] }>({
      query: (params = {}) => {
        console.log('🔍 RTK Query: getSavedSpeakersForDatabase called with params:', params);
        return {
          url: '/speaker-search/saved',
          method: 'GET',
          credentials: 'include',
          params,
        };
      },
      providesTags: ['SavedSpeaker'],
      transformResponse: (response: SavedSpeakersResponse) => {
        console.log('🔍 RTK Query: getSavedSpeakersForDatabase response:', response);
        return response;
      },
    }),

    // Get custom tags for organizer
    getCustomTags: builder.query<CustomTagsResponse, void>({
      query: () => ({
        url: '/saved-speakers/tags',
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['SavedSpeaker'],
      transformResponse: (response: CustomTagsResponse) => response,
    }),

    // Check if speaker is saved
    checkSpeakerSavedStatus: builder.query<{ success: boolean; data: { isSaved: boolean; savedSpeaker?: SavedSpeaker } }, string>({
      query: (speakerId) => ({
        url: `/saved-speakers/check/${speakerId}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: (result, error, speakerId) => [{ type: 'SavedSpeaker', id: speakerId }],
    }),

    // Save speaker with tags
    saveSpeaker: builder.mutation<{ success: boolean; message: string; data: SavedSpeaker }, { speakerId: string; customTags?: string[]; notes?: string }>({
      query: ({ speakerId, customTags = [], notes = '' }) => ({
        url: '/saved-speakers',
        method: 'POST',
        credentials: 'include',
        body: { speakerId, customTags, notes },
      }),
      invalidatesTags: ['SavedSpeaker'],
    }),

    // Update saved speaker tags
    updateSavedSpeakerTags: builder.mutation<{ success: boolean; message: string; data: SavedSpeaker }, { savedSpeakerId: string; customTags?: string[]; notes?: string }>({
      query: ({ savedSpeakerId, customTags = [], notes = '' }) => ({
        url: `/saved-speakers/${savedSpeakerId}`,
        method: 'PUT',
        credentials: 'include',
        body: { customTags, notes },
      }),
      invalidatesTags: ['SavedSpeaker'],
    }),

    // Remove saved speaker
    removeSavedSpeaker: builder.mutation<{ success: boolean; message: string }, string>({
      query: (savedSpeakerId) => ({
        url: `/saved-speakers/${savedSpeakerId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['SavedSpeaker'],
    }),
  }),
  overrideExisting: true,
});

// Export hooks for use in components
export const {
  useGetSavedSpeakersQuery,
  useGetSavedSpeakersForDatabaseQuery,
  useGetCustomTagsQuery,
  useCheckSpeakerSavedStatusQuery,
  useSaveSpeakerMutation,
  useUpdateSavedSpeakerTagsMutation,
  useRemoveSavedSpeakerMutation,
} = savedSpeakersApi;

// Initial state
const initialState: SavedSpeakersState = {
  savedSpeakers: [],
  customTags: [],
  isLoading: false,
  error: null,
  lastFetched: null,
};

// Async thunk for fetching saved speakers
export const fetchSavedSpeakers = createAsyncThunk(
  'savedSpeakers/fetchSavedSpeakers',
  async (params: { page?: number; limit?: number; tags?: string[] } = {}, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/saved-speakers', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        ...(Object.keys(params).length > 0 && {
          body: JSON.stringify(params),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch saved speakers');
      }

      const data: SavedSpeakersResponse = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch saved speakers');
    }
  }
);

// Slice
const savedSpeakersSlice = createSlice({
  name: 'savedSpeakers',
  initialState,
  reducers: {
    // Clear saved speakers data
    clearSavedSpeakers: (state) => {
      state.savedSpeakers = [];
      state.customTags = [];
      state.error = null;
      state.lastFetched = null;
    },

    // Add new saved speaker (for real-time updates)
    addSavedSpeaker: (state, action) => {
      const newSavedSpeaker = action.payload;
      state.savedSpeakers.push(newSavedSpeaker);
      
      // Add new custom tags to the list
      newSavedSpeaker.customTags.forEach(tag => {
        if (!state.customTags.includes(tag)) {
          state.customTags.push(tag);
        }
      });
    },

    // Update saved speaker
    updateSavedSpeaker: (state, action) => {
      const { savedSpeakerId, updates } = action.payload;
      const index = state.savedSpeakers.findIndex(s => s._id === savedSpeakerId);
      
      if (index !== -1) {
        state.savedSpeakers[index] = { ...state.savedSpeakers[index], ...updates };
        
        // Update custom tags list
        if (updates.customTags) {
          updates.customTags.forEach(tag => {
            if (!state.customTags.includes(tag)) {
              state.customTags.push(tag);
            }
          });
        }
      }
    },

    // Remove saved speaker
    removeSavedSpeaker: (state, action) => {
      const savedSpeakerId = action.payload;
      state.savedSpeakers = state.savedSpeakers.filter(s => s._id !== savedSpeakerId);
    },

    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Set custom tags
    setCustomTags: (state, action) => {
      state.customTags = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch saved speakers
      .addCase(fetchSavedSpeakers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSavedSpeakers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savedSpeakers = action.payload.data.savedSpeakers;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchSavedSpeakers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearSavedSpeakers,
  addSavedSpeaker,
  updateSavedSpeaker,
  removeSavedSpeaker,
  setLoading,
  setError,
  setCustomTags,
} = savedSpeakersSlice.actions;

// Export reducer
export default savedSpeakersSlice.reducer;

// Selectors
export const selectSavedSpeakers = (state: { savedSpeakers: SavedSpeakersState }) => 
  state.savedSpeakers.savedSpeakers;

export const selectCustomTags = (state: { savedSpeakers: SavedSpeakersState }) => 
  state.savedSpeakers.customTags;

export const selectSavedSpeakersLoading = (state: { savedSpeakers: SavedSpeakersState }) => 
  state.savedSpeakers.isLoading;

export const selectSavedSpeakersError = (state: { savedSpeakers: SavedSpeakersState }) => 
  state.savedSpeakers.error;
