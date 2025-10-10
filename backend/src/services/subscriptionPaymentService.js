// ============================================================================
// SUBSCRIPTION PAYMENT SERVICE - Razorpay Integration
// ============================================================================

import Razorpay from 'razorpay';
import crypto from 'crypto';

// Check if Razorpay credentials are available
const hasRazorpayCredentials = !!(
  process.env.RAZORPAY_KEY_ID && 
  process.env.RAZORPAY_KEY_SECRET
);

console.log("🔑 Razorpay Key ID:", process.env.RAZORPAY_KEY_ID ? "✅ Present" : "❌ Missing");
console.log("🔑 Razorpay Key Secret:", process.env.RAZORPAY_KEY_SECRET ? "✅ Present" : "❌ Missing");

let razorpay = null;

if (hasRazorpayCredentials) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    console.log("✅ Razorpay initialized successfully for subscriptions");
  } catch (error) {
    console.error("❌ Failed to initialize Razorpay for subscriptions:", error);
  }
} else {
  console.warn("⚠️ Razorpay credentials missing. Using mock subscription payment service.");
}

/**
 * Create a payment order for subscription
 * @param {Object} options - Payment order options
 * @param {number} options.amount - Amount in rupees
 * @param {string} options.currency - Currency code (default: INR)
 * @param {string} options.userId - User ID
 * @param {string} options.planId - Subscription plan ID
 * @param {string} options.planName - Subscription plan name
 * @returns {Promise<Object>} Payment order
 */
export async function createSubscriptionPaymentOrder({ 
  amount, 
  currency = 'INR', 
  userId, 
  planId, 
  planName 
}) {
  // If Razorpay is not available, use mock order
  if (!razorpay) {
    console.log("🎭 Creating mock subscription payment order for testing");
    return {
      id: `mock_sub_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount * 100, // Convert to paise
      currency: currency,
      receipt: `sub_${userId}_${Date.now()}`,
      status: "created",
      created_at: Date.now(),
      provider: "mock",
      notes: {
        userId: userId,
        planId: planId,
        planName: planName,
        type: 'subscription_payment'
      }
    };
  }

  try {
    const shortUserId = String(userId).slice(-6); // take last 6 chars only
    const shortTime = Date.now().toString().slice(-6); // last 6 digits of timestamp
    const receipt = `sub_${planId}_${shortUserId}_${shortTime}`.slice(0, 40);

    const options = {
      amount: amount * 100, // Convert to paise
      currency: currency,
      receipt: receipt,
      notes: {
        userId: userId.toString(),
        planId: planId.toString(),
        planName: planName,
        type: 'subscription_payment'
      }
    };

    console.log("💳 Creating Razorpay subscription order with options:", options);
    const order = await razorpay.orders.create(options);
    console.log("✅ Razorpay subscription order created:", order.id);
    
    return {
      ...order,
      provider: "razorpay"
    };
  } catch (error) {
    console.error("❌ Subscription payment order creation failed:", error);
    throw error;
  }
}

/**
 * Verify Razorpay payment signature for subscription
 * @param {Object} paymentData - Payment data from Razorpay
 * @param {string} paymentData.razorpay_order_id - Order ID
 * @param {string} paymentData.razorpay_payment_id - Payment ID
 * @param {string} paymentData.razorpay_signature - Payment signature
 * @returns {boolean} Whether payment is verified
 */
export function verifySubscriptionPaymentSignature({ 
  razorpay_order_id, 
  razorpay_payment_id, 
  razorpay_signature 
}) {
  if (!hasRazorpayCredentials) {
    console.log("🎭 Mock subscription payment verification (always returns true for testing)");
    return true;
  }

  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!razorpaySecret) {
    console.error("❌ Razorpay key secret not configured in environment");
    return false;
  }

  const generatedSignature = crypto
    .createHmac('sha256', razorpaySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const isValid = generatedSignature === razorpay_signature;
  console.log(`${isValid ? '✅' : '❌'} Subscription payment signature verification:`, isValid);
  
  return isValid;
}

/**
 * Create a Razorpay customer for subscription billing
 * @param {Object} customerData - Customer information
 * @param {string} customerData.name - Customer name
 * @param {string} customerData.email - Customer email
 * @param {string} customerData.contact - Customer contact number
 * @returns {Promise<Object>} Customer object
 */
export async function createSubscriptionCustomer({ name, email, contact }) {
  if (!razorpay) {
    console.log("🎭 Creating mock subscription customer for testing");
    return {
      id: `mock_customer_${Date.now()}`,
      name: name,
      email: email,
      contact: contact,
      created_at: Date.now(),
      provider: "mock"
    };
  }

  try {
    const customer = await razorpay.customers.create({
      name: name,
      email: email,
      contact: contact
    });

    console.log("✅ Subscription customer created:", customer.id);
    return {
      ...customer,
      provider: "razorpay"
    };
  } catch (error) {
    console.error("❌ Subscription customer creation failed:", error);
    throw error;
  }
}

/**
 * Create a subscription for recurring billing
 * @param {Object} subscriptionData - Subscription data
 * @param {string} subscriptionData.planId - Razorpay plan ID
 * @param {string} subscriptionData.customerId - Customer ID
 * @param {number} subscriptionData.totalCount - Total billing cycles (null for indefinite)
 * @returns {Promise<Object>} Subscription object
 */
export async function createRecurringSubscription({ 
  planId, 
  customerId, 
  totalCount = null 
}) {
  if (!razorpay) {
    console.log("🎭 Creating mock recurring subscription for testing");
    return {
      id: `mock_subscription_${Date.now()}`,
      plan_id: planId,
      customer_id: customerId,
      status: "active",
      created_at: Date.now(),
      provider: "mock"
    };
  }

  try {
    const subscriptionOptions = {
      plan_id: planId,
      customer_id: customerId,
      quantity: 1
    };

    if (totalCount) {
      subscriptionOptions.total_count = totalCount;
    }

    const subscription = await razorpay.subscriptions.create(subscriptionOptions);
    console.log("✅ Recurring subscription created:", subscription.id);
    
    return {
      ...subscription,
      provider: "razorpay"
    };
  } catch (error) {
    console.error("❌ Recurring subscription creation failed:", error);
    throw error;
  }
}

/**
 * Cancel a recurring subscription
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<Object>} Cancelled subscription object
 */
export async function cancelRecurringSubscription(subscriptionId) {
  if (!razorpay) {
    console.log("🎭 Mock cancelling recurring subscription for testing");
    return {
      id: subscriptionId,
      status: "cancelled",
      cancelled_at: Date.now(),
      provider: "mock"
    };
  }

  try {
    const subscription = await razorpay.subscriptions.cancel(subscriptionId);
    console.log("✅ Recurring subscription cancelled:", subscription.id);
    
    return {
      ...subscription,
      provider: "razorpay"
    };
  } catch (error) {
    console.error("❌ Recurring subscription cancellation failed:", error);
    throw error;
  }
}

/**
 * Get subscription details
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<Object>} Subscription details
 */
export async function getSubscriptionDetails(subscriptionId) {
  if (!razorpay) {
    console.log("🎭 Mock getting subscription details for testing");
    return {
      id: subscriptionId,
      status: "active",
      created_at: Date.now(),
      provider: "mock"
    };
  }

  try {
    const subscription = await razorpay.subscriptions.fetch(subscriptionId);
    console.log("✅ Subscription details fetched:", subscription.id);
    
    return {
      ...subscription,
      provider: "razorpay"
    };
  } catch (error) {
    console.error("❌ Failed to fetch subscription details:", error);
    throw error;
  }
}

/**
 * Get all subscriptions for a customer
 * @param {string} customerId - Customer ID
 * @returns {Promise<Array>} Array of subscriptions
 */
export async function getCustomerSubscriptions(customerId) {
  if (!razorpay) {
    console.log("🎭 Mock getting customer subscriptions for testing");
    return [];
  }

  try {
    const subscriptions = await razorpay.subscriptions.all({
      customer_id: customerId
    });
    
    console.log(`✅ Fetched ${subscriptions.items.length} subscriptions for customer ${customerId}`);
    return subscriptions.items.map(sub => ({
      ...sub,
      provider: "razorpay"
    }));
  } catch (error) {
    console.error("❌ Failed to fetch customer subscriptions:", error);
    throw error;
  }
}

export default {
  createSubscriptionPaymentOrder,
  verifySubscriptionPaymentSignature,
  createSubscriptionCustomer,
  createRecurringSubscription,
  cancelRecurringSubscription,
  getSubscriptionDetails,
  getCustomerSubscriptions
};

