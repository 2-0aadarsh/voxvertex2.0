// ============================================================================
// ENHANCED EVENT SLICE - Event Management State Management
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import type { 
  EventFormData,
  EventFormState,
  EnhancedEvent,
  CreateEventRequest,
  UpdateEventRequest,
  EventListResponse,
  EventValidation,
  EventStep,
  FileUploadResponse,
  EventCreationResponse
} from '../../app/events_page/types/eventTypes';

// Define ApiResponse type locally
type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

// Initial form state
const initialFormData: EventFormData = {
  // Step 1: Core Details
  eventName: '',
  startDate: '',
  endDate: '',
  eventMode: 'offline',
  format: '',
  location: '',
  eventUrl: '',
  
  // Step 2: Branding & Content
  description: '',
  bannerImage: null,
  bannerImageUrl: '',
  image: null, // For compatibility
  tags: [],
  
  // Step 3: Ticketing
  ticketTypes: [],
  
  // Step 4: Speakers
  speakers: {
    manualSpeakers: [],
    platformSpeakers: []
  },
  speakersArray: [], // For compatibility
  
  // Step 5: Addons
  addons: {
    featureOnHome: false,
    includeInNewsletter: false,
    socialMediaPromotion: false
  },
  
  // Step 6: Policies & Terms - all fields start empty
  policies: {
    participantRefund: {
      allowRefunds: false,
      refundDeadline: '',
      refundPercentage: '',
      processingFee: '',
      processingTime: '',
      allowEmergencyRefunds: false,
      emergencyConditions: '',
      refundConditions: []
    },
    speakerCancellation: {
      allowCancellation: false,
      cancellationDeadline: '',
      penaltyPercentage: '',
      requireReplacement: false,
      forceMajeureClause: false,
      paymentTerms: '',
      speakerConditions: []
    },
    eventCancellation: {
      allowCancellation: false,
      fullRefundDeadline: '',
      partialRefundDeadline: '',
      partialRefundPercentage: '',
      administrativeFee: '',
      refundMethod: '',
      processingTime: ''
    },
    eventPostponement: {
      allowPostponement: false,
      noticeRequired: '',
      maxPostponementDuration: '',
      ticketsValidForNewDate: false,
      offerRefundOnPostponement: false,
      refundPercentageOnPostponement: '',
      postponementConditions: []
    },
    generalTerms: ''
  },
  
  // Step 7: Final
  status: 'draft'
};

const initialState: EventFormState = {
  currentStep: 1,
  formData: initialFormData,
  isLoading: false,
  isError: false,
  error: null,
  isDraft: false,
  lastSaved: undefined
};

// Enhanced Event slice
const enhancedEventSlice = createSlice({
  name: 'enhancedEvent',
  initialState,
  reducers: {
    // Step navigation
    setCurrentStep: (state, action: PayloadAction<EventStep>) => {
      state.currentStep = action.payload;
    },
    
    nextStep: (state) => {
      if (state.currentStep < 7) {
        state.currentStep = (state.currentStep + 1) as EventStep;
      }
    },
    
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep = (state.currentStep - 1) as EventStep;
      }
    },
    
    // Form data updates
    updateFormData: (state, action: PayloadAction<Partial<EventFormData>>) => {
      state.formData = { ...state.formData, ...action.payload };
      state.isDraft = true;
      state.lastSaved = new Date().toISOString();
    },
    
    // Step-specific updates
    updateCoreDetails: (state, action: PayloadAction<Partial<Pick<EventFormData, 
      'eventName' | 'startDate' | 'endDate' | 'eventMode' | 'format' | 'location' | 'eventUrl'
    >>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    
    updateBrandingContent: (state, action: PayloadAction<Partial<Pick<EventFormData,
      'description' | 'bannerImage' | 'bannerImageUrl' | 'tags'
    >>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    
    updateTicketing: (state, action: PayloadAction<Partial<Pick<EventFormData, 'ticketTypes'>>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    
    updateSpeakers: (state, action: PayloadAction<Partial<Pick<EventFormData, 'speakers' | 'speakersArray'>>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    
    updateAddons: (state, action: PayloadAction<Partial<Pick<EventFormData, 'addons'>>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    
    updatePolicies: (state, action: PayloadAction<Partial<Pick<EventFormData, 'policies'>>>) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    
    updateStatus: (state, action: PayloadAction<'draft' | 'published' | 'cancelled'>) => {
      state.formData.status = action.payload;
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.isError = false;
        state.error = null;
      }
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
    
    // Draft management
    saveDraft: (state) => {
      state.isDraft = true;
      state.lastSaved = new Date().toISOString();
    },
    
    clearDraft: (state) => {
      state.isDraft = false;
      state.lastSaved = undefined;
    },
    
    // Reset form
    resetForm: (state) => {
      state.currentStep = 1;
      state.formData = initialFormData;
      state.isLoading = false;
      state.isError = false;
      state.error = null;
      state.isDraft = false;
      state.lastSaved = undefined;
    },
    
    // Load existing event for editing
    loadEventForEditing: (state, action: PayloadAction<EnhancedEvent>) => {
      const event = action.payload;
      state.formData = {
        eventName: event.eventName,
        startDate: event.startDate,
        endDate: event.endDate,
        eventMode: event.eventMode,
        format: event.format,
        location: event.location || '',
        eventUrl: event.eventUrl || '',
        description: event.description,
        bannerImage: null, // File object not available from API
        bannerImageUrl: event.bannerImage || '',
        image: null, // File object not available from API
        tags: event.tags,
        ticketTypes: event.ticketTypes,
        speakers: event.speakers,
        addons: event.addons,
        policies: event.policies,
        status: event.status
      };
      state.currentStep = 1;
      state.isDraft = event.status === 'draft';
    }
  },
});

// Enhanced Event API endpoints
export const enhancedEventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create new event
    createEvent: builder.mutation<
      EventCreationResponse,
      CreateEventRequest
    >({
      query: (eventData) => ({
        url: '/enhanced-events',
        method: 'POST',
        body: eventData,
      }),
      invalidatesTags: ['EnhancedEvent'],
    }),
    
    // Update existing event
    updateEvent: builder.mutation<
      ApiResponse<EnhancedEvent>,
      UpdateEventRequest
    >({
      query: ({ _id, ...eventData }) => ({
        url: `/enhanced-events/${_id}`,
        method: 'PUT',
        body: eventData,
      }),
      invalidatesTags: (result, error, { _id }) => [{ type: 'EnhancedEvent', id: _id }],
    }),
    
    // Get user's events
    getUserEvents: builder.query<
      EventListResponse,
      {
        page?: number;
        limit?: number;
        status?: 'draft' | 'published';
        sortBy?: 'createdAt' | 'startDate' | 'eventName';
        sortOrder?: 'asc' | 'desc';
      }
    >({
      query: (params = {}) => ({
        url: '/enhanced-events/user/me',
        params,
      }),
      providesTags: ['EnhancedEvent'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),
    
    // Get specific event by ID
    getEventById: builder.query<
      ApiResponse<EnhancedEvent>,
      string
    >({
      query: (eventId) => `/enhanced-events/${eventId}`,
      providesTags: (result, error, eventId) => [{ type: 'EnhancedEvent', id: eventId }],
      keepUnusedDataFor: 600, // Cache for 10 minutes
    }),
    
    // Get published events (public)
    getPublishedEvents: builder.query<
      EventListResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        tags?: string[];
        eventMode?: 'offline' | 'online' | 'hybrid';
        sortBy?: 'startDate' | 'eventName' | 'createdAt';
        sortOrder?: 'asc' | 'desc';
      }
    >({
      query: (params = {}) => ({
        url: '/enhanced-events/published',
        params,
      }),
      providesTags: ['EnhancedEvent'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),
    
    // Get upcoming events (public) - live tickets, future dates
    getUpcomingEvents: builder.query<
      EventListResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        eventMode?: 'offline' | 'online' | 'hybrid';
        sortBy?: 'startDate' | 'eventName' | 'createdAt';
        sortOrder?: 'asc' | 'desc';
      }
    >({
      query: (params = {}) => ({
        url: '/enhanced-events/upcoming',
        params,
      }),
      providesTags: ['EnhancedEvent'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Get promoted events (public) - featured on home page
    getPromotedEvents: builder.query<
      EventListResponse,
      {
        page?: number;
        limit?: number;
        search?: string;
        eventMode?: 'offline' | 'online' | 'hybrid';
        sortBy?: 'startDate' | 'eventName' | 'createdAt';
        sortOrder?: 'asc' | 'desc';
      }
    >({
      query: (params = {}) => ({
        url: '/enhanced-events/promoted',
        params,
      }),
      providesTags: ['EnhancedEvent'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),
    
    // Delete event
    deleteEvent: builder.mutation<
      ApiResponse<{ deleted: boolean }>,
      string
    >({
      query: (eventId) => ({
        url: `/enhanced-events/${eventId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, eventId) => [{ type: 'EnhancedEvent', id: eventId }],
    }),
    
    // Validate event
    validateEvent: builder.mutation<
      ApiResponse<{ isValid: boolean; errors: Record<string, string> }>,
      CreateEventRequest
    >({
      query: (eventData) => ({
        url: '/enhanced-events/validate',
        method: 'POST',
        body: eventData,
      }),
    }),
    
    // Upload banner image
    uploadBannerImage: builder.mutation<
      FileUploadResponse,
      FormData
    >({
      query: (formData) => ({
        url: '/enhanced-events/upload/banner',
        method: 'POST',
        body: formData,
      }),
    }),
    
    // Publish event
    publishEvent: builder.mutation<
      ApiResponse<EnhancedEvent>,
      string
    >({
      query: (eventId) => ({
        url: `/enhanced-events/${eventId}/publish`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, eventId) => [{ type: 'EnhancedEvent', id: eventId }],
    }),
    
    // Get event statistics
    getEventStats: builder.query<
      ApiResponse<{
        totalEvents: number;
        publishedEvents: number;
        draftEvents: number;
        totalRevenue: number;
        totalAttendees: number;
        upcomingEvents: number;
        pastEvents: number;
      }>,
      void
    >({
      query: () => '/enhanced-events/stats',
      providesTags: ['EnhancedEvent'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // ============================================================================
    // ENHANCED EVENT REGISTRATION ENDPOINTS
    // ============================================================================

    // Register for enhanced event
    registerForEnhancedEvent: builder.mutation<
      { success: boolean; message: string; data: unknown },
      { eventId: string; ticketTierId: string; registrant: unknown; additionalParticipants?: unknown[] }
    >({
      query: ({ eventId, ticketTierId, registrant, additionalParticipants = [] }) => ({
        url: `/enhanced-events/register/${eventId}/register`,
        method: 'POST',
        body: {
          ticketTierId,
          registrant,
          additionalParticipants
        },
      }),
      invalidatesTags: ['EnhancedEvent', 'User'],
    }),

    // Create payment for enhanced event registration
    createPaymentForEnhancedEvent: builder.mutation<
      { success: boolean; message: string; data: unknown },
      { registrationId: string; paymentMethodId: string }
    >({
      query: ({ registrationId, paymentMethodId }) => ({
        url: `/enhanced-events/register/registrations/${registrationId}/create-payment`,
        method: 'POST',
        body: { paymentMethodId },
      }),
    }),

    // Verify payment for enhanced event registration
    verifyEnhancedEventPayment: builder.mutation<
      { success: boolean; message: string; data: unknown },
      { registrationId: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
    >({
      query: ({ registrationId, razorpay_order_id, razorpay_payment_id, razorpay_signature }) => ({
        url: `/enhanced-events/register/registrations/${registrationId}/verify-payment`,
        method: 'POST',
        body: {
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature
        },
      }),
      invalidatesTags: ['EnhancedEvent', 'User'],
    }),

    // Get enhanced event registration summary
    getEnhancedEventRegistrationSummary: builder.query<
      { success: boolean; data: { summary: unknown } },
      string
    >({
      query: (registrationId) => ({
        url: `/enhanced-events/register/registrations/${registrationId}/summary`,
        method: 'GET',
      }),
    }),

    // Get user's enhanced event registrations
    getUserEnhancedEventRegistrations: builder.query<
      { success: boolean; data: { registrations: unknown[]; totalRegistrations: number } },
      void
    >({
      query: () => ({
        url: '/enhanced-events/register/user/registrations',
        method: 'GET',
      }),
      providesTags: ['EnhancedEvent'],
    }),

    // Get enhanced event participants (for organizers)
    getEventParticipants: builder.query<
      { success: boolean; data: { participants: unknown[]; totalParticipants: number; totalRegistrations: number } },
      string
    >({
      query: (eventId) => ({
        url: `/enhanced-events/register/${eventId}/participants`,
        method: 'GET',
      }),
      providesTags: (result, error, eventId) => [{ type: 'EnhancedEvent', id: eventId }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),
  }),
});

// Export actions
export const {
  setCurrentStep,
  nextStep,
  previousStep,
  updateFormData,
  updateCoreDetails,
  updateBrandingContent,
  updateTicketing,
  updateSpeakers,
  updateAddons,
  updatePolicies,
  updateStatus,
  setLoading,
  setError,
  clearError,
  saveDraft,
  clearDraft,
  resetForm,
  loadEventForEditing,
} = enhancedEventSlice.actions;

// Export API hooks
export const {
  useCreateEventMutation,
  useUpdateEventMutation,
  useGetUserEventsQuery,
  useGetEventByIdQuery,
  useGetPublishedEventsQuery,
  useGetUpcomingEventsQuery,
  useGetPromotedEventsQuery,
  useDeleteEventMutation,
  useValidateEventMutation,
  useUploadBannerImageMutation,
  usePublishEventMutation,
  useGetEventStatsQuery,
  // Enhanced Event Registration hooks
  useRegisterForEnhancedEventMutation,
  useCreatePaymentForEnhancedEventMutation,
  useVerifyEnhancedEventPaymentMutation,
  useGetEnhancedEventRegistrationSummaryQuery,
  useGetUserEnhancedEventRegistrationsQuery,
  useGetEventParticipantsQuery,
} = enhancedEventApi;

// Selectors
export const selectEventForm = (state: { enhancedEvent: EventFormState }) => state.enhancedEvent;
export const selectCurrentStep = (state: { enhancedEvent: EventFormState }) => state.enhancedEvent.currentStep;
export const selectFormData = (state: { enhancedEvent: EventFormState }) => state.enhancedEvent.formData;
export const selectEventLoading = (state: { enhancedEvent: EventFormState }) => state.enhancedEvent.isLoading;
export const selectEventError = (state: { enhancedEvent: EventFormState }) => state.enhancedEvent.error;
export const selectIsDraft = (state: { enhancedEvent: EventFormState }) => state.enhancedEvent.isDraft;
export const selectLastSaved = (state: { enhancedEvent: EventFormState }) => state.enhancedEvent.lastSaved;

// Validation helpers
export const validateStep1 = (formData: EventFormData): EventValidation => {
  const errors: Record<string, string> = {};
  
  if (!formData.eventName?.trim()) errors.eventName = 'Event name is required';
  if (!formData.startDate) errors.startDate = 'Start date is required';
  if (!formData.endDate) errors.endDate = 'End date is required';
  if (!formData.eventMode) errors.eventMode = 'Event mode is required';
  if (!formData.format?.trim()) errors.format = 'Format is required';
  
  // Validate date logic
  if (formData.startDate && formData.endDate) {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (startDate > endDate) {
      errors.endDate = 'End date must be on or after start date';
    }
  }
  
  // Validate location/URL based on event mode
  if (formData.eventMode === 'offline' && !formData.location?.trim()) {
    errors.location = 'Location is required for offline events';
  }
  if (formData.eventMode === 'online' && !formData.eventUrl?.trim()) {
    errors.eventUrl = 'Event URL is required for online events';
  }
  if (formData.eventMode === 'hybrid') {
    if (!formData.location?.trim()) errors.location = 'Location is required for hybrid events';
    if (!formData.eventUrl?.trim()) errors.eventUrl = 'Event URL is required for hybrid events';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateStep2 = (formData: EventFormData): EventValidation => {
  const errors: Record<string, string> = {};
  
  if (!formData.description?.trim()) {
    errors.description = 'Event description is required';
  }
  
  // Check if either image file is uploaded or bannerImageUrl is provided
  if (!formData.image && !formData.bannerImageUrl?.trim()) {
    errors.bannerImage = 'Banner image is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateStep3 = (formData: EventFormData): EventValidation => {
  const errors: Record<string, string> = {};
  
  if (!formData.ticketTypes || formData.ticketTypes.length === 0) {
    errors.ticketTypes = 'At least one ticket type is required';
  } else {
    formData.ticketTypes.forEach((ticket, index) => {
      if (!ticket.name?.trim()) {
        errors[`ticketTypes.${index}.name`] = 'Ticket name is required';
      }
      const price = typeof ticket.price === 'string' ? parseFloat(ticket.price) : ticket.price;
      const quantity = typeof ticket.quantity === 'string' ? parseInt(ticket.quantity) : ticket.quantity;
      
      if (!ticket.price || price <= 0) {
        errors[`ticketTypes.${index}.price`] = 'Valid price is required';
      }
      if (!ticket.quantity || quantity <= 0) {
        errors[`ticketTypes.${index}.quantity`] = 'Valid quantity is required';
      }
    });
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateStep4 = (formData: EventFormData): EventValidation => {
  const errors: Record<string, string> = {};
  
  const { manualSpeakers, platformSpeakers } = formData.speakers;
  
  if (manualSpeakers.length === 0 && platformSpeakers.length === 0) {
    errors.speakers = 'At least one speaker is required';
  }
  
  // Validate manual speakers
  manualSpeakers.forEach((speaker, index) => {
    if (!speaker.name?.trim()) {
      errors[`manualSpeakers.${index}.name`] = 'Speaker name is required';
    }
    if (!speaker.title?.trim()) {
      errors[`manualSpeakers.${index}.title`] = 'Speaker title is required';
    }
    if (!speaker.bio?.trim()) {
      errors[`manualSpeakers.${index}.bio`] = 'Speaker bio is required';
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateStep5 = (_formData: EventFormData): EventValidation => {
  // Step 5 (Addons) is optional, so it's always valid
  return {
    isValid: true,
    errors: {}
  };
};

export const validateStep6 = (formData: EventFormData): EventValidation => {
  const errors: Record<string, string> = {};
  
  // Validate policies
  if (!formData.policies) {
    errors.policies = 'Policies are required';
  } else {
    // Validate participant refund policy
    if (!formData.policies.participantRefund) {
      errors['policies.participantRefund'] = 'Participant refund policy is required';
    }
    
    // Validate speaker cancellation policy
    if (!formData.policies.speakerCancellation) {
      errors['policies.speakerCancellation'] = 'Speaker cancellation policy is required';
    }
    
    // Validate event cancellation policy
    if (!formData.policies.eventCancellation) {
      errors['policies.eventCancellation'] = 'Event cancellation policy is required';
    }
    
    // Validate event postponement policy
    if (!formData.policies.eventPostponement) {
      errors['policies.eventPostponement'] = 'Event postponement policy is required';
    }
    
    // Validate general terms
    if (!formData.policies.generalTerms || typeof formData.policies.generalTerms !== 'string' || !formData.policies.generalTerms.trim()) {
      errors['policies.generalTerms'] = 'General terms and conditions are required';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateStep7 = (formData: EventFormData): EventValidation => {
  const errors: Record<string, string> = {};
  
  if (!formData.status) {
    errors.status = 'Event status is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateAllSteps = (formData: EventFormData) => {
  return {
    step1: validateStep1(formData),
    step2: validateStep2(formData),
    step3: validateStep3(formData),
    step4: validateStep4(formData),
    step5: validateStep5(formData),
    step6: validateStep6(formData),
    step7: validateStep7(formData)
  };
};

// Export reducer
export default enhancedEventSlice.reducer;
