import Subscription from '../models/subscription.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';

/**
 * Middleware to check if user has active subscription
 * Used for protecting Pro features
 */
export const requireActiveSubscription = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find user's active subscription
    const subscription = await Subscription.findOne({
      userId: userId,
      status: { $in: ['trial', 'active'] },
      isActive: true
    }).populate('planId');

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required',
        error: 'SUBSCRIPTION_REQUIRED',
        requiredAction: 'subscribe'
      });
    }

    // Check if trial has expired
    if (subscription.status === 'trial' && subscription.trialEndDate < new Date()) {
      // Update subscription status to expired
      subscription.status = 'expired';
      subscription.isTrialActive = false;
      subscription.isActive = false;
      await subscription.save();

      return res.status(403).json({
        success: false,
        message: 'Trial period has expired',
        error: 'TRIAL_EXPIRED',
        requiredAction: 'upgrade',
        trialEndDate: subscription.trialEndDate
      });
    }

    // Attach subscription info to request
    req.subscription = subscription;
    next();

  } catch (error) {
    console.error('❌ Subscription middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking subscription status'
    });
  }
};

/**
 * Middleware to check if user has Pro plan features
 * More restrictive than just active subscription
 */
export const requireProPlan = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find user's active subscription with plan details
    const subscription = await Subscription.findOne({
      userId: userId,
      status: { $in: ['trial', 'active'] },
      isActive: true
    }).populate('planId');

    if (!subscription || !subscription.planId) {
      return res.status(403).json({
        success: false,
        message: 'Pro plan subscription required',
        error: 'PRO_PLAN_REQUIRED',
        requiredAction: 'upgrade_to_pro'
      });
    }

    // Check if plan has Pro features (you can customize this logic)
    const plan = subscription.planId;
    
    // For now, assume all plans are Pro plans
    // You can add specific plan checks here
    if (!plan.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Subscription plan is not active',
        error: 'PLAN_INACTIVE'
      });
    }

    // Check trial expiration
    if (subscription.status === 'trial' && subscription.trialEndDate < new Date()) {
      subscription.status = 'expired';
      subscription.isTrialActive = false;
      subscription.isActive = false;
      await subscription.save();

      return res.status(403).json({
        success: false,
        message: 'Trial period has expired. Please upgrade to continue using Pro features.',
        error: 'TRIAL_EXPIRED',
        requiredAction: 'upgrade',
        trialEndDate: subscription.trialEndDate
      });
    }

    req.subscription = subscription;
    req.plan = plan;
    next();

  } catch (error) {
    console.error('❌ Pro plan middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking Pro plan status'
    });
  }
};

/**
 * Middleware to check subscription limits
 * Useful for features with usage limits
 */
export const checkSubscriptionLimits = (limitType) => {
  return async (req, res, next) => {
    try {
      const subscription = req.subscription;
      const plan = req.plan;

      if (!subscription || !plan) {
        return res.status(403).json({
          success: false,
          message: 'Subscription required to check limits'
        });
      }

      // Check specific limits based on limitType
      switch (limitType) {
        case 'events':
          if (plan.maxEvents) {
            // TODO: Count user's current events and compare with plan.maxEvents
            // For now, just pass through
          }
          break;
        
        case 'speakers':
          if (plan.maxSpeakers) {
            // TODO: Count user's current speakers and compare with plan.maxSpeakers
            // For now, just pass through
          }
          break;
        
        default:
          break;
      }

      next();

    } catch (error) {
      console.error('❌ Subscription limits middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking subscription limits'
      });
    }
  };
};

/**
 * Get user's subscription status for frontend
 */
export const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const subscription = await Subscription.findOne({
      userId: userId
    }).populate('planId');

    if (!subscription) {
      return res.json({
        success: true,
        hasSubscription: false,
        subscription: null,
        status: 'none'
      });
    }

    const now = new Date();
    let status = subscription.status;

    // Check if trial has expired
    if (subscription.status === 'trial' && subscription.trialEndDate < now) {
      status = 'expired';
      // Update subscription in database
      subscription.status = 'expired';
      subscription.isTrialActive = false;
      subscription.isActive = false;
      await subscription.save();
    }

    const daysRemaining = subscription.trialEndDate 
      ? Math.ceil((subscription.trialEndDate - now) / (1000 * 60 * 60 * 24))
      : 0;

    res.json({
      success: true,
      hasSubscription: true,
      subscription: {
        id: subscription._id,
        status: status,
        isActive: subscription.isActive,
        isTrialActive: subscription.isTrialActive,
        trialEndDate: subscription.trialEndDate,
        daysRemaining: Math.max(0, daysRemaining),
        plan: subscription.planId,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        billingCycle: subscription.billingCycle,
        autoRenew: subscription.autoRenew
      }
    });

  } catch (error) {
    console.error('❌ Error getting subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving subscription status'
    });
  }
};

