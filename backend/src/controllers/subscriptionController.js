import EnhancedUser from '../models/enhancedUser.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Subscription from '../models/Subscription.js';
import SubscriptionTransaction from '../models/SubscriptionTransaction.js';
//current changes starts
import { 
  createSubscriptionPaymentOrder as createPaymentOrder, 
  verifySubscriptionPaymentSignature 
} from '../services/subscriptionPaymentService.js';
import {
  createCardValidationOrder,
  verifyCardValidation,
  createRazorpayCustomer,
  storePaymentMethod
} from '../services/autoPayService.js';
/// current canges end
import Transaction from '../models/Transaction.js';
import Razorpay from "razorpay";
import crypto from 'crypto';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Validate payment method details and funds
const validatePaymentMethod = async (paymentMethod, plan) => {
  try {
    // Basic validation for payment method structure
    if (!paymentMethod.type || !paymentMethod.details) {
      return {
        isValid: false,
        error: "Invalid payment method structure",
        code: "INVALID_PAYMENT_METHOD"
      };
    }

    // Validate based on payment method type
    if (paymentMethod.type === 'card') {
      return await validateCardPayment(paymentMethod, plan);
    } else if (paymentMethod.type === 'upi') {
      return await validateUpiPayment(paymentMethod, plan);
    } else if (paymentMethod.type === 'wallet') {
      return await validateWalletPayment(paymentMethod, plan);
    } else {
      return {
        isValid: false,
        error: "Unsupported payment method type",
        code: "UNSUPPORTED_PAYMENT_TYPE"
      };
    }
  } catch (error) {
    console.error("Payment validation error:", error);
    return {
      isValid: false,
      error: "Payment validation failed",
      code: "VALIDATION_ERROR"
    };
  }
};

// Validate card payment method with Razorpay
const validateCardPayment = async (paymentMethod, plan) => {
  const { details } = paymentMethod;
  
  // Check if card details are complete
  if (!details.name || !details.number || !details.expiry) {
    return {
      isValid: false,
      error: "Incomplete card details",
      code: "INCOMPLETE_CARD_DETAILS"
    };
  }

  // Check if we're in test mode
  const isTestMode = process.env.NODE_ENV === 'development' || process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_');
  
  if (isTestMode) {
    // In test mode, use Razorpay test cards
    return await validateTestCard(details);
  } else {
    // In production, use strict validation
    return await validateProductionCard(details);
  }
};

// Validate test cards (for development/testing)
const validateTestCard = async (details) => {
  // Razorpay test card numbers
  const testCards = [
    '4111111111111111', // Visa
    '5555555555554444', // Mastercard
    '378282246310005',  // Amex
    '4000000000000002', // Expired card
    '4000000000009995', // Insufficient funds
  ];

  // Check if it's a known test card
  const isTestCard = testCards.includes(details.number.replace(/\s/g, ''));
  
  if (!isTestCard) {
    return {
      isValid: false,
      error: "Please use a valid test card number for testing. Use: 4111111111111111 (Visa) or 5555555555554444 (Mastercard)",
      code: "INVALID_TEST_CARD"
    };
  }

  // Basic validation for test cards
  if (!isValidCardNumber(details.number)) {
    return {
      isValid: false,
      error: "Invalid card number format",
      code: "INVALID_CARD_NUMBER"
    };
  }

  // Check expiry for test cards
  if (isCardExpired(details.expiry)) {
    return {
      isValid: false,
      error: "Card has expired. Use a future expiry date for testing",
      code: "CARD_EXPIRED"
    };
  }

  return {
    isValid: true,
    message: "Test card validation successful",
    isTestMode: true
  };
};

// Validate production cards (strict validation)
const validateProductionCard = async (details) => {
  // Strict Luhn algorithm validation
  if (!isValidCardNumber(details.number)) {
    return {
      isValid: false,
      error: "Invalid card number",
      code: "INVALID_CARD_NUMBER"
    };
  }

  // Check if card is expired
  if (isCardExpired(details.expiry)) {
    return {
      isValid: false,
      error: "Card has expired",
      code: "CARD_EXPIRED"
    };
  }

  // In production, you might want to do a $0 authorization with Razorpay
  try {
    const testAmount = 100; // ₹1 in paise for validation
    const order = await razorpayInstance.orders.create({
      amount: testAmount,
      currency: 'INR',
      payment_capture: 1,
      notes: {
        purpose: 'card_validation',
        userId: details.userId
      }
    });

    return {
      isValid: true,
      message: "Card validation successful",
      orderId: order.id,
      isTestMode: false
    };
  } catch (error) {
    console.error("Razorpay card validation error:", error);
    return {
      isValid: false,
      error: "Card validation failed with payment processor",
      code: "CARD_VALIDATION_FAILED"
    };
  }
};

// Validate UPI payment method
const validateUpiPayment = async (paymentMethod, plan) => {
  const { details } = paymentMethod;
  
  if (!details.upiId) {
    return {
      isValid: false,
      error: "UPI ID is required",
      code: "MISSING_UPI_ID"
    };
  }

  // Basic UPI ID format validation
  if (!isValidUpiId(details.upiId)) {
    return {
      isValid: false,
      error: "Invalid UPI ID format",
      code: "INVALID_UPI_ID"
    };
  }

  return {
    isValid: true,
    message: "UPI validation successful"
  };
};

// Validate wallet payment method
const validateWalletPayment = async (paymentMethod, plan) => {
  const { details } = paymentMethod;
  
  if (!details.balance || details.balance < plan.pricePerMonth) {
    return {
      isValid: false,
      error: `Insufficient wallet balance. Required: $${plan.pricePerMonth}, Available: $${details.balance || 0}`,
      code: "INSUFFICIENT_FUNDS"
    };
  }

  return {
    isValid: true,
    message: "Wallet validation successful"
  };
};

// Helper function to validate card number using Luhn algorithm
const isValidCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 13 || cleaned.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Helper function to check if card is expired
const isCardExpired = (expiry) => {
  const [month, year] = expiry.split('/');
  const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
  const now = new Date();
  return expiryDate < now;
};

// Helper function to validate UPI ID format
const isValidUpiId = (upiId) => {
  // Basic UPI ID format validation
  const upiPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
  return upiPattern.test(upiId);
};

// Create a new subscription plan (Admin only)
export const createSubscription = async (req, res) => {
  try {
    const { 
      name,
      planType,
      pricePerMonth,
      totalAmount,
      billingPeriod,
      discountText,
      trialDays,
      features,
      currency,
      originalPrice,
      isPopular
    } = req.body;

    const plan = new SubscriptionPlan({
      name,
      description: name, // Use name as description if not provided
      price: totalAmount || pricePerMonth,
      billingCycle: planType,
      billingPeriod,
      discountText,
      trialDays: trialDays || 7,
      features: features || [],
      currency: currency || 'INR',
      originalPrice,
      isPopular: isPopular || false,
      createdBy: req.user._id // Admin who created the plan
    });

    await plan.save();
    res.status(201).json({ 
      success: true,
      message: "Plan created successfully", 
      plan 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Get all active subscription plans
export const getAllPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 });
    res.status(200).json({
      success: true,
      plans
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching plans', 
      error: err.message 
    });
  }
};


export const subscribeToPlan = async (req, res) => {
  try {
    const { userId, planId, paymentMethodId } = req.body;

    if (!userId || !planId || !paymentMethodId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find user and validate payment method
    const user = await EnhancedUser.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const paymentMethod = user.getPaymentMethodById(paymentMethodId);
    if (!paymentMethod) {
      return res.status(404).json({ error: "Payment method not found" });
    }

    // Find subscription plan
    const plan = await Subscription.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }

    // Validate payment method details and funds
    const paymentValidation = await validatePaymentMethod(paymentMethod, plan);
    if (!paymentValidation.isValid) {
      return res.status(400).json({ 
        error: paymentValidation.error,
        code: paymentValidation.code 
      });
    }

    // Check if user already has an active subscription (allow plan changes)
    if (user.subscription && user.subscription.isActive && !user.subscription.cancelledAt) {
      return res.status(400).json({ error: "User already has an active subscription" });
    }

    // Calculate trial end date (7 days from now)
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    // Calculate actual subscription end date based on plan
    let subscriptionEndDate = new Date(trialEndDate);
    if (plan.planType === "monthly") {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    } else if (plan.planType === "6months") {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 6);
    } else if (plan.planType === "yearly") {
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
    }

    // Update user subscription
    user.subscription = {
      planId,
      startDate: trialStartDate,
      endDate: subscriptionEndDate,
      trialEndDate: trialEndDate,
      isActive: true,
      isTrial: true,
      paymentMethod: paymentMethodId,
      autoRenew: true,
      createdAt: new Date()
    };

    await user.save();

    // Schedule automatic billing after 7 days
    scheduleAutomaticBilling(userId, planId, paymentMethodId, trialEndDate);

    res.status(200).json({
      message: "Free trial started successfully",
        subscription: {
          planId,
        startDate: trialStartDate,
        trialEndDate: trialEndDate,
        isTrial: true,
        daysRemaining: 7
      }
    });

  } catch (err) {
    console.error("Subscribe to plan error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Schedule automatic billing after trial period
const scheduleAutomaticBilling = (userId, planId, paymentMethodId, trialEndDate) => {
  const billingDelay = trialEndDate.getTime() - Date.now();
  
  setTimeout(async () => {
    try {
      await processAutomaticBilling(userId, planId, paymentMethodId);
    } catch (error) {
      console.error("Automatic billing failed:", error);
    }
  }, billingDelay);
};

// Process automatic billing after trial with Razorpay
const processAutomaticBilling = async (userId, planId, paymentMethodId) => {
  try {
    const user = await EnhancedUser.findById(userId);
    if (!user) return;

    // Check if user cancelled during trial
    if (!user.subscription || !user.subscription.isActive || !user.subscription.isTrial) {
      console.log(`User ${userId} cancelled subscription during trial`);
      return;
    }

    const plan = await Subscription.findById(planId);
    if (!plan) return;

    const paymentMethod = user.getPaymentMethodById(paymentMethodId);
    if (!paymentMethod) {
      console.error(`Payment method not found for user ${userId}`);
      return;
    }

    // Create Razorpay order for subscription payment
    const amount = Math.round(plan.pricePerMonth * 100); // Convert to paise
    const order = await razorpayInstance.orders.create({
      amount: amount,
      currency: 'INR',
      payment_capture: 1,
      notes: {
        purpose: 'subscription_payment',
        userId: userId,
        planId: planId,
        subscriptionId: user.subscription._id
      }
    });

    // Create transaction record
    const transaction = await Transaction.create({
      user: user._id,
      amount: plan.pricePerMonth,
      type: 'subscription',
      status: 'pending',
      paymentMethodId: paymentMethodId,
      description: `Subscription payment for ${plan.name}`,
      subscriptionId: user.subscription._id,
      razorpayOrderId: order.id
    });

    // For card payments, attempt to charge immediately
    if (paymentMethod.type === 'card') {
      try {
        // Create payment with Razorpay
        const payment = await razorpayInstance.payments.create({
          amount: amount,
          currency: 'INR',
          order_id: order.id,
          method: 'card',
          card: {
            number: paymentMethod.details.number,
            name: paymentMethod.details.name,
            expiry_month: paymentMethod.details.expiry.split('/')[0],
            expiry_year: paymentMethod.details.expiry.split('/')[1],
            cvv: paymentMethod.details.cvv
          }
        });

        if (payment.status === 'captured') {
          // Payment successful
          transaction.status = 'success';
          transaction.razorpayPaymentId = payment.id;
          transaction.processedAt = new Date();
          
          // Update user subscription to paid
          user.subscription.isTrial = false;
          user.subscription.trialEndDate = undefined;
          user.subscription.lastBillingDate = new Date();
          user.subscription.nextBillingDate = new Date();
          user.subscription.nextBillingDate.setMonth(user.subscription.nextBillingDate.getMonth() + 1);
          
          console.log(`Payment successful for user ${userId}: ₹${plan.pricePerMonth}`);
        } else {
          transaction.status = 'failed';
          transaction.failureReason = payment.error_description;
          console.error(`Payment failed for user ${userId}: ${payment.error_description}`);
        }
      } catch (paymentError) {
        console.error(`Razorpay payment error for user ${userId}:`, paymentError);
        transaction.status = 'failed';
        transaction.failureReason = paymentError.message;
      }
    } else {
      // For UPI/Wallet, mark as pending for manual processing
      transaction.status = 'pending';
      console.log(`Payment pending for user ${userId} with ${paymentMethod.type}`);
    }

    // Add transaction to user
    user.transactions.push(transaction._id);
    await user.save();
    await transaction.save();

    console.log(`Automatic billing processed for user ${userId}: ₹${plan.pricePerMonth}`);

  } catch (error) {
    console.error("Error processing automatic billing:", error);
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await EnhancedUser.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.subscription || !user.subscription.isActive) {
      return res.status(400).json({ error: "No active subscription found" });
    }

    // Cancel subscription
    user.subscription.isActive = false;
    user.subscription.cancelledAt = new Date();
    user.subscription.autoRenew = false;

    await user.save();

    res.status(200).json({
      message: "Subscription cancelled successfully",
      subscription: user.subscription
    });

  } catch (err) {
    console.error("Cancel subscription error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Change subscription plan
export const changeSubscriptionPlan = async (req, res) => {
  try {
    const { userId, newPlanId } = req.body;

    if (!userId || !newPlanId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find user
    const user = await EnhancedUser.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find new plan
    const newPlan = await Subscription.findById(newPlanId);
    if (!newPlan) {
      return res.status(404).json({ error: "New subscription plan not found" });
    }

    // Check if user has an active subscription
    if (!user.subscription || !user.subscription.isActive) {
      return res.status(400).json({ error: "No active subscription to change" });
    }

    // Validate payment method for new plan
    const paymentMethod = user.getPaymentMethodById(user.subscription.paymentMethod);
    if (paymentMethod) {
      const paymentValidation = await validatePaymentMethod(paymentMethod, newPlan);
      if (!paymentValidation.isValid) {
        return res.status(400).json({ 
          error: paymentValidation.error,
          code: paymentValidation.code 
        });
      }
    }

    // Calculate remaining trial days from current subscription
    const now = new Date();
    const currentTrialEndDate = new Date(user.subscription.trialEndDate);
    const remainingDays = Math.ceil((currentTrialEndDate - now) / (1000 * 60 * 60 * 24));
    
    // Cancel current subscription
    user.subscription.isActive = false;
    user.subscription.cancelledAt = new Date();
    user.subscription.autoRenew = false;

    // Calculate new trial dates - use remaining days from current trial
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + Math.max(1, remainingDays)); // At least 1 day remaining

    // Calculate new subscription end date
    let subscriptionEndDate = new Date(trialEndDate);
    if (newPlan.planType === "monthly") {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    } else if (newPlan.planType === "6months") {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 6);
    } else if (newPlan.planType === "yearly") {
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
    }

    // Create new subscription with new plan
    user.subscription = {
      planId: newPlanId,
      startDate: trialStartDate,
      endDate: subscriptionEndDate,
      trialEndDate: trialEndDate,
      isActive: true,
      isTrial: true,
      paymentMethod: user.subscription.paymentMethod, // Keep same payment method
      autoRenew: true,
      createdAt: new Date()
    };

    await user.save();

    // Schedule automatic billing for new plan after 7 days
    scheduleAutomaticBilling(userId, newPlanId, user.subscription.paymentMethod, trialEndDate);

    res.status(200).json({
      message: `Plan changed successfully. New trial started with ${Math.max(1, remainingDays)} days remaining.`,
      subscription: {
        planId: newPlanId,
        startDate: trialStartDate,
        trialEndDate: trialEndDate,
        isTrial: true,
        daysRemaining: Math.max(1, remainingDays)
      }
    });

  } catch (err) {
    console.error("Change subscription plan error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get user subscription status
export const getSubscriptionStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await EnhancedUser.findById(userId).populate('subscription.planId');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.subscription) {
      return res.status(200).json({ 
        hasSubscription: false,
        message: "No subscription found"
      });
    }

    const now = new Date();
    const isTrialActive = user.subscription.isTrial && user.subscription.trialEndDate > now;
    const daysRemaining = isTrialActive ? 
      Math.ceil((user.subscription.trialEndDate - now) / (1000 * 60 * 60 * 24)) : 0;

    res.status(200).json({
      hasSubscription: true,
      subscription: {
        ...user.subscription.toObject(),
        isTrialActive,
        daysRemaining,
        plan: user.subscription.planId
      }
    });

  } catch (err) {
    console.error("Get subscription status error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Razorpay webhook handler for production
export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    // Verify webhook signature
    const hash = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== signature) {
      return res.status(400).send("Invalid signature");
    }

    const { event, payload } = req.body;

    if (event === "payment.captured") {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;
      
      // Find transaction by Razorpay order ID
      const transaction = await Transaction.findOne({ razorpayOrderId: orderId });
      if (transaction) {
        transaction.status = 'success';
        transaction.razorpayPaymentId = payment.id;
        transaction.processedAt = new Date();
        await transaction.save();

        // Update user subscription
        const user = await EnhancedUser.findById(transaction.user);
        if (user && user.subscription) {
          user.subscription.isTrial = false;
          user.subscription.trialEndDate = undefined;
          user.subscription.lastBillingDate = new Date();
          user.subscription.nextBillingDate = new Date();
          user.subscription.nextBillingDate.setMonth(user.subscription.nextBillingDate.getMonth() + 1);
          await user.save();
        }

        console.log(`Payment captured for transaction ${transaction._id}: ₹${payment.amount / 100}`);
      }
    } else if (event === "payment.failed") {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;
      
      // Find transaction and mark as failed
      const transaction = await Transaction.findOne({ razorpayOrderId: orderId });
      if (transaction) {
        transaction.status = 'failed';
        transaction.failureReason = payment.error_description;
        await transaction.save();
        
        console.log(`Payment failed for transaction ${transaction._id}: ${payment.error_description}`);
      }
    }

    res.status(200).send("Webhook processed");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Internal Server Error");
  }
};

export const assignSubscriptionToUser = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    // Validate user
    const user = await EnhancedUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        error: "Only organizers can subscribe"
      });
    }

    // Get plan details
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: "Subscription plan not found"
      });
    }

    // Create ₹1 validation order
    console.log(`📝 Creating validation order for user: ${user.email} (${user._id})`);
    const validationOrder = await createCardValidationOrder(user, plan);
    console.log(`✅ Validation order created successfully: ${validationOrder.orderId}`);

    res.status(200).json({
      success: true,
      message: "Payment validation order created successfully",
      orderId: validationOrder.orderId,
      amount: validationOrder.amount,
      currency: validationOrder.currency,
      customerId: validationOrder.customerId,
      keyId: validationOrder.keyId,
      provider: validationOrder.provider
    });

  } catch (err) {
    console.error('❌ Payment validation order error:', err);
    console.error('Error details:', {
      message: err.message,
      statusCode: err.statusCode,
      error: err.error
    });
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to create validation order',
      details: err.error?.description || err.message
    });
  }
};

/**
 * Verify payment validation and start trial with auto-pay
 * This is called after Razorpay payment is successful
 */
export const verifyPaymentAndStartTrial = async (req, res) => {
  try {
    const { 
      userId, 
      planId, 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;

    // Validate user
    const user = await EnhancedUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Check if user already has active subscription
    if (user.activeSubscription) {
      const existingSubscription = await Subscription.findById(user.activeSubscription);
      if (existingSubscription && (existingSubscription.isActive || existingSubscription.isTrialActive)) {
        return res.status(400).json({
          success: false,
          message: "User already has an active subscription or trial."
        });
      }
    }

    // Verify the ₹1 payment
    const verificationResult = await verifyCardValidation({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!verificationResult.verified) {
      return res.status(400).json({
        success: false,
        error: "Payment verification failed"
      });
    }

    console.log(`✅ Card validated successfully for user ${user.email}`);

    // Get plan
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: "Subscription plan not found"
      });
    }

    // Calculate trial dates
    const now = new Date();
    const trialEndDate = new Date(now.getTime() + (plan.trialDays * 24 * 60 * 60 * 1000));

    // Create subscription with validated payment method
    const subscription = new Subscription({
      userId: user._id,
      planId: plan._id,
      status: 'trial',
      trialStartDate: now,
      trialEndDate: trialEndDate,
      isTrialActive: true,
      isActive: false,
      billingCycle: plan.billingCycle,
      paymentMethod: 'trial'
    });
    await subscription.save();

    // Update user's active subscription
    user.activeSubscription = subscription._id;
    await user.save();

    // Store validated payment method for auto-pay
    await storePaymentMethod(subscription, verificationResult);

    // Create trial transaction
    const trialTransaction = new SubscriptionTransaction({
      userId: user._id,
      subscriptionId: plan._id,
      amount: 0,
      currency: plan.currency,
      paymentMethod: 'trial',
      status: 'completed',
      type: 'trial_start',
      trialStartDate: now,
      trialEndDate: trialEndDate,
      isTrialTransaction: true,
      billingCycle: plan.billingCycle,
      autoRenewalEnabled: true,
      paymentProvider: 'razorpay',
      gatewayOrderId: razorpay_order_id,
      gatewayTransactionId: razorpay_payment_id
    });

    await trialTransaction.save();

    // Populate plan details
    await subscription.populate('planId');

    res.status(200).json({
      success: true,
      message: "Payment validated and trial started successfully",
      subscription: subscription,
      trialEndDate: trialEndDate,
      daysRemaining: Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24)),
      autoPayEnabled: true,
      nextBillingDate: trialEndDate,
      cardInfo: {
        last4: verificationResult.card?.last4,
        brand: verificationResult.card?.brand
      }
    });

  } catch (err) {
    console.error('Verify payment and start trial error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Start 7-day free trial for organizer with auto-pay setup
export const startTrialSubscription = async (req, res) => {
  try {
    const { userId, planId, paymentDetails } = req.body;
    

    // Validate user exists and is organizer
    const user = await EnhancedUser.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    if (user.role !== 'organizer') {
      return res.status(403).json({ 
        success: false,
        error: "Only organizers can start subscription trials" 
      });
    }

    // Check if user already has an active subscription or trial
    if (user.activeSubscription) {
      const existingSubscription = await Subscription.findById(user.activeSubscription);
      if (existingSubscription && (existingSubscription.isActive || existingSubscription.isTrialActive)) {
        return res.status(400).json({
          success: false,
          message: "User already has an active subscription or trial."
        });
      }
    }

    // Get subscription plan
    console.log("planId:", planId);

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ 
        success: false,
        error: "Subscription plan not found" 
      });
    }

    const now = new Date();
    const trialEndDate = new Date(now.getTime() + (plan.trialDays * 24 * 60 * 60 * 1000));

    // Create new subscription document
    const subscription = new Subscription({
      userId: user._id,
      planId: plan._id,
      status: 'trial',
      trialStartDate: now,
      trialEndDate: trialEndDate,
      isTrialActive: true,
      isActive: false,
      billingCycle: plan.billingCycle,
      paymentMethod: 'trial'
    });
    await subscription.save();

    // Update user's active subscription reference
    user.activeSubscription = subscription._id;
    await user.save();

    // Setup auto-pay if payment details provided
    if (paymentDetails && paymentDetails.cardNumber && paymentDetails.holderName) {
      try {
        // Create Razorpay customer
        const razorpayCustomer = await createRazorpayCustomer(user);
        
        // Prepare payment details for storage
        const paymentData = {
          cardNumber: paymentDetails.cardNumber,
          cardBrand: paymentDetails.cardBrand || 'Unknown',
          expiryMonth: paymentDetails.expiryMonth,
          expiryYear: paymentDetails.expiryYear,
          holderName: paymentDetails.holderName,
          razorpayCustomerId: razorpayCustomer.id,
          razorpayPaymentMethodId: paymentDetails.razorpayPaymentMethodId
        };

        // Store payment method for auto-pay
        await storePaymentMethod(subscription, paymentData);
        
        console.log(`✅ Auto-pay setup completed for subscription: ${subscription._id}`);
      } catch (autoPayError) {
        console.error('❌ Auto-pay setup failed:', autoPayError);
        // Don't fail the trial start if auto-pay setup fails
        // User can set it up later
      }
    }

    // Create trial transaction record
    const trialTransaction = new SubscriptionTransaction({
      userId: user._id,
      subscriptionId: plan._id,
      amount: 0, // Trial is free
      currency: plan.currency,
      paymentMethod: 'trial',
      status: 'completed',
      type: 'trial_start',
      trialStartDate: now,
      trialEndDate: trialEndDate,
      isTrialTransaction: true,
      billingCycle: plan.billingCycle,
      autoRenewalEnabled: false
    });

    await trialTransaction.save();

    // Populate plan details for response
    await subscription.populate('planId');

    res.status(200).json({
      success: true,
      message: "7-day free trial started successfully",
      subscription: subscription,
      trialEndDate: trialEndDate,
      daysRemaining: Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24)),
      autoPayEnabled: subscription.autoPayEnabled || false,
      nextBillingDate: trialEndDate
    });

  } catch (err) {
    console.error('Trial subscription error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Upgrade from trial to paid subscription
export const upgradeSubscription = async (req, res) => {
  try {
    const { userId, planId, paymentData } = req.body;

    // Validate user
    const user = await EnhancedUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    if (user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        error: "Only organizers can upgrade subscriptions"
      });
    }

    // Get subscription plan
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: "Subscription plan not found"
      });
    }

    // Find user's current subscription
    const currentSubscription = await Subscription.findOne({
      userId: user._id,
      status: { $in: ['trial', 'active'] }
    });

    if (!currentSubscription) {
      return res.status(404).json({
        success: false,
        error: "No active subscription found to upgrade"
      });
    }

    // Check if trial has expired
    const now = new Date();
    if (currentSubscription.status === 'trial' && currentSubscription.trialEndDate < now) {
      return res.status(400).json({
        success: false,
        error: "Trial has expired. Please start a new subscription.",
        trialExpired: true
      });
    }

    // Calculate billing dates
    const startDate = new Date();
    const endDate = new Date();
    
    switch (plan.billingCycle) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        endDate.setMonth(endDate.getMonth() + 1);
    }

    // Update subscription to active
    currentSubscription.status = 'active';
    currentSubscription.isActive = true;
    currentSubscription.isTrialActive = false;
    currentSubscription.startDate = startDate;
    currentSubscription.endDate = endDate;
    currentSubscription.billingCycle = plan.billingCycle;
    currentSubscription.paymentMethod = paymentData.method || 'card';
    currentSubscription.paymentProvider = 'razorpay';
    currentSubscription.autoRenew = true;
    currentSubscription.nextBillingDate = endDate;

    await currentSubscription.save();

    // Create payment transaction record
    const paymentTransaction = new SubscriptionTransaction({
      userId: user._id,
      subscriptionId: plan._id,
      amount: plan.price,
      currency: plan.currency,
      paymentMethod: paymentData.method || 'card',
      status: 'completed',
      type: 'subscription_payment',
      gatewayOrderId: paymentData.orderId,
      gatewayTransactionId: paymentData.transactionId,
      gatewaySignature: paymentData.signature,
      processedAt: now,
      billingCycle: plan.billingCycle,
      billingPeriodStart: startDate,
      billingPeriodEnd: endDate,
      nextBillingDate: endDate,
      autoRenewalEnabled: true,
      isTrialTransaction: false,
      paymentProvider: 'razorpay'
    });

    await paymentTransaction.save();

    // Populate plan details for response
    await currentSubscription.populate('planId');

    res.status(200).json({
      success: true,
      message: "Subscription upgraded successfully",
      subscription: currentSubscription,
      paymentTransaction: paymentTransaction,
      billingPeriod: {
        start: startDate,
        end: endDate,
        nextBillingDate: endDate
      }
    });

  } catch (err) {
    console.error('Subscription upgrade error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Create payment order for subscription upgrade
export const createSubscriptionPaymentOrder = async (req, res) => {
  try {
    const { userId, planId, paymentMethod } = req.body;

    // Validate user
    const user = await EnhancedUser.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    if (user.role !== 'organizer') {
      return res.status(403).json({ 
        success: false,
        error: "Only organizers can subscribe" 
      });
    }

    // Get subscription plan
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ 
        success: false,
        error: "Subscription plan not found" 
      });
    }

    // Check if user has an active trial using new schema
    const subscription = await Subscription.findOne({
      userId: user._id,
      status: 'trial',
      isTrialActive: true
    });

    if (!subscription) {
      return res.status(400).json({ 
        success: false,
        error: "No active trial found. Please start a trial first." 
      });
    }

    // Create payment order using Razorpay
    const order = await createPaymentOrder({
      amount: plan.totalAmount,
      currency: plan.currency,
      userId: user._id,
      planId: plan._id,
      planName: plan.name
    });

    // Create pending transaction
    const subscriptionTransaction = new SubscriptionTransaction({
      userId: user._id,
      subscriptionId: plan._id,
      amount: plan.totalAmount,
      currency: plan.currency,
      paymentMethod: paymentMethod,
      status: 'pending',
      type: 'subscription_payment',
      billingCycle: plan.planType,
      autoRenewalEnabled: true,
      paymentProvider: order.provider,
      gatewayOrderId: order.id
    });

    await subscriptionTransaction.save();

    res.status(200).json({
      success: true,
      message: "Payment order created successfully",
      order: order,
      transactionId: subscriptionTransaction._id,
      keyId: process.env.RAZORPAY_KEY_ID || "mock_key_id"
    });

  } catch (err) {
    console.error('Payment order creation error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Verify subscription payment
export const verifySubscriptionPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      transactionId 
    } = req.body;

    // Find the transaction
    const transaction = await SubscriptionTransaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        error: "Transaction not found" 
      });
    }

    // Verify Razorpay signature
    const isSignatureValid = verifySubscriptionPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isSignatureValid) {
      transaction.status = 'failed';
      await transaction.save();
      return res.status(400).json({ 
        success: false,
        error: "Invalid payment signature" 
      });
    }

    // Payment verified - update subscription
    const user = await EnhancedUser.findById(transaction.userId);
    const plan = await SubscriptionPlan.findById(transaction.subscriptionId);

    if (!user || !plan) {
      return res.status(404).json({ 
        success: false,
        error: "User or plan not found" 
      });
    }

    // Find existing subscription
    const existingSubscription = await Subscription.findOne({
      userId: user._id,
      status: 'trial'
    });

    if (!existingSubscription) {
      return res.status(404).json({ 
        success: false,
        error: "No active trial subscription found" 
      });
    }

    // Calculate subscription end date
    const now = new Date();
    let endDate = new Date();
    
    if (plan.billingCycle === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.billingCycle === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Update subscription to active
    existingSubscription.status = 'active';
    existingSubscription.isActive = true;
    existingSubscription.isTrialActive = false;
    existingSubscription.startDate = now;
    existingSubscription.endDate = endDate;
    existingSubscription.paymentMethod = transaction.paymentMethod;
    existingSubscription.paymentProvider = 'razorpay';
    existingSubscription.autoRenew = true;
    existingSubscription.nextBillingDate = endDate;
    existingSubscription.lastPaymentDate = now;
    existingSubscription.paymentProviderData = {
      ...existingSubscription.paymentProviderData,
      customerId: razorpay_payment_id,
      subscriptionId: razorpay_order_id,
      paymentMethodId: razorpay_payment_id
    };

    await existingSubscription.save();

    // Update transaction
    transaction.status = 'completed';
    transaction.gatewayTransactionId = razorpay_payment_id;
    transaction.gatewaySignature = razorpay_signature;
    transaction.processedAt = now;
    transaction.billingPeriodStart = now;
    transaction.billingPeriodEnd = endDate;
    transaction.nextBillingDate = endDate;
    await transaction.save();

    res.status(200).json({
      success: true,
      message: "Payment verified and subscription activated successfully",
      subscription: {
        plan: existingSubscription.planId,
        status: existingSubscription.status,
        isActive: existingSubscription.isActive,
        isTrialActive: existingSubscription.isTrialActive,
        startDate: existingSubscription.startDate,
        endDate: existingSubscription.endDate,
        autoRenew: existingSubscription.autoRenew,
        paymentMethod: existingSubscription.paymentMethod
      },
      transaction: transaction.transactionSummary
    });

  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};



