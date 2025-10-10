// src/store/api/speakerBookingsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types for speaker bookings
export interface Organizer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
  companyName?: string;
}

export interface EventDetails {
  eventName: string;
  eventType: string;
  location: string;
  attendees: number;
}

export interface CompensationAndArrangements {
  primaryCompensation: {
    speakerFeeAmount: number;
  };
}

export interface SpeakerBooking {
  _id: string;
  bookingId: string;
  organizer: Organizer;
  eventName: string;
  eventType: string;
  location: string;
  date: string;
  timeSlot: string;
  status: 'pending' | 'accepted' | 'declined';
  compensationAndArrangements: CompensationAndArrangements;
  specialRequests?: string;
  personalMessage?: string;
  createdAt: string;
  acceptedAt?: string;
  declinedAt?: string;
  conversationId: string;
}

export interface SpeakerBookingsData {
  pending: SpeakerBooking[];
  accepted: SpeakerBooking[];
  declined: SpeakerBooking[];
}

export interface SpeakerBookingsResponse {
  success: boolean;
  data: {
    bookings: SpeakerBookingsData;
    counts: {
      pending: number;
      accepted: number;
      declined: number;
      total: number;
    };
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  };
}

export const speakerBookingsApi = createApi({
  reducerPath: 'speakerBookingsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3001/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: ['SpeakerBooking'],
  endpoints: (builder) => ({
    // Get speaker's bookings grouped by status
    getSpeakerBookings: builder.query<SpeakerBookingsResponse, { status?: string; page?: number; limit?: number }>({
      query: ({ status, page = 1, limit = 10 } = {}) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        return `/book-speaker/speaker-bookings?${params.toString()}`;
      },
      providesTags: ['SpeakerBooking'],
    }),
    
    // Accept a booking
    acceptBooking: builder.mutation<{ success: boolean; message: string; booking: any }, string>({
      query: (bookingId) => ({
        url: `/book-speaker/${bookingId}/accept`,
        method: 'PUT',
      }),
      invalidatesTags: ['SpeakerBooking'],
    }),
    
    // Decline a booking
    declineBooking: builder.mutation<{ success: boolean; message: string; booking: any }, string>({
      query: (bookingId) => ({
        url: `/book-speaker/${bookingId}/decline`,
        method: 'PUT',
      }),
      invalidatesTags: ['SpeakerBooking'],
    }),
  }),
});

export const {
  useGetSpeakerBookingsQuery,
  useAcceptBookingMutation,
  useDeclineBookingMutation,
} = speakerBookingsApi;
