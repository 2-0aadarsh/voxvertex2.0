// ============================================================================
// NEGOTIATION SLICE - Real-time Negotiation Management
// ============================================================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';

// Types for negotiation
export interface Negotiation {
  _id: string;
  conversation: string;
  organizer: string | User;
  speaker: string | User;
  event?: string;
  topic: string;
  currentProposal: {
    amount: number;
    currency: string;
    proposedBy: string;
    proposedAt: string;
    message?: string;
    status: 'pending' | 'accepted' | 'declined' | 'countered';
  };
  proposals: Array<{
    amount: number;
    currency: string;
    proposedBy: string;
    proposedAt: string;
    message?: string;
    status: 'pending' | 'accepted' | 'declined' | 'countered';
    respondedAt?: string;
    responseMessage?: string;
  }>;
  status: 'active' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  finalAgreement?: {
    amount: number;
    currency: string;
    acceptedAt: string;
    acceptedBy: string;
    terms?: string;
  };
  settings: {
    autoExpire: boolean;
    expireAfter: number;
    allowCounterProposals: boolean;
    maxProposals: number;
  };
  metadata: {
    tags: string[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'speaker' | 'organizer' | 'participant';
  profileImageUrl?: string;
}

interface NegotiationState {
  // Current negotiation
  activeNegotiation: Negotiation | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
  
  // Negotiation history
  negotiations: Negotiation[];
  
  // UI state
  showNegotiationModal: boolean;
  isSubmittingProposal: boolean;
}

const initialState: NegotiationState = {
  activeNegotiation: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
  negotiations: [],
  showNegotiationModal: false,
  isSubmittingProposal: false,
};

// Negotiation API endpoints using RTK Query
export const negotiationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create negotiation
    createNegotiation: builder.mutation<{
      success: boolean;
      message: string;
      negotiation: Negotiation;
    }, {
      conversationId: string;
      amount: number;
      currency?: string;
      topic?: string;
      message?: string;
      eventId?: string;
    }>({
      query: ({ conversationId, ...body }) => ({
        url: `/negotiations/conversations/${conversationId}/negotiations`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Negotiation', id: conversationId },
        'Conversation',
        'Message'
      ],
    }),

    // Get negotiation by conversation
    getNegotiationByConversation: builder.query<{
      success: boolean;
      message: string;
      negotiation: Negotiation;
    }, string>({
      query: (conversationId) => `/negotiations/conversations/${conversationId}/negotiations`,
      providesTags: (result, error, conversationId) => [
        { type: 'Negotiation', id: conversationId }
      ],
    }),

    // Propose amount (counter-proposal)
    proposeAmount: builder.mutation<{
      success: boolean;
      message: string;
      negotiation: Negotiation;
    }, {
      negotiationId: string;
      amount: number;
      currency?: string;
      message?: string;
    }>({
      query: ({ negotiationId, ...body }) => ({
        url: `/negotiations/${negotiationId}/propose`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { negotiationId }) => [
        { type: 'Negotiation', id: negotiationId },
        'Conversation',
        'Message'
      ],
    }),

    // Accept proposal
    acceptProposal: builder.mutation<{
      success: boolean;
      message: string;
      negotiation: Negotiation;
    }, {
      negotiationId: string;
      message?: string;
    }>({
      query: ({ negotiationId, ...body }) => ({
        url: `/negotiations/${negotiationId}/accept`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { negotiationId }) => [
        { type: 'Negotiation', id: negotiationId },
        'Conversation',
        'Message',
        'Booking'
      ],
    }),

    // Decline proposal
    declineProposal: builder.mutation<{
      success: boolean;
      message: string;
      negotiation: Negotiation;
    }, {
      negotiationId: string;
      message?: string;
    }>({
      query: ({ negotiationId, ...body }) => ({
        url: `/negotiations/${negotiationId}/decline`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { negotiationId }) => [
        { type: 'Negotiation', id: negotiationId },
        'Conversation',
        'Message'
      ],
    }),

    // Cancel negotiation
    cancelNegotiation: builder.mutation<{
      success: boolean;
      message: string;
      negotiation: Negotiation;
    }, {
      negotiationId: string;
      reason?: string;
    }>({
      query: ({ negotiationId, ...body }) => ({
        url: `/negotiations/${negotiationId}/cancel`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { negotiationId }) => [
        { type: 'Negotiation', id: negotiationId },
        'Conversation',
        'Message'
      ],
    }),

    // Get user negotiations
    getUserNegotiations: builder.query<{
      success: boolean;
      message: string;
      negotiations: Negotiation[];
      pagination: {
        limit: number;
        skip: number;
        total: number;
      };
    }, { status?: string; limit?: number; skip?: number }>({
      query: (params = {}) => ({
        url: '/negotiations',
        params,
      }),
      providesTags: ['Negotiation'],
    }),

    // Get negotiation stats
    getNegotiationStats: builder.query<{
      success: boolean;
      message: string;
      stats: any;
    }, void>({
      query: () => '/negotiations/stats',
      providesTags: ['Negotiation'],
    }),
  }),
});

// Export API hooks
export const {
  useCreateNegotiationMutation,
  useGetNegotiationByConversationQuery,
  useProposeAmountMutation,
  useAcceptProposalMutation,
  useDeclineProposalMutation,
  useCancelNegotiationMutation,
  useGetUserNegotiationsQuery,
  useGetNegotiationStatsQuery,
} = negotiationApi;

// Async thunks
export const createNegotiation = createAsyncThunk(
  'negotiation/createNegotiation',
  async (params: {
    conversationId: string;
    amount: number;
    currency?: string;
    topic?: string;
    message?: string;
    eventId?: string;
  }, { dispatch }) => {
    const result = await dispatch(negotiationApi.endpoints.createNegotiation.initiate(params));
    if (result.error) {
      throw new Error('Failed to create negotiation');
    }
    return result.data;
  }
);

export const proposeAmount = createAsyncThunk(
  'negotiation/proposeAmount',
  async (params: {
    negotiationId: string;
    amount: number;
    currency?: string;
    message?: string;
  }, { dispatch }) => {
    const result = await dispatch(negotiationApi.endpoints.proposeAmount.initiate(params));
    if (result.error) {
      throw new Error('Failed to propose amount');
    }
    return result.data;
  }
);

export const acceptProposal = createAsyncThunk(
  'negotiation/acceptProposal',
  async (params: {
    negotiationId: string;
    message?: string;
  }, { dispatch }) => {
    const result = await dispatch(negotiationApi.endpoints.acceptProposal.initiate(params));
    if (result.error) {
      throw new Error('Failed to accept proposal');
    }
    return result.data;
  }
);

export const declineProposal = createAsyncThunk(
  'negotiation/declineProposal',
  async (params: {
    negotiationId: string;
    message?: string;
  }, { dispatch }) => {
    const result = await dispatch(negotiationApi.endpoints.declineProposal.initiate(params));
    if (result.error) {
      throw new Error('Failed to decline proposal');
    }
    return result.data;
  }
);

// Negotiation slice
const negotiationSlice = createSlice({
  name: 'negotiation',
  initialState,
  reducers: {
    // UI state management
    setShowNegotiationModal: (state, action: PayloadAction<boolean>) => {
      state.showNegotiationModal = action.payload;
    },
    
    setActiveNegotiation: (state, action: PayloadAction<Negotiation | null>) => {
      state.activeNegotiation = action.payload;
    },
    
    // Update negotiation from real-time events
    updateNegotiation: (state, action: PayloadAction<Negotiation>) => {
      const negotiation = action.payload;
      
      // Update active negotiation if it matches
      if (state.activeNegotiation?._id === negotiation._id) {
        state.activeNegotiation = negotiation;
      }
      
      // Update in negotiations array
      const existingIndex = state.negotiations.findIndex(n => n._id === negotiation._id);
      if (existingIndex >= 0) {
        state.negotiations[existingIndex] = negotiation;
      } else {
        state.negotiations.unshift(negotiation);
      }
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
    
    // Reset state
    resetNegotiation: () => initialState,
  },
  extraReducers: (builder) => {
    // Create negotiation
    builder
      .addCase(createNegotiation.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(createNegotiation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.activeNegotiation = action.payload.negotiation;
        state.negotiations.unshift(action.payload.negotiation);
      })
      .addCase(createNegotiation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.error = action.error.message || 'Failed to create negotiation';
      });
    
    // Propose amount
    builder
      .addCase(proposeAmount.pending, (state) => {
        state.isSubmittingProposal = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(proposeAmount.fulfilled, (state, action) => {
        state.isSubmittingProposal = false;
        state.isSuccess = true;
        state.activeNegotiation = action.payload.negotiation;
        
        // Update in negotiations array
        const index = state.negotiations.findIndex(n => n._id === action.payload.negotiation._id);
        if (index >= 0) {
          state.negotiations[index] = action.payload.negotiation;
        }
      })
      .addCase(proposeAmount.rejected, (state, action) => {
        state.isSubmittingProposal = false;
        state.isError = true;
        state.error = action.error.message || 'Failed to propose amount';
      });
    
    // Accept proposal
    builder
      .addCase(acceptProposal.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.activeNegotiation = action.payload.negotiation;
        
        // Update in negotiations array
        const index = state.negotiations.findIndex(n => n._id === action.payload.negotiation._id);
        if (index >= 0) {
          state.negotiations[index] = action.payload.negotiation;
        }
      });
    
    // Decline proposal
    builder
      .addCase(declineProposal.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.activeNegotiation = action.payload.negotiation;
        
        // Update in negotiations array
        const index = state.negotiations.findIndex(n => n._id === action.payload.negotiation._id);
        if (index >= 0) {
          state.negotiations[index] = action.payload.negotiation;
        }
      });
  },
});

// Export actions
export const {
  setShowNegotiationModal,
  setActiveNegotiation,
  updateNegotiation,
  setLoading,
  setSuccess,
  setError,
  clearError,
  resetNegotiation,
} = negotiationSlice.actions;

// Export reducer
export default negotiationSlice.reducer;

// Selectors
export const selectNegotiationState = (state: { negotiation: NegotiationState }) => state.negotiation;
export const selectActiveNegotiation = (state: { negotiation: NegotiationState }) => state.negotiation.activeNegotiation;
export const selectNegotiations = (state: { negotiation: NegotiationState }) => state.negotiation.negotiations;
export const selectNegotiationLoading = (state: { negotiation: NegotiationState }) => state.negotiation.isLoading;
export const selectNegotiationError = (state: { negotiation: NegotiationState }) => state.negotiation.error;
export const selectShowNegotiationModal = (state: { negotiation: NegotiationState }) => state.negotiation.showNegotiationModal;
export const selectIsSubmittingProposal = (state: { negotiation: NegotiationState }) => state.negotiation.isSubmittingProposal;
