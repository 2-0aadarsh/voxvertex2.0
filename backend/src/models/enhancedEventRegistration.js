import mongoose from "mongoose";

// Enhanced Event Registration Schema
const enhancedEventRegistrationSchema = new mongoose.Schema({
  // Event Reference
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedEvent',
    required: [true, "Event reference is required"]
  },

  // Ticket Tier Reference (specific ticket tier from the event)
  ticketTier: {
    tierId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Ticket tier ID is required"]
    },
    name: {
      type: String,
      required: [true, "Ticket tier name is required"],
      trim: true
    },
    price: {
      type: Number,
      required: [true, "Ticket tier price is required"],
      min: [0, "Price cannot be negative"]
    },
    quantityBooked: {
      type: Number,
      required: [true, "Quantity booked is required"],
      min: [1, "Must book at least 1 ticket"]
    }
  },

  // Primary Registrant (must be in database)
  registrant: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnhancedUser',
      required: [true, "Registrant user ID is required"]
    },
    name: {
      type: String,
      required: [true, "Registrant name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"]
    },
    email: {
      type: String,
      required: [true, "Registrant email is required"],
      trim: true,
      lowercase: true,
      maxlength: [100, "Email cannot exceed 100 characters"]
    },
    phone: {
      type: String,
      required: [true, "Registrant phone is required"],
      trim: true,
      maxlength: [20, "Phone cannot exceed 20 characters"]
    }
  },

  // Additional Participants (may or may not be in database)
  additionalParticipants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnhancedUser',
      default: null // null if user not in database
    },
    name: {
      type: String,
      required: [true, "Participant name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"]
    },
    email: {
      type: String,
      required: [true, "Participant email is required"],
      trim: true,
      lowercase: true,
      maxlength: [100, "Email cannot exceed 100 characters"]
    },
    phone: {
      type: String,
      required: [true, "Participant phone is required"],
      trim: true,
      maxlength: [20, "Phone cannot exceed 20 characters"]
    },
    isRegisteredUser: {
      type: Boolean,
      default: false // true if user exists in database
    }
  }],

  // Financial Details
  totalAmount: {
    type: Number,
    required: [true, "Total amount is required"],
    min: [0, "Amount cannot be negative"]
  },
  currency: {
    type: String,
    default: "INR",
    enum: ["INR", "USD"],
    required: true
  },

  // Payment Details
  paymentStatus: {
    type: String,
    enum: ["pending", "initiated", "paid", "failed", "refunded"],
    default: "pending",
    required: true
  },
  reservationExpiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  },
  reservationStatus: {
    type: String,
    enum: ['active', 'expired', 'converted', 'cancelled'],
    default: 'active'
  },
  paymentProvider: {
    type: String,
    enum: ["razorpay", "wallet", "free"],
    default: null
  },
  paymentProviderData: {
    // Razorpay data
    orderId: String,
    paymentId: String,
    signature: String,
    
    // Wallet data
    paymentMethodId: String,
    debitedAmount: Number,
    
    // General data
    transactionId: String,
    paymentDate: Date
  },

  // Registration Metadata
  registrationDate: {
    type: Date,
    default: Date.now
  },
  confirmationSent: {
    type: Boolean,
    default: false
  },
  confirmationSentAt: {
    type: Date
  },

  // Status and Notes
  status: {
    type: String,
    enum: ["active", "cancelled", "refunded"],
    default: "active"
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, "Notes cannot exceed 500 characters"]
  },

  // Cancellation Details
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser'
  },

  // Refund Details
  refundAmount: {
    type: Number,
    min: [0, "Refund amount cannot be negative"]
  },
  refundDate: {
    type: Date
  },
  refundReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total participants count
enhancedEventRegistrationSchema.virtual('totalParticipants').get(function() {
  return 1 + (this.additionalParticipants?.length || 0);
});

// Virtual for checking if registration is confirmed
enhancedEventRegistrationSchema.virtual('isConfirmed').get(function() {
  return this.paymentStatus === 'paid' && this.status === 'active';
});

// Virtual for checking if registration can be cancelled
enhancedEventRegistrationSchema.virtual('canBeCancelled').get(function() {
  return this.status === 'active' && this.paymentStatus === 'paid';
});

// Indexes for better query performance
enhancedEventRegistrationSchema.index({ event: 1, status: 1 });
enhancedEventRegistrationSchema.index({ 'registrant.userId': 1 });
enhancedEventRegistrationSchema.index({ 'registrant.email': 1 });
enhancedEventRegistrationSchema.index({ paymentStatus: 1 });
enhancedEventRegistrationSchema.index({ createdAt: -1 });


// Pre-save middleware to update confirmation sent date
enhancedEventRegistrationSchema.pre('save', function(next) {
  if (this.isModified('confirmationSent') && this.confirmationSent && !this.confirmationSentAt) {
    this.confirmationSentAt = new Date();
  }
  next();
});

// Static method to get registrations by event
enhancedEventRegistrationSchema.statics.findByEvent = function(eventId, status = 'active') {
  return this.find({ 
    event: eventId, 
    status: status 
  }).populate('registrant.userId', 'firstName lastName email profileImageUrl').sort({ createdAt: -1 });
};

// Static method to get user's registrations
enhancedEventRegistrationSchema.statics.findByUser = function(userId) {
  return this.find({ 
    'registrant.userId': userId 
  }).populate('event', 'eventName startDate endDate location eventMode').sort({ createdAt: -1 });
};

// Static method to get registration statistics for an event
enhancedEventRegistrationSchema.statics.getEventStats = function(eventId) {
  return this.aggregate([
    { $match: { event: new mongoose.Types.ObjectId(eventId), status: 'active' } },
    {
      $group: {
        _id: '$event',
        totalRegistrations: { $sum: 1 },
        totalParticipants: { $sum: '$totalParticipants' },
        totalRevenue: { $sum: '$totalAmount' },
        paidRegistrations: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
        },
        pendingRegistrations: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Instance method to calculate refund amount
enhancedEventRegistrationSchema.methods.calculateRefundAmount = function(cancellationFee = 0) {
  if (this.paymentStatus !== 'paid') {
    return 0;
  }
  
  const refundAmount = this.totalAmount - cancellationFee;
  return Math.max(0, refundAmount);
};

// Instance method to cancel registration
enhancedEventRegistrationSchema.methods.cancelRegistration = function(reason, cancelledBy = null) {
  if (!this.canBeCancelled) {
    throw new Error('Registration cannot be cancelled');
  }
  
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  this.cancelledBy = cancelledBy;
  
  return this.save();
};

const EnhancedEventRegistration = mongoose.model('EnhancedEventRegistration', enhancedEventRegistrationSchema);

export default EnhancedEventRegistration;
