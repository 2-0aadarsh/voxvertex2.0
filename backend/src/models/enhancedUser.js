import mongoose from "mongoose";

// Enhanced User Schema with role-based functionality

const paymentMethodSchema = new mongoose.Schema({
  type: { type: String, enum: ["card", "paypal", "upi", "netbanking"], required: true },
  details: { type: Object, required: true }, // store masked or tokenized data (never raw card PAN in production)
  isDefault: { type: Boolean, default: false },
  addedAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false } // For bank account verification flows
}, { _id: true });


const enhancedUserSchema = new mongoose.Schema({
  // Basic Information (unchangeable after registration)
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  mobileNo: {
    type: String,
    required: false,
    unique: false,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  
  // Profile Information (editable)
  profileImage: {
    data: Buffer,
    contentType: String
  },
  profileImageUrl: {
    type: String,
    trim: true
  },
  cloudinaryPublicId: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true
  },
  professionalTitle: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  areaOfExpertise: [{
    type: String,
    trim: true
  }],
  yearsOfExperience: {
    type: Number,
    default: 0,
    min: 0,
    max: 50
  },
  
  // Role Information
  role: {
    type: String,
    enum: ["participant", "speaker", "organizer"],
    required: true
  },
  
  // Role-specific data
  roleSpecificData: {
    // For speakers
    workEmail: {
      type: String,
      validate: {
        validator: function(value) {
          if (this.role === "speaker") {
            return value && value.trim() !== "";
          }
          return true;
        },
        message: "Work email is required for speakers"
      }
    },
    
    // Industry and specialization
    industry: {
      type: String,
      enum: [
        "technology", "healthcare", "finance", "education", "business",
        "engineering", "art", "law", "marketing", "environmental",
        "manufacturing", "social", "retail", "energy", "realestate"
      ]
    },
    
    activities: [{
      type: String,
      trim: true
    }],
    
    // Social links and URLs
    socialLinks: {
      linkedin: String,
      twitter: String,
      website: String,
      portfolio: String
    }
  },
  // Payment Information
  paymentMethods: [paymentMethodSchema],

wallet: {
  availableBalance: { type: Number, default: 0 },
  pendingBalance: { type: Number, default: 0 }
},
transactions: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Transaction'
}],
subscription: {
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: false },
  paymentMethod: { type: String, enum: ['card', 'paypal', 'upi', 'wallet'] },
  autoRenew: { type: Boolean, default: false }
},
  
  // Account Status
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isMobileVerified: {
    type: Boolean,
    default: false
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  signupComplete: {
    type: Boolean,
    default: false
  },
  
  // Account Activity
  lastLogin: Date,
  accountStatus: {
    type: String,
    enum: ["active", "suspended", "deactivated"],
    default: "active"
  },
  
  // User Engagement Tracking
  likedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedPost'
  }],
  commentedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedPost'
  }]
}, {
  timestamps: true
});

// Indexes for better performance (email and mobileNo already indexed via unique: true)
enhancedUserSchema.index({ role: 1 });
enhancedUserSchema.index({ 
  firstName: 'text', 
  lastName: 'text', 
  professionalTitle: 'text',
  bio: 'text'
});

// Virtual for full name
enhancedUserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to check if profile is complete
enhancedUserSchema.methods.checkProfileCompleteness = function() {
  const requiredFields = ['bio', 'professionalTitle', 'location'];
  const isComplete = requiredFields.every(field => this[field] && this[field].trim() !== '');
  
  this.isProfileComplete = isComplete;
  return isComplete;
};

// Method to update last login
enhancedUserSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Method to add liked post
enhancedUserSchema.methods.addLikedPost = function(postId) {
  if (!this.likedPosts) {
    this.likedPosts = [];
  }
  if (!this.likedPosts.includes(postId)) {
    this.likedPosts.push(postId);
    return this.save();
  }
  return this;
};

// Method to remove liked post
enhancedUserSchema.methods.removeLikedPost = function(postId) {
  if (!this.likedPosts) {
    this.likedPosts = [];
  }
  this.likedPosts = this.likedPosts.filter(id => id.toString() !== postId.toString());
  return this.save();
};

// Method to add commented post
enhancedUserSchema.methods.addCommentedPost = function(postId) {
  if (!this.commentedPosts) {
    this.commentedPosts = [];
  }
  if (!this.commentedPosts.includes(postId)) {
    this.commentedPosts.push(postId);
    return this.save();
  }
  return this;
};

// Add funds
enhancedUserSchema.methods.addFunds = async function(amount, paymentMethod) {
  const Transaction = mongoose.model('Transaction');
  const transaction = await Transaction.create({
    user: this._id,
    amount,
    type: 'add',
    status: 'completed', // you can simulate pending if needed
    paymentMethod
  });

  this.pendingBalance += amount;
  this.transactions.push(transaction._id);
  await this.save();
  return transaction;
};
// Helper: add payment method (instance method)
enhancedUserSchema.methods.addPaymentMethod = async function (pm) {
  // pm: { type, details, isDefault }
  if (pm.isDefault) {
    this.paymentMethods.forEach(m => m.isDefault = false);
  }
  this.paymentMethods.push(pm);
  await this.save();
  return this.paymentMethods[this.paymentMethods.length - 1];
};

// Helper: get a payment method by id
enhancedUserSchema.methods.getPaymentMethodById = function (paymentMethodId) {
  return this.paymentMethods.id(paymentMethodId);
};

// Add funds helper (creates a transaction in provider and updates balances)
enhancedUserSchema.methods.creditPending = async function (amount) {
  // move amount to pendingBalance
  this.wallet.pendingBalance += amount;
  await this.save();
  return this.wallet;
};

// Move pending -> available (clear funds)
enhancedUserSchema.methods.clearPendingToAvailable = async function (amount) {
  if (this.wallet.pendingBalance < amount) throw new Error('Not enough pending balance');
  this.wallet.pendingBalance -= amount;
  this.wallet.availableBalance += amount;
  await this.save();
  return this.wallet;
};

// Subscribe to plan
// enhancedUserSchema.methods.subscribeToPlan = async function(planId, paymentMethod) {
//   const SubscriptionPlan = mongoose.model('SubscriptionPlan');
//   const Transaction = mongoose.model('Transaction');

//   const plan = await SubscriptionPlan.findById(planId);
//   if (!plan) throw new Error('Plan not found');

//   const startDate = new Date();
//   const endDate = new Date(startDate.getTime() + plan.trialDays * 24*60*60*1000);

//   this.subscription = {
//     plan: planId,
//     startDate,
//     endDate,
//     isActive: true,
//     paymentMethod,
//     autoRenew: true
//   };

//   // Create transaction (0 for trial)
//   const transaction = await Transaction.create({
//     user: this._id,
//     amount: 0,
//     type: 'subscription',
//     status: 'completed',
//     paymentMethod
//   });

//   this.transactions.push(transaction._id);
//   await this.save();
//   return { subscription: this.subscription, transaction };
// };


const EnhancedUser = mongoose.models.EnhancedUser || mongoose.model("EnhancedUser", enhancedUserSchema);
export default EnhancedUser;

