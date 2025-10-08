import mongoose from "mongoose";

const subscriptionTransactionSchema = new mongoose.Schema({
  // User and subscription references
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EnhancedUser', 
    required: true 
  },
  subscriptionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SubscriptionPlan', 
    required: true 
  },
  
  // Transaction details
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentMethod: { 
    type: String, 
    enum: ['card', 'paypal', 'upi', 'netbanking', 'wallet', 'trial'],
    required: true 
  },
  
  // Transaction status and type
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending' 
  },
  type: { 
    type: String, 
    enum: ['trial_start', 'subscription_payment', 'renewal', 'upgrade', 'refund'],
    required: true 
  },
  
  // Trial management
  trialStartDate: Date,
  trialEndDate: Date,
  isTrialTransaction: { type: Boolean, default: false },
  
  // Billing cycle information
  billingCycle: { 
    type: String, 
    enum: ['monthly', '6months', 'yearly'] 
  },
  billingPeriodStart: Date,
  billingPeriodEnd: Date,
  
  // Payment provider information
  paymentProvider: { 
    type: String, 
    enum: ['razorpay', 'stripe', 'paypal'] 
  },
  gatewayTransactionId: String,
  gatewayOrderId: String,
  gatewaySignature: String,
  
  // Auto-renewal settings
  autoRenewalEnabled: { type: Boolean, default: false },
  nextBillingDate: Date,
  
  // Transaction metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String,
    notes: String
  },
  
  // Dates
  processedAt: Date,
  failedAt: Date,
  refundedAt: Date
}, {
  timestamps: true
});

// Indexes for better performance
subscriptionTransactionSchema.index({ userId: 1, status: 1 });
subscriptionTransactionSchema.index({ gatewayTransactionId: 1 });
subscriptionTransactionSchema.index({ createdAt: -1 });
subscriptionTransactionSchema.index({ type: 1, status: 1 });

// Virtual for transaction summary
subscriptionTransactionSchema.virtual('transactionSummary').get(function() {
  return {
    id: this._id,
    amount: this.amount,
    currency: this.currency,
    status: this.status,
    type: this.type,
    date: this.createdAt,
    paymentMethod: this.paymentMethod
  };
});

// Method to check if transaction is successful
subscriptionTransactionSchema.methods.isSuccessful = function() {
  return this.status === 'completed';
};

// Method to check if transaction is pending
subscriptionTransactionSchema.methods.isPending = function() {
  return this.status === 'pending';
};

// Method to check if transaction failed
subscriptionTransactionSchema.methods.isFailed = function() {
  return this.status === 'failed';
};

const SubscriptionTransaction = mongoose.models.SubscriptionTransaction || 
  mongoose.model('SubscriptionTransaction', subscriptionTransactionSchema);

export default SubscriptionTransaction;
