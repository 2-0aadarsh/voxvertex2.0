// ============================================================================
// SUBSCRIPTION SLICE - Subscription State Management
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';

// Types
interface SubscriptionPlan {
  _id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingCycle: string;
  billingPeriod: string;
  trialDays: number;
  features: string[];
  originalPrice?: number;
  discountPercentage?: number;
  discountText?: string;
  isPopular: boolean;
  hasDiscount?: boolean;
  savingsAmount?: number;
  maxEvents?: number | null;
  maxSpeakers?: number | null;
}

interface SubscriptionStatus {
  plan: SubscriptionPlan | null;
  status: 'trial' | 'active' | 'cancelled' | 'expired';
  isActive: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  trialEndDate: string | null;
  endDate: string | null;
  nextBillingDate: string | null;
  autoRenew: boolean;
  paymentMethod: string;
}

interface SubscriptionState {
  // Plans
  plans: SubscriptionPlan[];
  selectedPlan: SubscriptionPlan | null;
  isYearly: boolean;
  
  // User subscription status
  subscription: SubscriptionStatus | null;
  
  // UI State
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  
  // Modal states
  showSignupModal: boolean;
  showLoginModal: boolean;
  showCompleteSubscriptionModal: boolean;
  showWelcomeModal: boolean;
  
  // Form data
  userFormData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  } | null;
  
  loginFormData: {
    email: string;
    password: string;
  } | null;
}

// Initial state
const initialState: SubscriptionState = {
  plans: [],
  selectedPlan: null,
  isYearly: false,
  subscription: null,
  isLoading: false,
  isError: false,
  error: null,
  showSignupModal: false,
  showLoginModal: false,
  showCompleteSubscriptionModal: false,
  showWelcomeModal: false,
  userFormData: null,
  loginFormData: null,
};

// Subscription slice
const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    // Plan management
    setPlans: (state, action: PayloadAction<SubscriptionPlan[]>) => {
      state.plans = action.payload;
    },
    
    setSelectedPlan: (state, action: PayloadAction<SubscriptionPlan | null>) => {
      state.selectedPlan = action.payload;
    },
    
    setIsYearly: (state, action: PayloadAction<boolean>) => {
      state.isYearly = action.payload;
    },
    
    // Subscription status
    setSubscriptionStatus: (state, action: PayloadAction<SubscriptionStatus | null>) => {
      state.subscription = action.payload;
    },
    
    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.isError = action.payload !== null;
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.isError = false;
      state.error = null;
    },
    
    // Modal controls
    showSignupModal: (state) => {
      state.showSignupModal = true;
      state.showLoginModal = false;
      state.showCompleteSubscriptionModal = false;
      state.showWelcomeModal = false;
    },
    
    showLoginModal: (state) => {
      state.showLoginModal = true;
      state.showSignupModal = false;
      state.showCompleteSubscriptionModal = false;
      state.showWelcomeModal = false;
    },
    
    showCompleteSubscriptionModal: (state) => {
      state.showCompleteSubscriptionModal = true;
      state.showSignupModal = false;
      state.showLoginModal = false;
      state.showWelcomeModal = false;
    },
    
    showWelcomeModal: (state) => {
      state.showWelcomeModal = true;
      state.showSignupModal = false;
      state.showLoginModal = false;
      state.showCompleteSubscriptionModal = false;
    },
    
    hideAllModals: (state) => {
      state.showSignupModal = false;
      state.showLoginModal = false;
      state.showCompleteSubscriptionModal = false;
      state.showWelcomeModal = false;
    },
    
    // Transition from subscription modal to welcome modal
    transitionToWelcome: (state) => {
      state.showSignupModal = false;
      state.showLoginModal = false;
      state.showCompleteSubscriptionModal = false;
      state.showWelcomeModal = true;
    },
    
    // Form data
    setUserFormData: (state, action: PayloadAction<SubscriptionState['userFormData']>) => {
      state.userFormData = action.payload;
    },
    
    setLoginFormData: (state, action: PayloadAction<SubscriptionState['loginFormData']>) => {
      state.loginFormData = action.payload;
    },
    
    // Reset subscription state
    resetSubscription: () => initialState,
  },
});

// Subscription API endpoints
export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all subscription plans
    getSubscriptionPlans: builder.query<{ success: boolean; data: SubscriptionPlan[] }, void>({
      query: () => '/subscription-plans',
      providesTags: ['Subscription'],
    }),
    
    // Start trial subscription
    startTrialSubscription: builder.mutation<
      { success: boolean; message: string; subscription: any; trialEndDate: string; daysRemaining: number; autoPayEnabled: boolean; nextBillingDate: string },
      { userId: string; planId: string; paymentDetails?: any }
    >({
      query: (data) => ({
        url: '/subscriptions/start-trial',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscription', 'User'],
    }),
    
    // Create subscription payment order
    createSubscriptionPaymentOrder: builder.mutation<
      { success: boolean; message: string; order: any; transactionId: string; keyId: string },
      { userId: string; planId: string; paymentMethod: string }
    >({
      query: (data) => ({
        url: '/subscriptions/payment/create-order',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Verify subscription payment
    verifySubscriptionPayment: builder.mutation<
      { success: boolean; message: string; subscription: any; transaction: any },
      { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; transactionId: string }
    >({
      query: (data) => ({
        url: '/subscriptions/payment/verify',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscription', 'User'],
    }),
  }),
});

// Export actions
export const {
  setPlans,
  setSelectedPlan,
  setIsYearly,
  setSubscriptionStatus,
  setLoading,
  setError,
  clearError,
  showSignupModal,
  showLoginModal,
  showCompleteSubscriptionModal,
  showWelcomeModal,
  hideAllModals,
  transitionToWelcome,
  setUserFormData,
  setLoginFormData,
  resetSubscription,
} = subscriptionSlice.actions;

// Export API hooks
export const {
  useGetSubscriptionPlansQuery,
  useStartTrialSubscriptionMutation,
  useCreateSubscriptionPaymentOrderMutation,
  useVerifySubscriptionPaymentMutation,
  useGetSubscriptionStatusQuery,
  useCancelSubscriptionMutation,
} = subscriptionApi;

// Selectors
export const selectSubscriptionState = (state: { subscription: SubscriptionState }) => state.subscription;
export const selectPlans = (state: { subscription: SubscriptionState }) => state.subscription.plans;
export const selectSelectedPlanFromRedux = (state: { subscription: SubscriptionState }) => state.subscription.selectedPlan;
export const selectIsYearly = (state: { subscription: SubscriptionState }) => state.subscription.isYearly;
export const selectSubscription = (state: { subscription: SubscriptionState }) => state.subscription.subscription;
export const selectIsLoading = (state: { subscription: SubscriptionState }) => state.subscription.isLoading;
export const selectError = (state: { subscription: SubscriptionState }) => state.subscription.error;
export const selectModalStates = (state: { subscription: SubscriptionState }) => ({
  showSignupModal: state.subscription.showSignupModal,
  showLoginModal: state.subscription.showLoginModal,
  showCompleteSubscriptionModal: state.subscription.showCompleteSubscriptionModal,
  showWelcomeModal: state.subscription.showWelcomeModal,
});

// Export reducer
export default subscriptionSlice.reducer;
