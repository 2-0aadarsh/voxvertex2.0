import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'connections';
  showContactInformation: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  showSocialLinks: boolean;
  showExperience: boolean;
  showEducation: boolean;
  showAwards: boolean;
}

export interface PublicProfile {
  _id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role: string;
  email?: string;
  mobileNo?: string;
  location?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
    portfolio?: string;
  };
  bio?: string;
  professionalTitle?: string;
  areaOfExpertise?: string[];
  yearsOfExperience?: number;
}

export const privacyApi = createApi({
  reducerPath: 'privacyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://voxvertex20-production.up.railway.app/api/privacy',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: ['PrivacySettings', 'PublicProfile'],
  endpoints: (builder) => ({
    getPrivacySettings: builder.query<PrivacySettings, void>({
      query: () => '/settings',
      providesTags: ['PrivacySettings'],
    }),
    updatePrivacySettings: builder.mutation<
      { success: boolean; message: string; data: PrivacySettings },
      Partial<PrivacySettings>
    >({
      query: (settings) => ({
        url: '/settings',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['PrivacySettings'],
    }),
    getPublicProfile: builder.query<PublicProfile, string>({
      query: (userId) => `/public-profile/${userId}`,
      providesTags: ['PublicProfile'],
    }),
  }),
});

export const {
  useGetPrivacySettingsQuery,
  useUpdatePrivacySettingsMutation,
  useGetPublicProfileQuery,
} = privacyApi;
