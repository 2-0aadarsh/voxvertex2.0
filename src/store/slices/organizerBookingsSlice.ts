import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';

// Types for organizer bookings
export interface Speaker {
  _id: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  expertise: string;
}

export interface EventDetails {
  name: string;
  type: string;
  location: string;
  expectedAttendees: number;
}

export interface CompensationAndArrangements {
  primaryCompensation: {
    speakerFeeAmount: number;
  };
}

export interface Booking {
  _id: string;
  bookingId: string;
  speaker: Speaker;
  eventDetails: EventDetails;
  compensationAndArrangements: CompensationAndArrangements;
  date: string;
  timeSlot: string;
  status: 'pending' | 'accepted' | 'declined' | 'negotiating' | 'cancelled' | 'completed';
  createdAt: string;
  timeAgo: string;
}

export interface OrganizerBookingsData {
  inProgress: Booking[];
  confirmed: Booking[];
  declined: Booking[];
}

export interface OrganizerBookingsStats {
  total: number;
  inProgress: number;
  confirmed: number;
  declined: number;
}

export interface OrganizerBookingsResponse {
  success: boolean;
  data: OrganizerBookingsData;
  stats: OrganizerBookingsStats;
}

export interface OrganizerBookingsState {
  bookings: OrganizerBookingsData | null;
  stats: OrganizerBookingsStats | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

// RTK Query API endpoints
export const organizerBookingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get organizer bookings grouped by status
    getOrganizerBookings: builder.query<OrganizerBookingsResponse, void>({
      query: () => ({
        url: '/book-speaker/organizer-bookings',
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['OrganizerBooking'],
      transformResponse: (response: OrganizerBookingsResponse) => response,
    }),
  }),
  overrideExisting: true, // Add this to prevent override errors
});

// Export hooks for use in components
export const {
  useGetOrganizerBookingsQuery,
} = organizerBookingsApi;

// Initial state
const initialState: OrganizerBookingsState = {
  bookings: null,
  stats: null,
  isLoading: false,
  error: null,
  lastFetched: null,
};

// Async thunk for fetching organizer bookings
export const fetchOrganizerBookings = createAsyncThunk(
  'organizerBookings/fetchOrganizerBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/book-speaker/organizer-bookings', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch organizer bookings');
      }

      const data: OrganizerBookingsResponse = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch organizer bookings');
    }
  }
);

// Slice
const organizerBookingsSlice = createSlice({
  name: 'organizerBookings',
  initialState,
  reducers: {
    // Clear bookings data
    clearOrganizerBookings: (state) => {
      state.bookings = null;
      state.stats = null;
      state.error = null;
      state.lastFetched = null;
    },

    // Update booking status locally (for optimistic updates)
    updateBookingStatusLocally: (state, action) => {
      const { bookingId, status } = action.payload;
      
      if (!state.bookings) return;

      // Find and move booking between arrays
      const allBookings = [
        ...state.bookings.inProgress,
        ...state.bookings.confirmed,
        ...state.bookings.declined,
      ];

      const booking = allBookings.find(b => b._id === bookingId);
      if (!booking) return;

      // Remove from current array
      state.bookings.inProgress = state.bookings.inProgress.filter(b => b._id !== bookingId);
      state.bookings.confirmed = state.bookings.confirmed.filter(b => b._id !== bookingId);
      state.bookings.declined = state.bookings.declined.filter(b => b._id !== bookingId);

      // Update booking status and add to appropriate array
      booking.status = status;
      
      switch (status) {
        case 'pending':
        case 'negotiating':
          state.bookings.inProgress.push(booking);
          break;
        case 'accepted':
          state.bookings.confirmed.push(booking);
          break;
        case 'declined':
        case 'cancelled':
          state.bookings.declined.push(booking);
          break;
      }

      // Update stats
      if (state.stats) {
        state.stats = {
          total: state.stats.total,
          inProgress: state.bookings.inProgress.length,
          confirmed: state.bookings.confirmed.length,
          declined: state.bookings.declined.length,
        };
      }
    },

    // Add new booking (for real-time updates)
    addNewBooking: (state, action) => {
      const newBooking = action.payload;
      
      if (!state.bookings) {
        state.bookings = {
          inProgress: [],
          confirmed: [],
          declined: [],
        };
      }

      // Add to appropriate array based on status
      switch (newBooking.status) {
        case 'pending':
        case 'negotiating':
          state.bookings.inProgress.push(newBooking);
          break;
        case 'accepted':
          state.bookings.confirmed.push(newBooking);
          break;
        case 'declined':
        case 'cancelled':
          state.bookings.declined.push(newBooking);
          break;
      }

      // Update stats
      if (state.stats) {
        state.stats.total += 1;
        state.stats.inProgress = state.bookings.inProgress.length;
        state.stats.confirmed = state.bookings.confirmed.length;
        state.stats.declined = state.bookings.declined.length;
      }
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch organizer bookings
      .addCase(fetchOrganizerBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrganizerBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload.data;
        state.stats = action.payload.stats;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchOrganizerBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  clearOrganizerBookings,
  updateBookingStatusLocally,
  addNewBooking,
  setLoading,
  setError,
} = organizerBookingsSlice.actions;

// Export reducer
export default organizerBookingsSlice.reducer;

// Selectors
export const selectOrganizerBookings = (state: { organizerBookings: OrganizerBookingsState }) => 
  state.organizerBookings.bookings;

export const selectOrganizerBookingsStats = (state: { organizerBookings: OrganizerBookingsState }) => 
  state.organizerBookings.stats;

export const selectOrganizerBookingsLoading = (state: { organizerBookings: OrganizerBookingsState }) => 
  state.organizerBookings.isLoading;

export const selectOrganizerBookingsError = (state: { organizerBookings: OrganizerBookingsState }) => 
  state.organizerBookings.error;

