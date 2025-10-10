// ============================================================================
// AUTH SLICE - Authentication State Management
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import type { 
  AuthState, 
  User, 
  LoginRequest, 
  ApiResponse 
} from '../types';

// Initial state
const initialState: AuthState = {
  id: null,
  user: null,
  isAuthenticated: false,
  token: null,
  role: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.isError = false;
      state.error = null;
    },
    
    // Set authentication success
    setAuthSuccess: (state, action: PayloadAction<{ user: User; token?: string }>) => {
      console.log('🔵 Setting auth success with user:', action.payload.user);
      state.id = action.payload.user._id;
      state.user = action.payload.user;
      state.role = action.payload.user.role; // Extract and store role separately
      state.isAuthenticated = true;
      if (action.payload.token) {
        state.token = action.payload.token;
      }
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.error = null;
      
      // Note: userRole cookie is set by backend, not frontend to avoid hydration issues
      // The role is stored in Redux state for client-side access
      
      console.log('🟢 Auth state after update:', { 
        id: state.id,
        user: state.user, 
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        token: state.token ? '✓ Present' : '✗ Missing'
      });
    },
    
    // Set authentication error
    setAuthError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = true;
      state.error = action.payload;
    },
    
    // Set token
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    
    // Update user profile
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update role if it's being updated
        if (action.payload.role) {
          state.role = action.payload.role;
        }
      }
    },
    
    // Logout
    logout: (state) => {
      state.id = null;
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.token = null;
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.error = null;
      
      // Note: Cookies are cleared by backend on logout
      // Frontend only clears Redux state to avoid hydration issues
    },
    
    // Clear error
    clearError: (state) => {
      state.isError = false;
      state.error = null;
    },
    
    // Reset auth state
    resetAuth: () => initialState,
  },
});

// Auth API endpoints
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Register/Signup
    register: builder.mutation<
      { success: boolean; message: string; user: User; redirectUrl: string; tokens: { accessToken: string } },
      { firstName: string; lastName: string; email: string; password: string; phone?: string; role?: string; industry?: string; activities?: string[] }
    >({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      // Handle the response and update the auth state (same as login)
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('🔐 Register response:', data);
          console.log('👤 User from register:', data.user);
          console.log('👑 User role from register:', data.user?.role);
          console.log('🔑 Response structure:', Object.keys(data));
          
          // Update auth state with user and token
          if (data.success && data.user) {
            // Get token from cookies if not in response
            const getTokenFromCookies = () => {
              if (typeof document === 'undefined') return null;
              const cookies = document.cookie.split(';');
              const accessTokenCookie = cookies.find(cookie => 
                cookie.trim().startsWith('accessToken=')
              );
              return accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
            };

            const tokenFromResponse = data.tokens?.accessToken;
            const tokenFromCookies = getTokenFromCookies();
            const finalToken = tokenFromResponse || tokenFromCookies;

            dispatch(setAuthSuccess({ 
              user: data.user, // Direct user object in response
              token: finalToken || undefined
            }));
            console.log('✅ Auth state updated with user from register:', data.user);
            console.log('✅ User role:', data.user.role);
            console.log('✅ Token stored in Redux:', finalToken ? 'Yes' : 'No');
          }
        } catch (error) {
          console.error('❌ Register error in onQueryStarted:', error);
          dispatch(setAuthError(error instanceof Error ? error.message : 'Registration failed'));
        }
      },
      invalidatesTags: ['User'],
    }),

    // Login
    login: builder.mutation<
      { success: boolean; message: string; user: User; redirectUrl: string; tokens: { accessToken: string } },
      LoginRequest
    >({
      query: (credentials) => ({
        url: '/auth/login-jwt',
        method: 'POST',
        body: credentials,
      }),
      // Handle the response and update the auth state
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('🔐 Login response:', data);
          console.log('👤 User from login:', data.user);
          console.log('👑 User role from login:', data.user?.role);
          console.log('🔑 Response structure:', Object.keys(data));
          
          // Update auth state with user and token
          if (data.success && data.user) {
            // Get token from cookies if not in response
            const getTokenFromCookies = () => {
              if (typeof document === 'undefined') return null;
              const cookies = document.cookie.split(';');
              const accessTokenCookie = cookies.find(cookie => 
                cookie.trim().startsWith('accessToken=')
              );
              return accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
            };

            const tokenFromResponse = data.tokens?.accessToken;
            const tokenFromCookies = getTokenFromCookies();
            const finalToken = tokenFromResponse || tokenFromCookies;

            dispatch(setAuthSuccess({ 
              user: data.user, // Direct user object in response
              token: finalToken || undefined
            }));
            console.log('✅ Auth state updated with user:', data.user);
            console.log('✅ User role:', data.user.role);
            console.log('✅ Token stored in Redux:', finalToken ? 'Yes' : 'No');
          }
        } catch (error) {
          console.error('❌ Login error in onQueryStarted:', error);
          dispatch(setAuthError(error instanceof Error ? error.message : 'Login failed'));
        }
      },
      invalidatesTags: ['User'],
    }),
    
    // Logout
    logout: builder.mutation<ApiResponse, void>({
      query: () => ({
        url: '/auth/logout-jwt',
        method: 'POST',
      }),
      // Handle the response and clear the auth state
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          console.log('🚪 Logout mutation started...');
          const { data } = await queryFulfilled;
          console.log('✅ Logout API response:', data);
          
          // Clear auth state
          dispatch(logout());
          console.log('✅ User logged out, auth state cleared');
        } catch (error) {
          console.error('❌ Logout error:', error);
          // Even if API call fails, still clear the local state
          dispatch(logout());
        }
      },
      invalidatesTags: ['User'],
    }),
    
    // Validate token and get user info
    validateToken: builder.query<
      { success: boolean; message: string; user: User; redirectUrl: string; tokenRefreshed: boolean; tokens?: { accessToken: string } },
      void
    >({
      query: () => '/auth/validate',
      // Handle the response and update the auth state
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('🔑 Token validation response:', data);
          console.log('👤 User from token validation:', data.user);
          console.log('👑 User role from token:', data.user?.role);
          
          // Update auth state with user from token
          if (data.success && data.user) {
            // Get token from cookies if not in response
            const getTokenFromCookies = () => {
              if (typeof document === 'undefined') return null;
              const cookies = document.cookie.split(';');
              const accessTokenCookie = cookies.find(cookie => 
                cookie.trim().startsWith('accessToken=')
              );
              return accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
            };

            const tokenFromResponse = data.tokenRefreshed && data.tokens ? data.tokens.accessToken : null;
            const tokenFromCookies = getTokenFromCookies();
            const finalToken = tokenFromResponse || tokenFromCookies;

            dispatch(setAuthSuccess({ 
              user: data.user,
              token: finalToken || undefined
            }));
            console.log('✅ Auth state updated from token validation with role:', data.user.role);
            console.log('✅ Token stored in Redux:', finalToken ? 'Yes' : 'No');
          }
        } catch (error) {
          console.error('❌ Token validation error:', error);
          // If token validation fails, clear auth state
          dispatch(logout());
        }
      },
      providesTags: ['User'],
    }),
    
    // Refresh token
    refreshToken: builder.mutation<
      ApiResponse<{ tokens: { accessToken: string } }>,
      void
    >({
      query: () => ({
        url: '/auth/refresh-token',
        method: 'POST',
      }),
    }),
    
    // Get current user
    getCurrentUser: builder.query<{ success: boolean; message: string; user: User }, void>({
      query: () => '/auth/me',
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('👤 getCurrentUser response:', data);
          
          // Update auth state with user
          if (data.success && data.user) {
            // Get token from cookies
            const getTokenFromCookies = () => {
              if (typeof document === 'undefined') return null;
              const cookies = document.cookie.split(';');
              const accessTokenCookie = cookies.find(cookie => 
                cookie.trim().startsWith('accessToken=')
              );
              return accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
            };

            const tokenFromCookies = getTokenFromCookies();

            dispatch(setAuthSuccess({ 
              user: data.user,
              token: tokenFromCookies || undefined
            }));
            console.log('✅ Auth state updated from getCurrentUser with role:', data.user.role);
            console.log('✅ Token stored in Redux:', tokenFromCookies ? 'Yes' : 'No');
          }
        } catch (error) {
          console.error('❌ getCurrentUser error:', error);
        }
      },
      providesTags: ['User'],
    }),

    // Get subscription status for user
    getSubscriptionStatus: builder.query<
      { 
        success: boolean; 
        subscription: {
          plan: any;
          status: string;
          isActive: boolean;
          isTrialActive: boolean;
          trialDaysRemaining: number;
          trialEndDate: string;
          endDate: string;
          nextBillingDate: string;
          autoRenew: boolean;
          paymentMethod: string;
        } | null;
        message: string;
      },
      string
    >({
      query: (userId) => ({
        url: `/subscriptions/status/${userId}`,
        method: 'GET',
      }),
      providesTags: ['Subscription'],
    }),
    
    // Update user profile
    updateCurrentUser: builder.mutation<
      ApiResponse<User>,
      Partial<User>
    >({
      query: (userData) => ({
        url: '/auth/me',
        method: 'PATCH',
        body: userData,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),
  }),
});

// Export actions
export const {
  setLoading,
  setAuthSuccess,
  setAuthError,
  setToken,
  updateUser,
  logout,
  clearError,
  resetAuth,
} = authSlice.actions;

// Export API hooks
export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useValidateTokenQuery,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useGetSubscriptionStatusQuery,
  useUpdateCurrentUserMutation,
} = authApi;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUserId = (state: { auth: AuthState }) => state.auth.id;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.role;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

// Export reducer
export default authSlice.reducer;