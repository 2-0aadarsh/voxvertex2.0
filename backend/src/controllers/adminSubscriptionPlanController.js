import SubscriptionPlan from '../models/SubscriptionPlan.js';
import mongoose from 'mongoose';

// Create new subscription plan (Admin only)
export const createSubscriptionPlan = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      currency = 'INR',
      billingCycle,
      billingPeriod,
      trialDays = 7,
      features = [],
      originalPrice,
      discountText,
      isPopular = false,
      sortOrder = 0,
      maxEvents,
      maxSpeakers
    } = req.body;

    // Validation
    if (!name || !description || !price || !billingCycle || !billingPeriod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, price, billingCycle, billingPeriod'
      });
    }

    if (!Array.isArray(features) || features.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Features array is required and must contain at least one feature'
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
    }

    // Check if plan with same name already exists
    const existingPlan = await SubscriptionPlan.findOne({ name: name.trim() });
    if (existingPlan) {
      return res.status(409).json({
        success: false,
        message: 'Plan with this name already exists'
      });
    }

    // Create new subscription plan
    const subscriptionPlan = new SubscriptionPlan({
      name: name.trim(),
      description: description.trim(),
      price,
      currency,
      billingCycle,
      billingPeriod: billingPeriod.trim(),
      trialDays,
      features: features.map(feature => feature.trim()),
      originalPrice,
      discountText: discountText?.trim(),
      isPopular,
      sortOrder,
      maxEvents,
      maxSpeakers,
      createdBy: req.user._id,
      lastModifiedBy: req.user._id
    });

    await subscriptionPlan.save();

    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      data: subscriptionPlan
    });

  } catch (error) {
    console.error('Error creating subscription plan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all subscription plans (Admin only - includes inactive)
export const getAllSubscriptionPlans = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'sortOrder', 
      sortOrder = 'asc',
      status = 'all' // 'all', 'active', 'inactive'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Build query based on status filter
    let query = {};
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const plans = await SubscriptionPlan.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SubscriptionPlan.countDocuments(query);

    res.status(200).json({
      success: true,
      data: plans,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPlans: total,
        hasNext: skip + plans.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get subscription plan by ID (Admin only)
export const getSubscriptionPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan ID format'
      });
    }

    const plan = await SubscriptionPlan.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    res.status(200).json({
      success: true,
      data: plan
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

// Update subscription plan (Admin only)
export const updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan ID format'
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.createdBy;

    // Add lastModifiedBy
    updateData.lastModifiedBy = req.user._id;

    // Validate features array if provided
    if (updateData.features && (!Array.isArray(updateData.features) || updateData.features.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Features must be a non-empty array'
      });
    }

    // Check for name uniqueness if name is being updated
    if (updateData.name) {
      const existingPlan = await SubscriptionPlan.findOne({ 
        name: updateData.name.trim(),
        _id: { $ne: id }
      });
      if (existingPlan) {
        return res.status(409).json({
          success: false,
          message: 'Plan with this name already exists'
        });
      }
    }

    const plan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email')
     .populate('lastModifiedBy', 'firstName lastName email');

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: plan
    });

  } catch (error) {
    console.error('Error updating subscription plan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete subscription plan (Admin only - soft delete)
export const deleteSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan ID format'
      });
    }

    const plan = await SubscriptionPlan.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        lastModifiedBy: req.user._id
      },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription plan deactivated successfully',
      data: plan
    });

  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Toggle plan status (Admin only)
export const togglePlanStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan ID format'
      });
    }

    const plan = await SubscriptionPlan.findById(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    plan.isActive = !plan.isActive;
    plan.lastModifiedBy = req.user._id;
    await plan.save();

    res.status(200).json({
      success: true,
      message: `Plan ${plan.isActive ? 'activated' : 'deactivated'} successfully`,
      data: plan
    });

  } catch (error) {
    console.error('Error toggling plan status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
