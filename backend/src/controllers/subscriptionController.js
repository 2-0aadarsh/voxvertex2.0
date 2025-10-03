import EnhancedUser from '../models/enhancedUser.js';
import Subscription from '../models/Subscription.js';
import Transaction from '../models/Transaction.js';



export const createSubscription = async (req, res) => {
  try {
    const { name, planType, pricePerMonth, totalAmount, billingPeriod, discountText } = req.body;

    const plan = new Subscription({
      name,
      planType,
      pricePerMonth,
      totalAmount,
      billingPeriod,
      discountText
    });

    await plan.save();
    res.status(201).json({ message: "Plan created successfully", plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// List all plans
export const getAllPlans = async (req, res) => {
  try {
    const plans = await Subscription.find();
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching plans', error: err.message });
  }
};

export const assignSubscriptionToUser = async (req, res) => {
  try {
    const { userId, planId, autoRenewal } = req.body;

    // find subscription plan
    const plan = await Subscription.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }

    // calculate endDate
    let endDate = new Date();
    if (plan.planType === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.planType === "6months") {
      endDate.setMonth(endDate.getMonth() + 6);
    } else if (plan.planType === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // update or create enhanced user subscription
    const enhancedUser = await EnhancedUser.findOneAndUpdate(
      { userId },
      {
        subscription: {
          planId,
          startDate: new Date(),
          endDate,
          autoRenewal
        }
      },
      { upsert: true, new: true }
    ).populate("subscription.planId");

    res.status(200).json({
      message: "Subscription assigned successfully",
      subscription: enhancedUser.subscription
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
