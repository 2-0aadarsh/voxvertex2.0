import mongoose from "mongoose";

const SubscriptionPlanSchema = new mongoose.Schema({
  // Basic Plan Information
  name: { 
    type: String, 
    required: [true, "Plan name is required"],
    trim: true,
    maxlength: [100, "Plan name cannot exceed 100 characters"]
  },
  
  description: { 
    type: String, 
    required: [true, "Plan description is required"],
    trim: true,
    maxlength: [500, "Plan description cannot exceed 500 characters"]
  },
  
  // Pricing Information
  price: { 
    type: Number, 
    required: [true, "Plan price is required"],
    min: [0, "Price cannot be negative"]
  },
  
  currency: { 
    type: String, 
    required: true,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  
  // Billing Configuration
  billingCycle: { 
    type: String, 
    required: [true, "Billing cycle is required"],
    enum: ["monthly", "quarterly", "6months", "yearly"],
    default: "monthly"
  },
  
  billingPeriod: { 
    type: String, 
    required: true,
    trim: true
  }, // e.g., "Billed monthly", "Billed annually"
  
  // Trial Configuration
  trialDays: { 
    type: Number, 
    default: 7,
    min: [0, "Trial days cannot be negative"],
    max: [365, "Trial period cannot exceed 365 days"]
  },
  
  // Plan Features
  features: [{
    type: String,
    trim: true,
    required: true
  }],
  
  // Discount Information (optional)
  originalPrice: { 
    type: Number,
    min: [0, "Original price cannot be negative"]
  },
  
  discountPercentage: { 
    type: Number,
    min: [0, "Discount percentage cannot be negative"],
    max: [100, "Discount percentage cannot exceed 100%"]
  },
  
  discountText: { 
    type: String,
    trim: true,
    maxlength: [200, "Discount text cannot exceed 200 characters"]
  },
  
  // Plan Status and Configuration
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  isPopular: { 
    type: Boolean, 
    default: false 
  },
  
  sortOrder: { 
    type: Number, 
    default: 0 
  }, // For ordering plans on pricing page
  
  // Plan Limits (optional)
  maxEvents: { 
    type: Number,
    default: null // null means unlimited
  },
  
  maxSpeakers: { 
    type: Number,
    default: null // null means unlimited
  },
  
  // Metadata
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EnhancedUser',
    required: true
  },
  
  lastModifiedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EnhancedUser'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
SubscriptionPlanSchema.index({ isActive: 1, sortOrder: 1 });
SubscriptionPlanSchema.index({ billingCycle: 1 });
SubscriptionPlanSchema.index({ isPopular: 1 });

// Virtual for calculated discount
SubscriptionPlanSchema.virtual('hasDiscount').get(function() {
  return this.originalPrice && this.originalPrice > this.price;
});

// Virtual for savings amount
SubscriptionPlanSchema.virtual('savingsAmount').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return this.originalPrice - this.price;
  }
  return 0;
});

// Pre-save middleware to calculate discount percentage
SubscriptionPlanSchema.pre('save', function(next) {
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discountPercentage = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

// Static method to get active plans
SubscriptionPlanSchema.statics.getActivePlans = function() {
  return this.find({ isActive: true }).sort({ sortOrder: 1, price: 1 });
};

// Static method to get popular plans
SubscriptionPlanSchema.statics.getPopularPlans = function() {
  return this.find({ isActive: true, isPopular: true }).sort({ sortOrder: 1 });
};

export default mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);

