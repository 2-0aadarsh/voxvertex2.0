import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  // User who owns this subscription
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EnhancedUser', 
    required: true 
  },
  
  // Reference to the subscription plan template
  planId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SubscriptionPlan', 
    required: true 
  },
  
  // Subscription status and dates
  status: { 
    type: String, 
    enum: ['trial', 'active', 'cancelled', 'expired', 'paused'], 
    default: 'trial' 
  },
  
  // Trial information
  trialStartDate: Date,
  trialEndDate: Date,
  isTrialActive: { type: Boolean, default: true },
  
  // Active subscription information
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: false },
  
  // Billing information
  billingCycle: { type: String, enum: ['monthly', 'quarterly', '6months', 'yearly'] },
  nextBillingDate: Date,
  lastPaymentDate: Date,
  autoRenew: { type: Boolean, default: false },
  
  // Payment information
  paymentMethod: { type: String, enum: ['card', 'paypal', 'upi', 'wallet', 'trial'] },
  paymentProvider: { type: String, enum: ['razorpay', 'stripe', 'paypal'] },
  paymentProviderData: {
    customerId: String,
    subscriptionId: String,
    paymentMethodId: String,
    // Store encrypted payment details for auto-pay
    cardDetails: {
      last4: String,
      brand: String,
      expiryMonth: String,
      expiryYear: String,
      holderName: String
    },
    // Razorpay customer and payment method IDs
    razorpayCustomerId: String,
    razorpayPaymentMethodId: String
  },
  
  // Auto-pay configuration
  autoPayEnabled: { type: Boolean, default: false },
  autoPaySetupDate: Date,
  paymentFailureCount: { type: Number, default: 0 },
  lastPaymentFailureDate: Date,
  nextRetryDate: Date,
  
  // Subscription metadata
  cancelledAt: Date,
  cancelledBy: { type: String, enum: ['user', 'admin', 'system'] },
  cancellationReason: String
}, {
  timestamps: true
});

// Indexes for better performance
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ planId: 1 });
SubscriptionSchema.index({ trialEndDate: 1 });
SubscriptionSchema.index({ endDate: 1 });

export default mongoose.model("Subscription", SubscriptionSchema);
