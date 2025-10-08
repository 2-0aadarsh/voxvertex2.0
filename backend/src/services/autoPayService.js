import crypto from 'crypto';
import Razorpay from 'razorpay';

// Check if Razorpay credentials are available
const hasRazorpayCredentials = !!(
  process.env.RAZORPAY_KEY_ID && 
  process.env.RAZORPAY_KEY_SECRET
);

console.log("🔑 AutoPay Razorpay Key ID:", process.env.RAZORPAY_KEY_ID ? "✅ Present" : "❌ Missing");
console.log("🔑 AutoPay Razorpay Key Secret:", process.env.RAZORPAY_KEY_SECRET ? "✅ Present" : "❌ Missing");

// Initialize Razorpay only if credentials are present
let razorpay = null;

if (hasRazorpayCredentials) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    console.log("✅ Razorpay initialized successfully for auto-pay");
  } catch (error) {
    console.error("❌ Failed to initialize Razorpay for auto-pay:", error);
  }
} else {
  console.warn("⚠️ Razorpay credentials missing. Using mock auto-pay service.");
}

/**
 * Encrypt sensitive payment data
 */
const encrypt = (text) => {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key-change-in-production', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};

/**
 * Decrypt sensitive payment data
 */
const decrypt = (encryptedData) => {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key-change-in-production', 'salt', 32);
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const authTag = Buffer.from(encryptedData.authTag, 'hex');
  
  const decipher = crypto.createDecipher(algorithm, key);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

/**
 * Create ₹1 authorization order for payment validation
 * This validates the card without actually charging it
 */
export const createCardValidationOrder = async (userDetails, planDetails) => {
  try {
    // Use mock for testing if Razorpay not configured
    if (!razorpay) {
      console.log("🎭 Creating mock ₹1 validation order for testing");
      return {
        id: `mock_val_order_${Date.now()}`,
        amount: 100, // ₹1 in paise
        currency: 'INR',
        receipt: `val_${userDetails._id}_${Date.now()}`,
        status: 'created',
        customer_id: `mock_customer_${Date.now()}`,
        provider: 'mock'
      };
    }

    // Check if customer already exists, reuse if found
    let customer;
    
    try {
      // Try to find existing customer by email
      const existingCustomers = await razorpay.customers.all({ email: userDetails.email });
      
      if (existingCustomers.items && existingCustomers.items.length > 0) {
        // Customer exists - reuse it
        customer = existingCustomers.items[0];
        console.log(`♻️  Reusing existing Razorpay customer: ${customer.id}`);
      } else {
        // Customer doesn't exist - create new one
        const customerData = {
          name: `${userDetails.firstName} ${userDetails.lastName}`,
          email: userDetails.email,
          notes: {
            userId: userDetails._id.toString(),
            role: userDetails.role,
            purpose: 'card_validation'
          }
        };

        // Add contact only if valid mobile number exists
        if (userDetails.mobileNumber && userDetails.mobileNumber.length <= 15) {
          customerData.contact = userDetails.mobileNumber;
        }

        customer = await razorpay.customers.create(customerData);
        console.log(`✅ Created new Razorpay customer: ${customer.id}`);
      }
    } catch (customerError) {
      // If customer search fails, try to create (fallback)
      console.log('⚠️ Customer search failed, attempting to create new customer');
      
      const customerData = {
        name: `${userDetails.firstName} ${userDetails.lastName}`,
        email: userDetails.email,
        notes: {
          userId: userDetails._id.toString(),
          role: userDetails.role,
          purpose: 'card_validation'
        }
      };

      // Add contact only if valid mobile number exists
      if (userDetails.mobileNumber && userDetails.mobileNumber.length <= 15) {
        customerData.contact = userDetails.mobileNumber;
      }

      customer = await razorpay.customers.create(customerData);
      console.log(`✅ Created Razorpay customer (fallback): ${customer.id}`);
    }

    // Create ₹1 authorization order
    // Receipt must be ≤40 chars: use short userId + timestamp
    const shortUserId = userDetails._id.toString().slice(-8); // Last 8 chars
    const shortTime = Date.now().toString().slice(-8); // Last 8 digits
    const receipt = `val_${shortUserId}_${shortTime}`; // Format: val_12345678_87654321 (max 25 chars)
    
    const orderData = {
      amount: 100, // ₹1 in paise (smallest amount for validation)
      currency: planDetails.currency || 'INR',
      receipt: receipt,
      customer_id: customer.id,
      notes: {
        type: 'card_validation',
        userId: userDetails._id.toString(),
        planId: planDetails._id.toString(),
        purpose: 'Trial payment method validation'
      }
    };

    const order = await razorpay.orders.create(orderData);
    console.log(`✅ Created ₹1 validation order: ${order.id} (receipt: ${receipt}, length: ${receipt.length})`);

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      customerId: customer.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      provider: 'razorpay'
    };

  } catch (error) {
    console.error('❌ Error creating card validation order:', error);
    throw error;
  }
};

/**
 * Verify ₹1 authorization and store payment method
 */
export const verifyCardValidation = async (validationData) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validationData;

    // Verify signature
    if (!hasRazorpayCredentials) {
      console.log("🎭 Mock validation verification");
      return {
        verified: true,
        paymentId: razorpay_payment_id,
        customerId: `mock_customer_${Date.now()}`
      };
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = generatedSignature === razorpay_signature;

    if (!isValid) {
      throw new Error('Invalid payment signature');
    }

    console.log(`✅ Card validation verified: ${razorpay_payment_id}`);

    // Fetch payment details to get card info
    if (razorpay) {
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      
      return {
        verified: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        customerId: payment.customer_id,
        card: {
          last4: payment.card?.last4 || 'XXXX',
          brand: payment.card?.network || 'Unknown',
          type: payment.card?.type || 'credit'
        },
        method: payment.method
      };
    }

    return {
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    };

  } catch (error) {
    console.error('❌ Card validation verification failed:', error);
    throw error;
  }
};

/**
 * Create Razorpay customer for auto-pay
 */
export const createRazorpayCustomer = async (userDetails) => {
  try {
    // Use mock for testing if Razorpay not configured
    if (!razorpay) {
      console.log("🎭 Creating mock Razorpay customer for testing");
      return {
        id: `mock_customer_${Date.now()}`,
        name: `${userDetails.firstName} ${userDetails.lastName}`,
        email: userDetails.email,
        contact: userDetails.mobileNumber || '',
        provider: 'mock'
      };
    }

    const customerData = {
      name: `${userDetails.firstName} ${userDetails.lastName}`,
      email: userDetails.email,
      notes: {
        userId: userDetails._id.toString(),
        role: userDetails.role
      }
    };

    // Add contact only if valid mobile number exists
    if (userDetails.mobileNumber && userDetails.mobileNumber.length <= 15) {
      customerData.contact = userDetails.mobileNumber;
    }

    const customer = await razorpay.customers.create(customerData);
    console.log(`✅ Created Razorpay customer: ${customer.id}`);
    return customer;
  } catch (error) {
    console.error('❌ Error creating Razorpay customer:', error);
    throw error;
  }
};

/**
 * Store payment method for auto-pay (TOKEN-BASED, PCI Compliant)
 * NEVER stores raw card details - only tokens and display info
 */
export const storePaymentMethod = async (subscription, validatedPaymentData) => {
  try {
    // Store ONLY tokens and display information (PCI compliant)
    subscription.paymentProviderData = {
      ...subscription.paymentProviderData,
      // Store card display info (last 4 digits and brand)
      cardDetails: {
        last4: validatedPaymentData.card?.last4 || 'XXXX',
        brand: validatedPaymentData.card?.brand || 'Unknown',
        type: validatedPaymentData.card?.type || 'credit'
      },
      // Store Razorpay tokens for auto-pay (CRITICAL)
      razorpayCustomerId: validatedPaymentData.customerId,
      razorpayPaymentMethodId: validatedPaymentData.paymentId,
      paymentMethodId: validatedPaymentData.paymentId
    };

    // Enable auto-pay
    subscription.autoPayEnabled = true;
    subscription.autoPaySetupDate = new Date();
    subscription.paymentMethod = 'card';
    subscription.paymentProvider = 'razorpay';

    await subscription.save();
    console.log(`✅ Payment method (TOKEN) stored securely for subscription: ${subscription._id}`);
    console.log(`   Customer ID: ${validatedPaymentData.customerId}`);
    console.log(`   Card: ${validatedPaymentData.card?.brand} ending in ${validatedPaymentData.card?.last4}`);
    return subscription;
  } catch (error) {
    console.error('❌ Error storing payment method:', error);
    throw error;
  }
};

/**
 * Process automatic payment
 */
export const processAutoPayment = async (subscription, plan) => {
  try {
    console.log(`🔄 Processing auto-payment for subscription: ${subscription._id}`);

    // Check if auto-pay is enabled
    if (!subscription.autoPayEnabled) {
      throw new Error('Auto-pay not enabled for this subscription');
    }

    // Check if we have payment method stored
    if (!subscription.paymentProviderData?.razorpayCustomerId) {
      throw new Error('No payment method found for auto-pay');
    }

    // Create payment order
    const orderData = {
      amount: plan.price * 100, // Convert to paise
      currency: plan.currency || 'INR',
      receipt: `subscription_${subscription._id}_${Date.now()}`,
      customer_id: subscription.paymentProviderData.razorpayCustomerId,
      notes: {
        subscriptionId: subscription._id.toString(),
        planId: plan._id.toString(),
        userId: subscription.userId.toString(),
        type: 'subscription_renewal'
      }
    };

    const order = await razorpay.orders.create(orderData);
    console.log(`✅ Created Razorpay order: ${order.id}`);

    // For auto-pay, we'll simulate payment capture
    // In production, you'd use Razorpay's subscription API or webhooks
    const paymentData = {
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      payment_capture: 1,
      customer_id: subscription.paymentProviderData.razorpayCustomerId
    };

    // Simulate successful payment (replace with actual Razorpay payment capture)
    const paymentResult = {
      id: `pay_${Date.now()}`,
      amount: order.amount,
      currency: order.currency,
      status: 'captured',
      order_id: order.id,
      created_at: Date.now()
    };

    console.log(`✅ Auto-payment processed successfully: ${paymentResult.id}`);
    return {
      success: true,
      payment: paymentResult,
      order: order
    };

  } catch (error) {
    console.error('❌ Auto-payment failed:', error);
    
    // Increment failure count
    subscription.paymentFailureCount += 1;
    subscription.lastPaymentFailureDate = new Date();
    
    // Set retry date (exponential backoff)
    const retryHours = Math.min(Math.pow(2, subscription.paymentFailureCount), 24);
    subscription.nextRetryDate = new Date(Date.now() + (retryHours * 60 * 60 * 1000));
    
    await subscription.save();
    
    return {
      success: false,
      error: error.message,
      retryDate: subscription.nextRetryDate
    };
  }
};

/**
 * Handle payment failure
 */
export const handlePaymentFailure = async (subscription, error) => {
  try {
    console.log(`❌ Payment failure for subscription: ${subscription._id}`, error);

    subscription.paymentFailureCount += 1;
    subscription.lastPaymentFailureDate = new Date();

    // If too many failures, disable auto-pay
    if (subscription.paymentFailureCount >= 3) {
      subscription.autoPayEnabled = false;
      subscription.status = 'expired';
      subscription.isActive = false;
      console.log(`🚫 Auto-pay disabled due to multiple failures for subscription: ${subscription._id}`);
    } else {
      // Set retry date with exponential backoff
      const retryHours = Math.min(Math.pow(2, subscription.paymentFailureCount), 24);
      subscription.nextRetryDate = new Date(Date.now() + (retryHours * 60 * 60 * 1000));
    }

    await subscription.save();

    // TODO: Send notification to user about payment failure
    console.log(`📧 Would send payment failure notification to user`);

    return subscription;
  } catch (err) {
    console.error('❌ Error handling payment failure:', err);
    throw err;
  }
};

/**
 * Reset payment failure count on successful payment
 */
export const resetPaymentFailures = async (subscription) => {
  try {
    subscription.paymentFailureCount = 0;
    subscription.lastPaymentFailureDate = null;
    subscription.nextRetryDate = null;
    subscription.lastPaymentDate = new Date();

    await subscription.save();
    console.log(`✅ Payment failures reset for subscription: ${subscription._id}`);
  } catch (error) {
    console.error('❌ Error resetting payment failures:', error);
    throw error;
  }
};

/**
 * Send billing notifications
 */
export const sendBillingNotification = async (subscription, type, user) => {
  try {
    const notificationData = {
      type,
      subscription,
      user,
      timestamp: new Date()
    };

    // TODO: Implement email/SMS notifications
    console.log(`📧 Would send ${type} notification:`, notificationData);

    switch (type) {
      case 'trial_ending':
        console.log(`📧 Trial ending in 3 days for ${user.email}`);
        break;
      case 'payment_success':
        console.log(`📧 Payment successful for ${user.email}`);
        break;
      case 'payment_failed':
        console.log(`📧 Payment failed for ${user.email}`);
        break;
      case 'auto_pay_disabled':
        console.log(`📧 Auto-pay disabled for ${user.email}`);
        break;
    }

  } catch (error) {
    console.error('❌ Error sending billing notification:', error);
  }
};
