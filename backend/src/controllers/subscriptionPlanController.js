import SubscriptionPlan from '../models/SubscriptionPlan.js';
import mongoose from 'mongoose';

// Get all active subscription plans (Public)
export const getActiveSubscriptionPlans = async (req, res) => {
  try {
    const { 
      billingCycle, 
      sortBy = 'sortOrder', 
      sortOrder = 'asc',
      popularOnly = false 
    } = req.query;

    // Build query for active plans
    let query = { isActive: true };

    // Filter by billing cycle if provided
    if (billingCycle) {
      query.billingCycle = billingCycle;
    }

    // Filter for popular plans only if requested
    if (popularOnly === 'true') {
      query.isPopular = true;
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === 'price') {
      sortOptions.price = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.sortOrder = sortOrder === 'desc' ? -1 : 1;
      sortOptions.price = 1; // Secondary sort by price
    }

    const plans = await SubscriptionPlan.find(query)
      .select('-createdBy -lastModifiedBy -__v') // Exclude admin-only fields
      .sort(sortOptions);

    // Transform data for public consumption
    const publicPlans = plans.map(plan => ({
      _id: plan._id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      billingPeriod: plan.billingPeriod,
      trialDays: plan.trialDays,
      features: plan.features,
      originalPrice: plan.originalPrice,
      discountPercentage: plan.discountPercentage,
      discountText: plan.discountText,
      isPopular: plan.isPopular,
      hasDiscount: plan.hasDiscount,
      savingsAmount: plan.savingsAmount,
      maxEvents: plan.maxEvents,
      maxSpeakers: plan.maxSpeakers
    }));

    res.status(200).json({
      success: true,
      message: 'Active subscription plans retrieved successfully',
      count: publicPlans.length,
      data: publicPlans
    });

  } catch (error) {
    console.error('Error fetching active subscription plans:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get popular subscription plans only (Public)
export const getPopularSubscriptionPlans = async (req, res) => {
  try {
    const { sortBy = 'sortOrder', sortOrder = 'asc' } = req.query;

    const sortOptions = {};
    if (sortBy === 'price') {
      sortOptions.price = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.sortOrder = sortOrder === 'desc' ? -1 : 1;
      sortOptions.price = 1;
    }

    const plans = await SubscriptionPlan.find({ 
      isActive: true, 
      isPopular: true 
    })
      .select('-createdBy -lastModifiedBy -__v')
      .sort(sortOptions);

    const publicPlans = plans.map(plan => ({
      _id: plan._id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      billingPeriod: plan.billingPeriod,
      trialDays: plan.trialDays,
      features: plan.features,
      originalPrice: plan.originalPrice,
      discountPercentage: plan.discountPercentage,
      discountText: plan.discountText,
      isPopular: plan.isPopular,
      hasDiscount: plan.hasDiscount,
      savingsAmount: plan.savingsAmount,
      maxEvents: plan.maxEvents,
      maxSpeakers: plan.maxSpeakers
    }));

    res.status(200).json({
      success: true,
      message: 'Popular subscription plans retrieved successfully',
      count: publicPlans.length,
      data: publicPlans
    });

  } catch (error) {
    console.error('Error fetching popular subscription plans:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get subscription plan by ID (Public)
export const getSubscriptionPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan ID format'
      });
    }

    const plan = await SubscriptionPlan.findOne({ 
      _id: id, 
      isActive: true 
    }).select('-createdBy -lastModifiedBy -__v');

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Active subscription plan not found'
      });
    }

    const publicPlan = {
      _id: plan._id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      billingPeriod: plan.billingPeriod,
      trialDays: plan.trialDays,
      features: plan.features,
      originalPrice: plan.originalPrice,
      discountPercentage: plan.discountPercentage,
      discountText: plan.discountText,
      isPopular: plan.isPopular,
      hasDiscount: plan.hasDiscount,
      savingsAmount: plan.savingsAmount,
      maxEvents: plan.maxEvents,
      maxSpeakers: plan.maxSpeakers
    };

    res.status(200).json({
      success: true,
      message: 'Subscription plan retrieved successfully',
      data: publicPlan
    });

  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

