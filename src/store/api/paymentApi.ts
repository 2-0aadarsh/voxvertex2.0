import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define types
export interface Transaction {
  _id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
}

// export interface Balance {
//   totalBalance: number;
//   availableNow: number;
//   pendingClearance: number;
//   dailyTransactionLimit?: number;
//   dailyWithdrawalLimit?: number;
//   availableUtilization?: number;
//   pendingUtilization?: number;
//   isVerified?: boolean;
// }
export interface Balance {
  availableBalance: number;
  pendingBalance: number;
  totalBalance?: number; // optional, can be calculated
}


export interface PaymentMethod {
  _id: string;
  type: string;
  details: any;
   isDefault?: boolean; 
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  planType: string;
  pricePerMonth: number;
  totalAmount: number;
  billingPeriod: string;
  discountText: string;
}


export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
    prepareHeaders: (headers) => {
    //   const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    //   if (token) {
    //     headers.set("Authorization", `Bearer ${token}`);
    //   }

      const token = document.cookie
    .split("; ")
    .find(row => row.startsWith("accessToken="))
    ?.split("=")[1];

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
      return headers;
    },
    credentials: "include",
  }),
  tagTypes: ["Wallet", "Transactions", "PaymentMethods", "Subscriptions"],
  endpoints: (builder) => ({
    // Wallet Balance
    getBalance: builder.query<Balance, string | void>({
      query: (userId) => `/payments/balance/${userId}`,
      providesTags: ["Wallet"],
    }),

    // Transactions
    getTransactions: builder.query<Transaction[], string>({
      query: (userId) => `/payments/transactions/${userId}`,
      providesTags: ["Transactions"],
    }),

    // Add Funds
addFunds: builder.mutation<
  any,
  {
    userId: string;
    amount: number;
    paymentMethodId: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
  }
>({
  query: (body) => ({
    url: `/payments/add-funds`,
    method: "POST",
    body,
  }),
  invalidatesTags: ["Wallet", "Transactions"],
}),


    // Payment Methods
    getPaymentMethods: builder.query<PaymentMethod[], string>({
      query: (userId) => `/payments/payment-methods/${userId}`,
        providesTags: (result, error, userId) =>
        result ? [{ type: "PaymentMethods", id: userId }, "PaymentMethods"] : ["PaymentMethods"],
    }),
    addPaymentMethod: builder.mutation<any, { userId: string; type: string; details: any }>({
      query: (body) => ({
        url: `/payments/payment-methods/add`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: "PaymentMethods", id: arg.userId }, "PaymentMethods"],
    }),

    updatePaymentMethod: builder.mutation<any, { userId: string; paymentMethodId: string; updates: any }>({
      query: ({ userId, paymentMethodId, updates }) => ({
        url: `/payments/payment-methods/${userId}/${paymentMethodId}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (result, error, arg) => [{ type: "PaymentMethods", id: arg.userId }, "PaymentMethods"],
    }),

    deletePaymentMethod: builder.mutation<any, { userId: string; paymentMethodId: string }>({
      query: ({ userId, paymentMethodId }) => ({
        url: `/payments/payment-methods/${userId}/${paymentMethodId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [{ type: "PaymentMethods", id: arg.userId }, "PaymentMethods"],
    }),

    // In paymentApi.ts, inside endpoints(builder) => ({ ... })
createRazorpayOrder: builder.mutation<
  { id: string; currency: string; amount: number }, // response from backend
  { amount: number; currency?: string; userId: string } // request payload
>({
  query: (body) => ({
    url: `/payments/razorpay/create-order`, // your backend route
    method: "POST",
    body,
  }),
}),


    // Subscriptions
    getPlans: builder.query<SubscriptionPlan[], void>({
      query: () => `/subscriptions/`,
      providesTags: ["Subscriptions"],
    }),
    subscribePlan: builder.mutation<
      any,
      { userId: string; planId: string; paymentMethodId: string }
    >({
      query: (body) => ({
        url: `/subscriptions/subscribe`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet", "Transactions", "Subscriptions"],
    }),
  }),
});

export const {
  useGetBalanceQuery,
  useGetTransactionsQuery,
  useAddFundsMutation,
  useGetPaymentMethodsQuery,
  useAddPaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useGetPlansQuery,
  useSubscribePlanMutation,
  useCreateRazorpayOrderMutation,
} = paymentApi;
