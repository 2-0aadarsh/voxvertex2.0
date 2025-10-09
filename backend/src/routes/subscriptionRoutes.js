import express from 'express';
import { 
  createSubscription, 
  getAllPlans, 
  assignSubscriptionToUser,
  verifyPaymentAndStartTrial,
  startTrialSubscription,
  upgradeSubscription,
  createSubscriptionPaymentOrder,
  verifySubscriptionPayment,
  getSubscriptionStatus,
  cancelSubscription,
  subscribeToPlan,
  changeSubscriptionPlan,
  razorpayWebhook
} from '../controllers/subscriptionController.js';

const router = express.Router();

// Get all active subscription plans
router.get('/plans', getAllPlans);

// Create new subscription plan (Admin only)
router.post('/plans', createSubscription);

// ✨ NEW: Payment Validation Flow (₹1 Authorization) - RECOMMENDED
router.post('/verify-and-start-trial', verifyPaymentAndStartTrial);  // Step 2: Verify & start trial

// Legacy: Start trial without validation (deprecated - use validate-payment flow)
router.post('/start-trial', startTrialSubscription);

// Upgrade from trial to paid subscription
router.post('/upgrade', upgradeSubscription);

// Create payment order for subscription upgrade
router.post('/payment/create-order', createSubscriptionPaymentOrder);

// Verify subscription payment
router.post('/payment/verify', verifySubscriptionPayment);

// Get subscription status for user
router.get('/status/:userId', getSubscriptionStatus);

// Cancel subscription
router.post('/cancel', cancelSubscription);

// Change subscription plan
router.post('/change-plan', changeSubscriptionPlan);

// Subscribe to plan
router.post('/subscribe', subscribeToPlan);

// Legacy route for backward compatibility
router.post('/assign', assignSubscriptionToUser);

// Razorpay webhook
router.post('/webhook', razorpayWebhook);

// Legacy route for backward compatibility
router.get('/', getAllPlans);

export default router;
