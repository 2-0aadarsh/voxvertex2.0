import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const accountApi = createApi({
  reducerPath: 'accountApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://voxvertex20-production.up.railway.app/api/auth',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: ['Account'],
  endpoints: (builder) => ({
    deleteAccount: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/account',
        method: 'DELETE',
      }),
      invalidatesTags: ['Account'],
    }),
  }),
});

export const { useDeleteAccountMutation } = accountApi;
