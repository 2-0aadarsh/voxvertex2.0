// src/store/api/disputeApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Dispute } from '../../app/dispute/types/disputeTypes';

export const disputeApi = createApi({
  reducerPath: 'disputeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3001/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
     credentials: 'include',
  }),
  tagTypes: ['Dispute', 'Events', 'Participants'],
  endpoints: (builder) => ({
    // Disputes endpoints
    getDisputes: builder.query<{ disputes: Dispute[]; pagination: any }, { status?: string; stage?: string; page?: number }>({
      query: ({ status, stage, page = 1 }) => {
        let params = new URLSearchParams();
        if (status) params.append('status', status);
        if (stage) params.append('stage', stage);
        params.append('page', page.toString());
        return `/disputes?${params.toString()}`;

      },
      providesTags: ['Dispute'],
    }),
    getDisputeById: builder.query<Dispute, string>({
      query: (id) => `/disputes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Dispute', id }],
    }),
    createDispute: builder.mutation<any, any>({
    // Dispute, Partial<Dispute>>({
      query: (body) => ({
        url: '/disputes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dispute'],
    }),
    addMessage: builder.mutation<Dispute, { disputeId: string; content: string }>({
      query: ({ disputeId, content }) => ({
        url: `/${disputeId}/messages`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { disputeId }) => [{ type: 'Dispute', id: disputeId }],
    }),
    

    // Events endpoints (added here too)
    getEvents: builder.query<{ data: { upcoming: any[]; past: any[] } }, void>({
      query: () => '/events/',
      providesTags: ['Events'],
    }),
    getEventById: builder.query<any, string>({
      query: (id) => `/events/${id}`, // <-- Backend should have event details by ID
      providesTags: (result, error, id) => [{ type: 'Events', id }],
    }),
    getParticipantsByEventId: builder.query<{ participants: any[] }, string>({
      query: (eventId) => `/registrations/event/${eventId}/participants`,
      providesTags: (result, error, id) => [{ type: 'Participants', id }],
    }),
    
    // Other dispute API endpoints can also be defined here similarly
  }),
});


export const {
  useGetDisputesQuery,
  useGetDisputeByIdQuery,
  useCreateDisputeMutation,
  useAddMessageMutation,
  useGetEventsQuery,
   useGetEventByIdQuery,
  useGetParticipantsByEventIdQuery,
} = disputeApi;