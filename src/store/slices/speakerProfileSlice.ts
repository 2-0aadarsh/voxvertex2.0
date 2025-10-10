// ============================================================================
// SPEAKER PROFILE SLICE - Detailed Speaker Profile Management
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import type { 
  Speaker,
  WorkExperience,
  Education,
  Award,
  FeaturedVideo,
  ApiResponse 
} from '../types';

// Availability Interface
export interface AvailabilityData {
  dates: string[];
  eventTypes: any[];
  modes: string[];
  timeSlots: any[];
}

// Detailed Speaker Profile Interface
export interface DetailedSpeakerProfile {
  speaker: Speaker;
  workExperience: WorkExperience[];
  education: Education[];
  awards: Award[];
  featuredVideos: FeaturedVideo[];
  availability: AvailabilityData;
  statistics: {
    totalExperience: number;
    totalVideos: number;
    totalAwards: number;
    totalEducation: number;
    totalAvailabilityDates: number;
  };
}

// Speaker Profile State
export interface SpeakerProfileState {
  detailedProfile: DetailedSpeakerProfile | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
  lastFetchTime: number;
  currentSpeakerId: string | null;
}

// Initial state
const initialState: SpeakerProfileState = {
  detailedProfile: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
  lastFetchTime: 0,
  currentSpeakerId: null,
};

// Speaker Profile slice
const speakerProfileSlice = createSlice({
  name: 'speakerProfile',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.isError = false;
      state.error = null;
    },
    
    // Set detailed profile
    setDetailedProfile: (state, action: PayloadAction<DetailedSpeakerProfile>) => {
      state.detailedProfile = action.payload;
      state.isLoading = false;
      state.isSuccess = true;
      state.lastFetchTime = Date.now();
    },
    
    // Set current speaker ID
    setCurrentSpeakerId: (state, action: PayloadAction<string>) => {
      state.currentSpeakerId = action.payload;
    },
    
    // Update work experience
    updateWorkExperience: (state, action: PayloadAction<WorkExperience[]>) => {
      if (state.detailedProfile) {
        state.detailedProfile.workExperience = action.payload;
        state.detailedProfile.statistics.totalExperience = action.payload.length;
      }
    },
    
    // Update education
    updateEducation: (state, action: PayloadAction<Education[]>) => {
      if (state.detailedProfile) {
        state.detailedProfile.education = action.payload;
        state.detailedProfile.statistics.totalEducation = action.payload.length;
      }
    },
    
    // Update awards
    updateAwards: (state, action: PayloadAction<Award[]>) => {
      if (state.detailedProfile) {
        state.detailedProfile.awards = action.payload;
        state.detailedProfile.statistics.totalAwards = action.payload.length;
      }
    },
    
    // Update featured videos
    updateFeaturedVideos: (state, action: PayloadAction<FeaturedVideo[]>) => {
      if (state.detailedProfile) {
        state.detailedProfile.featuredVideos = action.payload;
        state.detailedProfile.statistics.totalVideos = action.payload.length;
      }
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
    
    // Reset profile
    resetProfile: () => initialState,
  },
});

// Speaker Profile API endpoints
export const speakerProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get detailed speaker profile
    getDetailedSpeakerProfile: builder.query<
      ApiResponse<DetailedSpeakerProfile>,
      string
    >({
      query: (speakerId) => `/speaker-profile/${speakerId}/detailed`,
      providesTags: (result, error, speakerId) => [
        { type: 'SpeakerProfile', id: speakerId },
        'SpeakerProfile'
      ],
      // Cache for 15 minutes
      keepUnusedDataFor: 900,
    }),
    
    // Get speaker work experience
    getSpeakerWorkExperience: builder.query<
      ApiResponse<WorkExperience[]>,
      string
    >({
      query: (speakerId) => `/speaker-profile/${speakerId}/work-experience`,
      providesTags: (result, error, speakerId) => [
        { type: 'WorkExperience', id: speakerId },
        'WorkExperience'
      ],
      keepUnusedDataFor: 600,
    }),
    
    // Get speaker education
    getSpeakerEducation: builder.query<
      ApiResponse<Education[]>,
      string
    >({
      query: (speakerId) => `/speaker-profile/${speakerId}/education`,
      providesTags: (result, error, speakerId) => [
        { type: 'Education', id: speakerId },
        'Education'
      ],
      keepUnusedDataFor: 600,
    }),
    
    // Get speaker awards
    getSpeakerAwards: builder.query<
      ApiResponse<Award[]>,
      string
    >({
      query: (speakerId) => `/speaker-profile/${speakerId}/awards`,
      providesTags: (result, error, speakerId) => [
        { type: 'Award', id: speakerId },
        'Award'
      ],
      keepUnusedDataFor: 600,
    }),
    
    // Get speaker featured videos
    getSpeakerFeaturedVideos: builder.query<
      ApiResponse<FeaturedVideo[]>,
      string
    >({
      query: (speakerId) => `/speaker-profile/${speakerId}/videos`,
      providesTags: (result, error, speakerId) => [
        { type: 'Video', id: speakerId },
        'Video'
      ],
      keepUnusedDataFor: 600,
    }),
  }),
});

// Export actions
export const {
  setLoading,
  setDetailedProfile,
  setCurrentSpeakerId,
  updateWorkExperience,
  updateEducation,
  updateAwards,
  updateFeaturedVideos,
  setError,
  clearError,
  resetProfile,
} = speakerProfileSlice.actions;

// Export API hooks
export const {
  useGetDetailedSpeakerProfileQuery,
  useGetSpeakerWorkExperienceQuery,
  useGetSpeakerEducationQuery,
  useGetSpeakerAwardsQuery,
  useGetSpeakerFeaturedVideosQuery,
} = speakerProfileApi;

// Selectors
export const selectDetailedProfile = (state: { speakerProfile: SpeakerProfileState }) => 
  state.speakerProfile.detailedProfile;
export const selectSpeakerProfileLoading = (state: { speakerProfile: SpeakerProfileState }) => 
  state.speakerProfile.isLoading;
export const selectSpeakerProfileError = (state: { speakerProfile: SpeakerProfileState }) => 
  state.speakerProfile.error;
export const selectCurrentSpeakerId = (state: { speakerProfile: SpeakerProfileState }) => 
  state.speakerProfile.currentSpeakerId;
export const selectLastFetchTime = (state: { speakerProfile: SpeakerProfileState }) => 
  state.speakerProfile.lastFetchTime;

// Export reducer
export default speakerProfileSlice.reducer;
