import cron from 'node-cron';
import Subscription from '../models/subscription.js';
import EnhancedUser from '../models/enhancedUser.js';
import SubscriptionTransaction from '../models/SubscriptionTransaction.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import {
  processAutoPayment,
  handlePaymentFailure,
  resetPaymentFailures,
  sendBillingNotification
} from '../services/autoPayService.js';

/**
 * Background job to handle subscription lifecycle
 * - Expire trials that have ended
 * - Send notifications for upcoming trial expirations
 * - Handle subscription renewals
 */
export const startSubscriptionCleanupJob = () => {
  console.log('🕐 Starting subscription cleanup job...');
  
  // Run every hour to check trial expirations and auto-payments
  cron.schedule('0 * * * *', async () => {
    console.log('🔄 Running subscription cleanup job...');
    try {
      await checkTrialExpirations();
      await processAutoPayments();
      await checkUpcomingTrialExpirations();
    } catch (error) {
      console.error('❌ Subscription cleanup job failed:', error);
    }
  });
  
  console.log('✅ Subscription cleanup job started (runs every hour)');
};

/**
 * Check and expire trials that have ended
 */
const checkTrialExpirations = async () => {
  try {
    const now = new Date();
    
    // Find all active trials that have expired
    const expiredTrials = await Subscription.find({
      status: 'trial',
      isTrialActive: true,
      trialEndDate: { $lt: now }
    }).populate('userId', 'firstName lastName email');

    console.log(`🔍 Found ${expiredTrials.length} expired trials`);

    for (const subscription of expiredTrials) {
      // Check if auto-pay is enabled
      if (subscription.autoPayEnabled && subscription.paymentProviderData?.razorpayCustomerId) {
        try {
          // Get the plan details
          const plan = await SubscriptionPlan.findById(subscription.planId);
          if (plan) {
            // Process automatic payment
            const paymentResult = await processAutoPayment(subscription, plan);
            
            if (paymentResult.success) {
              // Payment successful - convert trial to active subscription
              subscription.status = 'active';
              subscription.isActive = true;
              subscription.isTrialActive = false;
              subscription.startDate = now;
              
              // Calculate next billing date
              const nextBillingDate = new Date();
              switch (plan.billingCycle) {
                case 'monthly':
                  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
                  break;
                case 'yearly':
                  nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
                  break;
                default:
                  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
              }
              
              subscription.endDate = nextBillingDate;
              subscription.nextBillingDate = nextBillingDate;
              subscription.autoRenew = true;
              subscription.lastPaymentDate = now;
              
              await subscription.save();
              
              // Reset payment failures
              await resetPaymentFailures(subscription);
              
              // Send success notification
              await sendBillingNotification(subscription, 'payment_success', subscription.userId);
              
              console.log(`✅ Auto-payment successful for user ${subscription.userId.email} - trial converted to active subscription`);
              continue; // Skip the expiration logic
            } else {
              // Payment failed - handle failure
              await handlePaymentFailure(subscription, paymentResult.error);
              await sendBillingNotification(subscription, 'payment_failed', subscription.userId);
            }
          }
        } catch (error) {
          console.error(`❌ Auto-payment error for subscription ${subscription._id}:`, error);
          await handlePaymentFailure(subscription, error.message);
        }
      }
      
      // If we reach here, either auto-pay is disabled or payment failed
      // Expire the trial
      subscription.status = 'expired';
      subscription.isTrialActive = false;
      subscription.isActive = false;
      await subscription.save();

      // Remove active subscription reference from user
      await EnhancedUser.findByIdAndUpdate(
        subscription.userId._id,
        { $unset: { activeSubscription: 1 } }
      );

      // Create expiration transaction record
      const expirationTransaction = new SubscriptionTransaction({
        userId: subscription.userId._id,
        subscriptionId: subscription.planId,
        amount: 0,
        currency: 'INR',
        paymentMethod: 'trial',
        status: 'completed',
        type: 'trial_expiration',
        processedAt: now,
        billingCycle: subscription.billingCycle,
        isTrialTransaction: true,
        trialStartDate: subscription.trialStartDate,
        trialEndDate: subscription.trialEndDate,
        autoRenewalEnabled: false,
        paymentProvider: 'system'
      });

      await expirationTransaction.save();

      console.log(`⏰ Expired trial for user ${subscription.userId.email} (${subscription.userId.firstName} ${subscription.userId.lastName})`);
    }

    if (expiredTrials.length > 0) {
      console.log(`✅ Successfully expired ${expiredTrials.length} trials`);
    }

  } catch (error) {
    console.error('❌ Error checking trial expirations:', error);
  }
};

/**
 * Process automatic payments for subscriptions due for renewal
 */
const processAutoPayments = async () => {
  try {
    const now = new Date();
    
    // Find subscriptions that are due for auto-payment
    const subscriptionsDueForPayment = await Subscription.find({
      status: 'active',
      autoRenew: true,
      autoPayEnabled: true,
      nextBillingDate: { $lte: now },
      paymentFailureCount: { $lt: 3 } // Don't retry if too many failures
    }).populate('userId', 'firstName lastName email').populate('planId');

    console.log(`💳 Found ${subscriptionsDueForPayment.length} subscriptions due for auto-payment`);

    for (const subscription of subscriptionsDueForPayment) {
      try {
        // Process automatic payment
        const paymentResult = await processAutoPayment(subscription, subscription.planId);
        
        if (paymentResult.success) {
          // Payment successful - update subscription
          subscription.lastPaymentDate = now;
          
          // Calculate next billing date
          const nextBillingDate = new Date();
          switch (subscription.planId.billingCycle) {
            case 'monthly':
              nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
              break;
            case 'yearly':
              nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
              break;
            default:
              nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          }
          
          subscription.endDate = nextBillingDate;
          subscription.nextBillingDate = nextBillingDate;
          
          await subscription.save();
          
          // Reset payment failures
          await resetPaymentFailures(subscription);
          
          // Send success notification
          await sendBillingNotification(subscription, 'payment_success', subscription.userId);
          
          console.log(`✅ Auto-payment successful for subscription ${subscription._id} - next billing: ${nextBillingDate}`);
        } else {
          // Payment failed - handle failure
          await handlePaymentFailure(subscription, paymentResult.error);
          await sendBillingNotification(subscription, 'payment_failed', subscription.userId);
          
          console.log(`❌ Auto-payment failed for subscription ${subscription._id} - failure count: ${subscription.paymentFailureCount + 1}`);
        }
      } catch (error) {
        console.error(`❌ Error processing auto-payment for subscription ${subscription._id}:`, error);
        await handlePaymentFailure(subscription, error.message);
      }
    }

    if (subscriptionsDueForPayment.length > 0) {
      console.log(`✅ Processed auto-payments for ${subscriptionsDueForPayment.length} subscriptions`);
    }

  } catch (error) {
    console.error('❌ Error processing auto-payments:', error);
  }
};

/**
 * Check for trials expiring soon and send notifications
 */
const checkUpcomingTrialExpirations = async () => {
  try {
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000));

    // Find trials expiring in 1 day
    const trialsExpiringSoon = await Subscription.find({
      status: 'trial',
      isTrialActive: true,
      trialEndDate: { 
        $gte: oneDayFromNow,
        $lt: threeDaysFromNow
      }
    }).populate('userId', 'firstName lastName email');

    // Find trials expiring in 3 days
    const trialsExpiringIn3Days = await Subscription.find({
      status: 'trial',
      isTrialActive: true,
      trialEndDate: { 
        $gte: threeDaysFromNow,
        $lt: new Date(now.getTime() + (4 * 24 * 60 * 60 * 1000))
      }
    }).populate('userId', 'firstName lastName email');

    console.log(`📧 Found ${trialsExpiringSoon.length} trials expiring in 1 day`);
    console.log(`📧 Found ${trialsExpiringIn3Days.length} trials expiring in 3 days`);

    // TODO: Implement email notifications here
    // For now, just log the notifications that would be sent
    for (const subscription of trialsExpiringSoon) {
      console.log(`📧 Would send 1-day expiration notice to ${subscription.userId.email}`);
    }

    for (const subscription of trialsExpiringIn3Days) {
      console.log(`📧 Would send 3-day expiration notice to ${subscription.userId.email}`);
    }

  } catch (error) {
    console.error('❌ Error checking upcoming trial expirations:', error);
  }
};

/**
 * Get subscription statistics
 */
export const getSubscriptionStats = async () => {
  try {
    const stats = await Subscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'active'] },
                { $multiply: ['$amount', 1] }, // Assuming amount field exists
                0
              ]
            }
          }
        }
      }
    ]);

    return stats;
  } catch (error) {
    console.error('❌ Error getting subscription stats:', error);
    return [];
  }
};

export default startSubscriptionCleanupJob;
