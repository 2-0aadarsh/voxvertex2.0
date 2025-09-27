// ============================================================================
// BOOKING SLICE - Speaker Booking Flow Management
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import type { 
  BookingState, 
  BookingFormData,
  BookingStep,
  BookingValidation,
  SpeakerAvailability,
  ApiResponse,
  BookingHistoryItem
} from '../types';

// Initial state
const initialState: BookingState = {
  // Current booking session
  currentBooking: null,
  isBookingModalOpen: false,
  currentStep: 1,
  
  // Form data for the booking flow
  formData: {
    // Step 1: Date & Time
    date: '',
    startTime: '',
    endTime: '',
    duration: 0,
    
    // Step 2: Event Details
    eventName: '',
    eventType: '',
    location: '',
    attendees: 0,
    description: '',
    
    // Step 3: Compensation & Arrangements
    compensation: {
      primaryCompensation: {
        speakerFee: {
          enabled: false,
          amount: 0
        },
        honorarium: {
          enabled: false,
          amount: 0
        }
      },
      travelExpenses: {
        enabled: false,
        mode: '',
        arrangement: '',
        amount: 0
      },
      lodgingAccommodation: {
        enabled: false,
        type: '',
        arrangement: '',
        checkInDate: '',
        checkOutDate: '',
        amount: 0
      },
      additionalArrangements: {
        enabled: false,
        localTransportation: false,
        meals: false,
        specialRequests: ''
      }
    },
    
    // Step 4: Review & Send
    personalMessage: '',
    currency: 'USD'
  },
  
  // Validation state
  validation: {
    step1: { isValid: false, errors: {} },
    step2: { isValid: false, errors: {} },
    step3: { isValid: false, errors: {} },
    step4: { isValid: false, errors: {} }
  },
  
  // Speaker availability data
  speakerAvailability: null,
  
  // Loading states
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
  
  // Booking history
  bookingHistory: [],
  
  // Available event types for selection
  availableEventTypes: [
    'Keynote Speaker',
    'Workshop',
    'Panel Discussion',
    'Breakout Session',
    'Consultation',
    'Mentorship'
  ],
  
  // Available time slots
  availableTimeSlots: [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ]
};

// Booking slice
const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    // Modal control
    openBookingModal: (state, action: PayloadAction<{ speakerId: string; speakerName: string }>) => {
      state.isBookingModalOpen = true;
      state.currentBooking = {
        speakerId: action.payload.speakerId,
        speakerName: action.payload.speakerName,
        bookingId: null,
        status: 'draft'
      };
      state.currentStep = 1;
      // Reset form data when opening new booking
      state.formData = initialState.formData;
      state.validation = initialState.validation;
    },
    
    closeBookingModal: (state) => {
      state.isBookingModalOpen = false;
      state.currentBooking = null;
      state.currentStep = 1;
      state.formData = initialState.formData;
      state.validation = initialState.validation;
      state.speakerAvailability = null;
      state.error = null;
    },
    
    // Step navigation
    setCurrentStep: (state, action: PayloadAction<BookingStep>) => {
      state.currentStep = action.payload;
    },
    
    nextStep: (state) => {
      if (state.currentStep < 4) {
        state.currentStep = (state.currentStep + 1) as BookingStep;
      }
    },
    
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep = (state.currentStep - 1) as BookingStep;
      }
    },
    
    // Form data updates
    updateFormData: (state, action: PayloadAction<Partial<BookingFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    
    // Step 1: Date & Time updates
    updateDateTime: (state, action: PayloadAction<{
      date?: string;
      startTime?: string;
      endTime?: string;
    }>) => {
      const { date, startTime, endTime } = action.payload;
      
      if (date) state.formData.date = date;
      if (startTime) state.formData.startTime = startTime;
      if (endTime) state.formData.endTime = endTime;
      
      // Calculate duration if both times are provided
      if (startTime && endTime) {
        const start = new Date(`2000-01-01T${startTime}:00`);
        const end = new Date(`2000-01-01T${endTime}:00`);
        const diffInMs = end.getTime() - start.getTime();
        state.formData.duration = Math.max(0, Math.floor(diffInMs / (1000 * 60))); // Convert to minutes
      }
    },
    
    // Step 2: Event Details updates
    updateEventDetails: (state, action: PayloadAction<{
      eventName?: string;
      eventType?: string;
      location?: string;
      attendees?: number;
      description?: string;
    }>) => {
      const updates = action.payload;
      if (updates.eventName !== undefined) state.formData.eventName = updates.eventName;
      if (updates.eventType !== undefined) state.formData.eventType = updates.eventType;
      if (updates.location !== undefined) state.formData.location = updates.location;
      if (updates.attendees !== undefined) state.formData.attendees = updates.attendees;
      if (updates.description !== undefined) state.formData.description = updates.description;
    },
    
    // Step 3: Compensation updates
    updateCompensation: (state, action: PayloadAction<{
      type: 'primaryCompensation' | 'travelExpenses' | 'lodgingAccommodation' | 'additionalArrangements';
      data: Record<string, unknown>;
    }>) => {
      const { type, data } = action.payload;
      // Handle each compensation type specifically
      switch (type) {
        case 'primaryCompensation':
          state.formData.compensation.primaryCompensation = { 
            ...state.formData.compensation.primaryCompensation, 
            ...data 
          };
          break;
        case 'travelExpenses':
          state.formData.compensation.travelExpenses = { 
            ...state.formData.compensation.travelExpenses, 
            ...data 
          };
          break;
        case 'lodgingAccommodation':
          state.formData.compensation.lodgingAccommodation = { 
            ...state.formData.compensation.lodgingAccommodation, 
            ...data 
          };
          break;
        case 'additionalArrangements':
          state.formData.compensation.additionalArrangements = { 
            ...state.formData.compensation.additionalArrangements, 
            ...data 
          };
          break;
      }
    },
    
    // Step 4: Personal message update
    updatePersonalMessage: (state, action: PayloadAction<string>) => {
      state.formData.personalMessage = action.payload;
    },
    
    // Validation updates
    updateValidation: (state, action: PayloadAction<{
      step: BookingStep;
      validation: BookingValidation;
    }>) => {
      const { step, validation } = action.payload;
      switch (step) {
        case 1:
          state.validation.step1 = validation;
          break;
        case 2:
          state.validation.step2 = validation;
          break;
        case 3:
          state.validation.step3 = validation;
          break;
        case 4:
          state.validation.step4 = validation;
          break;
      }
    },
    
    // Set speaker availability
    setSpeakerAvailability: (state, action: PayloadAction<SpeakerAvailability>) => {
      state.speakerAvailability = action.payload;
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.isError = false;
        state.error = null;
      }
    },
    
    setSuccess: (state, action: PayloadAction<boolean>) => {
      state.isSuccess = action.payload;
      state.isLoading = false;
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isError = true;
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.isError = false;
      state.error = null;
    },
    
    // Add booking to history
    addBookingToHistory: (state, action: PayloadAction<BookingHistoryItem>) => {
      state.bookingHistory.unshift(action.payload);
    },
    
    // Reset booking state
    resetBooking: () => initialState,
    
    // Save booking draft
    saveBookingDraft: (state) => {
      if (state.currentBooking) {
        state.currentBooking.status = 'draft';
        // Could save to localStorage or send to backend
      }
    },
    
    // Load booking draft
    loadBookingDraft: (state, action: PayloadAction<{
      formData: BookingFormData;
      currentStep: BookingStep;
      speakerId: string;
      speakerName: string;
    }>) => {
      state.formData = action.payload.formData;
      state.currentStep = action.payload.currentStep;
      state.currentBooking = {
        speakerId: action.payload.speakerId,
        speakerName: action.payload.speakerName,
        bookingId: null,
        status: 'draft'
      };
      state.isBookingModalOpen = true;
    }
  },
});

// Booking API endpoints
export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get speaker availability for booking
    getSpeakerAvailabilityForBooking: builder.query<
      ApiResponse<SpeakerAvailability>,
      {
        speakerId: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: ({ speakerId, startDate, endDate }) => {
        console.log('🔍 RTK Query - getSpeakerAvailabilityForBooking called with:', {
          speakerId,
          startDate,
          endDate,
          url: `/availability/speaker/${speakerId}`
        });
        return {
          url: `/availability/speaker/${speakerId}`,
          params: { startDate, endDate },
        };
      },
      providesTags: (result, error, { speakerId }) => [{ type: 'Speaker', id: speakerId }],
      keepUnusedDataFor: 60, // Cache for 1 minute
    }),
    
    // Create booking request (draft)
    createBookingDraft: builder.mutation<
      ApiResponse<{ bookingId: string; status: string }>,
      {
        speakerId: string;
        formData: BookingFormData;
      }
    >({
      query: ({ speakerId, formData }) => ({
        url: '/book-speaker/draft',
        method: 'POST',
        body: { speakerId, formData },
      }),
      invalidatesTags: ['Booking'],
    }),
    
    // Update booking draft
    updateBookingDraft: builder.mutation<
      ApiResponse<{ bookingId: string }>,
      {
        bookingId: string;
        formData: Partial<BookingFormData>;
        currentStep: BookingStep;
      }
    >({
      query: ({ bookingId, formData, currentStep }) => ({
        url: `/book-speaker/draft/${bookingId}`,
        method: 'PUT',
        body: { formData, currentStep },
      }),
      invalidatesTags: (result, error, { bookingId }) => [{ type: 'Booking', id: bookingId }],
    }),
    
    // Submit booking request
    submitBookingRequest: builder.mutation<
      ApiResponse<{ bookingId: string; status: string }>,
      {
        bookingId: string;
        formData: BookingFormData;
      }
    >({
      query: ({ bookingId, formData }) => ({
        url: `/book-speaker/submit/${bookingId}`,
        method: 'POST',
        body: { formData },
      }),
      invalidatesTags: ['Booking'],
    }),
    
    // Get booking history
    getBookingHistory: builder.query<
      ApiResponse<{
        bookings: BookingHistoryItem[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>,
      {
        page?: number;
        limit?: number;
        status?: string;
      }
    >({
      query: (params = {}) => ({
        url: '/book-speaker/history',
        params,
      }),
      providesTags: ['Booking'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),
    
    // Get booking by ID
    getBookingById: builder.query<
      ApiResponse<BookingHistoryItem>,
      string
    >({
      query: (bookingId) => `/book-speaker/${bookingId}`,
      providesTags: (result, error, bookingId) => [{ type: 'Booking', id: bookingId }],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),
    
    // Cancel booking
    cancelBooking: builder.mutation<
      ApiResponse<{ bookingId: string; status: string }>,
      string
    >({
      query: (bookingId) => ({
        url: `/book-speaker/${bookingId}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, bookingId) => [{ type: 'Booking', id: bookingId }],
    }),
  }),
});

// Export actions
export const {
  // Modal control
  openBookingModal,
  closeBookingModal,
  
  // Step navigation
  setCurrentStep,
  nextStep,
  previousStep,
  
  // Form data updates
  updateFormData,
  updateDateTime,
  updateEventDetails,
  updateCompensation,
  updatePersonalMessage,
  
  // Validation
  updateValidation,
  
  // Speaker availability
  setSpeakerAvailability,
  
  // Loading states
  setLoading,
  setSuccess,
  setError,
  clearError,
  
  // Booking history
  addBookingToHistory,
  
  // State management
  resetBooking,
  saveBookingDraft,
  loadBookingDraft,
} = bookingSlice.actions;

// Export API hooks
export const {
  useGetSpeakerAvailabilityForBookingQuery,
  useCreateBookingDraftMutation,
  useUpdateBookingDraftMutation,
  useSubmitBookingRequestMutation,
  useGetBookingHistoryQuery,
  useGetBookingByIdQuery,
  useCancelBookingMutation,
} = bookingApi;

// Selectors
export const selectBookingState = (state: { booking: BookingState }) => state.booking;
export const selectCurrentBooking = (state: { booking: BookingState }) => state.booking.currentBooking;
export const selectIsBookingModalOpen = (state: { booking: BookingState }) => state.booking.isBookingModalOpen;
export const selectCurrentStep = (state: { booking: BookingState }) => state.booking.currentStep;
export const selectBookingFormData = (state: { booking: BookingState }) => state.booking.formData;
export const selectBookingValidation = (state: { booking: BookingState }) => state.booking.validation;
export const selectSpeakerAvailability = (state: { booking: BookingState }) => state.booking.speakerAvailability;
export const selectBookingLoading = (state: { booking: BookingState }) => state.booking.isLoading;
export const selectBookingError = (state: { booking: BookingState }) => state.booking.error;
export const selectBookingHistory = (state: { booking: BookingState }) => state.booking.bookingHistory;
export const selectAvailableEventTypes = (state: { booking: BookingState }) => state.booking.availableEventTypes;
export const selectAvailableTimeSlots = (state: { booking: BookingState }) => state.booking.availableTimeSlots;

// Validation helpers
export const validateStep1 = (formData: BookingFormData): BookingValidation => {
  const errors: Record<string, string> = {};
  
  if (!formData.date) errors.date = 'Date is required';
  if (!formData.startTime) errors.startTime = 'Start time is required';
  if (!formData.endTime) errors.endTime = 'End time is required';
  
  if (formData.startTime && formData.endTime) {
    const start = new Date(`2000-01-01T${formData.startTime}:00`);
    const end = new Date(`2000-01-01T${formData.endTime}:00`);
    if (start >= end) {
      errors.endTime = 'End time must be after start time';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateStep2 = (formData: BookingFormData): BookingValidation => {
  const errors: Record<string, string> = {};
  
  if (!formData.eventName?.trim()) errors.eventName = 'Event name is required';
  if (!formData.eventType) errors.eventType = 'Event type is required';
  if (!formData.location?.trim()) errors.location = 'Location is required';
  if (!formData.attendees || formData.attendees <= 0) errors.attendees = 'Expected attendees must be greater than 0';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateStep3 = (formData: BookingFormData): BookingValidation => {
  const errors: Record<string, string> = {};
  
  const { primaryCompensation } = formData.compensation;
  
  if (!primaryCompensation.speakerFee.enabled && !primaryCompensation.honorarium.enabled) {
    errors.primaryCompensation = 'At least one primary compensation is required';
  }
  
  if (primaryCompensation.speakerFee.enabled && primaryCompensation.speakerFee.amount <= 0) {
    errors.speakerFeeAmount = 'Speaker fee amount must be greater than 0';
  }
  
  if (primaryCompensation.honorarium.enabled && primaryCompensation.honorarium.amount <= 0) {
    errors.honorariumAmount = 'Honorarium amount must be greater than 0';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateStep4 = (formData: BookingFormData): BookingValidation => {
  const errors: Record<string, string> = {};
  
  if (!formData.personalMessage?.trim()) {
    errors.personalMessage = 'Personal message is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Export reducer
export default bookingSlice.reducer;
