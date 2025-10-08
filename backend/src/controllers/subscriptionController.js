import EnhancedUser from '../models/enhancedUser.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import Subscription from '../models/Subscription.js';
import SubscriptionTransaction from '../models/SubscriptionTransaction.js';
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

/**
 * Create ₹1 validation order for payment method verification
 * This validates the card before starting the trial
 */
export const createPaymentValidationOrder = async (req, res) => {
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

// Get subscription status for user
export const getSubscriptionStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user first
    const user = await EnhancedUser.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    // Find active subscription using the new schema
    const subscription = await Subscription.findOne({
      userId: user._id,
      status: { $in: ['trial', 'active'] }
    }).populate('planId');

    if (!subscription) {
      return res.status(200).json({
        success: true,
        subscription: null,
        message: "No subscription found"
      });
    }

    const now = new Date();
    
    // Calculate trial remaining days
    let trialDaysRemaining = 0;
    if (subscription.isTrialActive && subscription.trialEndDate) {
      const timeDiff = subscription.trialEndDate - now;
      trialDaysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    }

    res.status(200).json({
      success: true,
      subscription: {
        plan: subscription.planId,
        status: subscription.status,
        isActive: subscription.isActive,
        isTrialActive: subscription.isTrialActive,
        trialDaysRemaining,
        trialEndDate: subscription.trialEndDate,
        endDate: subscription.endDate,
        nextBillingDate: subscription.nextBillingDate,
        autoRenew: subscription.autoRenew,
        paymentMethod: subscription.paymentMethod
      }
    });

  } catch (err) {
    console.error('Get subscription status error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await EnhancedUser.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    // Find active subscription using the new schema
    const subscription = await Subscription.findOne({
      userId: user._id,
      status: { $in: ['trial', 'active'] }
    });

    if (!subscription || !subscription.isActive) {
      return res.status(400).json({ 
        success: false,
        error: "No active subscription to cancel" 
      });
    }

    // Disable auto-renewal but keep access until end date
    subscription.autoRenew = false;
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    subscription.cancelledBy = 'user';
    
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully. Access will continue until the end of the current billing period.",
      subscription: {
        plan: subscription.planId,
        status: subscription.status,
        isActive: subscription.isActive,
        isTrialActive: subscription.isTrialActive,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew,
        paymentMethod: subscription.paymentMethod
      }
    });

  } catch (err) {
    console.error('Cancel subscription error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// Legacy method for backward compatibility (deprecated)
export const assignSubscriptionToUser = async (req, res) => {
  try {
    const { userId, planId, autoRenew } = req.body;

    // Find subscription plan
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ 
        success: false,
        error: "Subscription plan not found" 
      });
    }

    // Find user by _id (not userId field)
    const user = await EnhancedUser.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    // Calculate endDate
    let endDate = new Date();
    if (plan.billingCycle === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.billingCycle === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Create new subscription using the new schema
    const subscription = new Subscription({
      userId: user._id,
      planId: plan._id,
      status: 'active',
      isActive: true,
      isTrialActive: false,
          startDate: new Date(),
      endDate: endDate,
      billingCycle: plan.billingCycle,
      paymentMethod: 'manual',
      autoRenew: autoRenew || false,
      nextBillingDate: endDate
    });

    await subscription.save();

    // Update user's active subscription reference
    user.activeSubscription = subscription._id;
    await user.save();

    // Populate plan details
    await subscription.populate('planId');

    res.status(200).json({
      success: true,
      message: "Subscription assigned successfully",
      subscription: {
        plan: subscription.planId,
        status: subscription.status,
        isActive: subscription.isActive,
        isTrialActive: subscription.isTrialActive,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew,
        paymentMethod: subscription.paymentMethod
      }
    });

  } catch (err) {
    console.error('Assign subscription error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};
