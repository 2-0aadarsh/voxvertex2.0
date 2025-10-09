import mongoose from "mongoose";

// Ticket Tier Schema with Discount Support
const ticketTierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Ticket name is required"],
    trim: true,
    maxlength: [100, "Ticket name cannot exceed 100 characters"],
  },
  price: {
    type: Number,
    required: [true, "Ticket price is required"],
    min: [0, "Ticket price cannot be negative"],
  },
  quantity: {
    type: Number,
    required: [true, "Ticket quantity is required"],
    min: [1, "Quantity must be at least 1"],
  },
  reservedQuantity: {
    type: Number,
    default: 0,
    min: [0, "Reserved quantity cannot be negative"],
  },
  features: [{
    type: String,
    trim: true,
    maxlength: [200, "Feature cannot exceed 200 characters"],
  }],
  discount: {
    enabled: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, "Discount name cannot exceed 100 characters"],
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    value: {
      type: Number,
      min: [0, "Discount value cannot be negative"],
      max: [100, "Percentage discount cannot exceed 100%"]
    },
    maxUses: {
      type: Number,
      min: [1, "Max uses must be at least 1"],
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [20, "Discount code cannot exceed 20 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Discount description cannot exceed 500 characters"],
    }
  }
});

// Manual Speaker Schema (for speakers added manually by organizer)
const manualSpeakerSchema = new mongoose.Schema({
  image: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    required: [true, "Speaker name is required"],
    trim: true,
    maxlength: [100, "Speaker name cannot exceed 100 characters"],
  },
  title: {
    type: String,
    required: [true, "Speaker title is required"],
    trim: true,
    maxlength: [150, "Speaker title cannot exceed 150 characters"],
  },
  bio: {
    type: String,
    required: [true, "Speaker bio is required"],
    trim: true,
    maxlength: [1000, "Speaker bio cannot exceed 1000 characters"],
  }
});

// Platform Speaker Schema (for speakers from confirmed bookings)
const platformSpeakerSchema = new mongoose.Schema({
  speakerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    required: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  speakerDetails: {
    firstName: String,
    lastName: String,
    fullName: String,
    profileImageUrl: String,
    bio: String,
    professionalTitle: String,
    areaOfExpertise: [String],
    yearsOfExperience: Number,
    // Cache speaker details for performance
  }
});

// Enhanced Event Schema
const enhancedEventSchema = new mongoose.Schema({
  // Core Details
  eventName: {
    type: String,
    required: [true, "Event name is required"],
    trim: true,
    maxlength: [150, "Event name cannot exceed 150 characters"],
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
    validate: {
      validator: function (v) {
        return v >= new Date();
      },
      message: "Start date must be in the future"
    }
  },
  endDate: {
    type: Date,
    required: [true, "End date is required"],
    validate: {
      validator: function (v) {
        return v >= this.startDate;
      },
      message: "End date must be after start date"
    }
  },
  eventMode: {
    type: String,
    required: [true, "Event mode is required"],
    enum: {
      values: ['offline', 'online', 'hybrid'],
      message: "Event mode must be offline, online, or hybrid"
    }
  },
  format: {
    type: String,
    required: [true, "Event format is required"],
    trim: true,
    maxlength: [100, "Event format cannot exceed 100 characters"],
  },
  location: {
    type: String,
    trim: true,
    maxlength: [500, "Location cannot exceed 500 characters"],
    validate: {
      validator: function (v) {
        if (this.eventMode === 'offline' || this.eventMode === 'hybrid') {
          return v && v.trim().length > 0;
        }
        return true;
      },
      message: "Location is required for offline or hybrid events"
    }
  },
  // Online Event Platform Details
  meetingPlatform: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        if ((this.eventMode === 'online' || this.eventMode === 'hybrid') && (!v || v.trim().length === 0)) {
          return false;
        }
        return true;
      },
      message: 'Meeting platform is required for online or hybrid events'
    }
  },
  meetingLink: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        if ((this.eventMode === 'online' || this.eventMode === 'hybrid') && (!v || v.trim().length === 0)) {
          return false;
        }
        return true;
      },
      message: 'Meeting link is required for online or hybrid events'
    }
  },
  meetingId: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        if (this.meetingPlatform === 'Zoom' && (!v || v.trim().length === 0)) {
          return false;
        }
        return true;
      },
      message: 'Meeting ID is required when Zoom is selected as platform'
    }
  },
  passcode: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        if (this.meetingPlatform === 'Zoom' && (!v || v.trim().length === 0)) {
          return false;
        }
        return true;
      },
      message: 'Passcode is required when Zoom is selected as platform'
    }
  },
  dialInNumbers: {
    type: String,
    trim: true,
    maxlength: [1000, 'Dial-in numbers cannot exceed 1000 characters']
  },
  participantInstructions: {
    type: String,
    trim: true,
    maxlength: [2000, 'Participant instructions cannot exceed 2000 characters']
  },

  // Branding & Content
  description: {
    type: String,
    required: [true, "Event description is required"],
    trim: true,
    maxlength: [2000, "Description cannot exceed 2000 characters"],
  },
  bannerImage: {
    type: String,
    required: [true, "Banner image is required"],
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, "Tag cannot exceed 50 characters"],
  }],

  // Ticketing
  ticketTypes: [ticketTierSchema],

  // Speakers (Two Types)
  speakers: {
    manualSpeakers: [manualSpeakerSchema],
    platformSpeakers: [platformSpeakerSchema]
  },

  // Add-ons
  addons: {
    featureOnHome: {
      type: Boolean,
      default: false
    },
    includeInNewsletter: {
      type: Boolean,
      default: false
    },
    socialMediaPromotion: {
      type: Boolean,
      default: false
    }
  },

  // Policies & Terms - Comprehensive and Scalable Schema
  policies: {
    // Participant Refund Policy
    participantRefund: {
      allowRefunds: {
        type: Boolean,
        default: false,
        required: true
      },
      refundDeadline: {
        type: Number,
        min: [0, "Refund deadline cannot be negative"],
        max: [365, "Refund deadline cannot exceed 365 days"],
        validate: {
          validator: function(v) {
            if (this.policies?.participantRefund?.allowRefunds && v === undefined) {
              return false;
            }
            return true;
          },
          message: "Refund deadline is required when refunds are allowed"
        }
      },
      refundPercentage: {
        type: Number,
        min: [0, "Refund percentage cannot be negative"],
        max: [100, "Refund percentage cannot exceed 100%"],
        validate: {
          validator: function(v) {
            if (this.policies?.participantRefund?.allowRefunds && v === undefined) {
              return false;
            }
            return true;
          },
          message: "Refund percentage is required when refunds are allowed"
        }
      },
      processingTime: {
        type: String,
        trim: true,
        default: "48 hours",
        validate: {
          validator: function(v) {
            if (this.policies?.participantRefund?.allowRefunds && (!v || v.trim().length === 0)) {
              return false;
            }
            return true;
          },
          message: "Processing time is required when refunds are allowed"
        }
      },
      refundConditions: [{
        type: String,
        trim: true,
        maxlength: [500, "Refund condition cannot exceed 500 characters"],
        required: true
      }]
    },

    // Speaker Cancellation Policy
    speakerCancellation: {
      allowCancellation: {
        type: Boolean,
        default: false,
        required: true
      },
      cancellationDeadline: {
        type: Number,
        min: [0, "Cancellation deadline cannot be negative"],
        max: [365, "Cancellation deadline cannot exceed 365 days"],
        validate: {
          validator: function(v) {
            if (this.policies?.speakerCancellation?.allowCancellation && v === undefined) {
              return false;
            }
            return true;
          },
          message: "Cancellation deadline is required when cancellations are allowed"
        }
      },
      partialRefundPercentage: {
        type: Number,
        min: [0, "Partial refund percentage cannot be negative"],
        max: [100, "Partial refund percentage cannot exceed 100%"],
        validate: {
          validator: function(v) {
            if (this.policies?.speakerCancellation?.allowCancellation && v === undefined) {
              return false;
            }
            return true;
          },
          message: "Partial refund percentage is required when cancellations are allowed"
        }
      },
      requireReplacement: {
        type: Boolean,
        default: false
      },
      paymentTerms: {
        type: String,
        trim: true,
        maxlength: [1000, "Payment terms cannot exceed 1000 characters"]
      },
      speakerConditions: [{
        type: String,
        trim: true,
        maxlength: [500, "Speaker condition cannot exceed 500 characters"],
        required: true
      }]
    },

    // Event Cancellation Policy
    eventCancellation: {
      allowCancellation: {
        type: Boolean,
        default: false,
        required: true
      },
      fullRefundDeadline: {
        type: Number,
        min: [0, "Full refund deadline cannot be negative"],
        max: [365, "Full refund deadline cannot exceed 365 days"],
        validate: {
          validator: function(v) {
            if (this.policies?.eventCancellation?.allowCancellation && v === undefined) {
              return false;
            }
            return true;
          },
          message: "Full refund deadline is required when cancellations are allowed"
        }
      },
      partialRefundPercentage: {
        type: Number,
        min: [0, "Partial refund percentage cannot be negative"],
        max: [100, "Partial refund percentage cannot exceed 100%"],
        validate: {
          validator: function(v) {
            if (this.policies?.eventCancellation?.allowCancellation && v === undefined) {
              return false;
            }
            return true;
          },
          message: "Partial refund percentage is required when cancellations are allowed"
        }
      },
      refundMethod: {
        type: String,
        trim: true,
        maxlength: [200, "Refund method cannot exceed 200 characters"],
        validate: {
          validator: function(v) {
            if (this.policies?.eventCancellation?.allowCancellation && (!v || v.trim().length === 0)) {
              return false;
            }
            return true;
          },
          message: "Refund method is required when cancellations are allowed"
        }
      },
      processingTime: {
        type: String,
        trim: true,
        default: "48 hours",
        validate: {
          validator: function(v) {
            if (this.policies?.eventCancellation?.allowCancellation && (!v || v.trim().length === 0)) {
              return false;
            }
            return true;
          },
          message: "Processing time is required when cancellations are allowed"
        }
      },
      cancellationConditions: {
        type: String,
        trim: true,
        maxlength: [1000, "Cancellation conditions cannot exceed 1000 characters"]
      }
    },

    // Event Postponement Policy
    eventPostponement: {
      allowPostponement: {
        type: Boolean,
        default: false,
        required: true
      },
      noticeRequired: {
        type: Number,
        min: [0, "Notice required cannot be negative"],
        max: [365, "Notice required cannot exceed 365 days"],
        validate: {
          validator: function(v) {
            if (this.policies?.eventPostponement?.allowPostponement && v === undefined) {
              return false;
            }
            return true;
          },
          message: "Notice required is required when postponements are allowed"
        }
      },
      maxPostponementDuration: {
        type: Number,
        min: [0, "Max postponement duration cannot be negative"],
        max: [365, "Max postponement duration cannot exceed 365 days"],
        validate: {
          validator: function(v) {
            if (this.policies?.eventPostponement?.allowPostponement && v === undefined) {
              return false;
            }
            return true;
          },
          message: "Max postponement duration is required when postponements are allowed"
        }
      },
      partialRefundRequestDeadline: {
        type: Number,
        min: [0, "Partial refund request deadline cannot be negative"],
        max: [365, "Partial refund request deadline cannot exceed 365 days"],
        validate: {
          validator: function(v) {
            if (this.policies?.eventPostponement?.allowPostponement && v === undefined) {
              return false;
            }
            return true;
          },
          message: "Partial refund request deadline is required when postponements are allowed"
        }
      },
      ticketsValidForNewDate: {
        type: Boolean,
        default: false
      },
      offerRefundOnPostponement: {
        type: Boolean,
        default: false
      },
      allowSpeakersToCancelOnPostponement: {
        type: Boolean,
        default: false
      },
      refundPercentageOnPostponement: {
        type: Number,
        min: [0, "Refund percentage cannot be negative"],
        max: [100, "Refund percentage cannot exceed 100%"],
        validate: {
          validator: function(v) {
            if (this.policies?.eventPostponement?.offerRefundOnPostponement && v === undefined) {
              return false;
            }
            return true;
          },
          message: "Refund percentage is required when refunds are offered on postponement"
        }
      },
      postponementConditions: [{
        type: String,
        trim: true,
        maxlength: [500, "Postponement condition cannot exceed 500 characters"],
        required: true
      }]
    },

    // General Terms & Conditions
    generalTerms: {
      type: String,
      trim: true,
      maxlength: [5000, "General terms cannot exceed 5000 characters"],
      required: [true, "General terms and conditions are required"],
      validate: {
        validator: function(v) {
          return v && v.trim().length > 0;
        },
        message: "General terms and conditions cannot be empty"
      }
    },

    // Policy Metadata for Audit and Compliance
    metadata: {
      version: {
        type: String,
        default: "1.0",
        trim: true
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EnhancedUser'
      },
      isCompliant: {
        type: Boolean,
        default: true
      },
      complianceNotes: {
        type: String,
        trim: true,
        maxlength: [1000, "Compliance notes cannot exceed 1000 characters"]
      }
    }
  },

  // Metadata
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EnhancedUser',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'postponed'],
    default: 'draft'
  },
  publishedAt: {
    type: Date,
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  totalTicketsSold: {
    type: Number,
    default: 0
  },
  totalCapacity: {
    type: Number,
    default: 0
  },
  
  // Postponement-related fields
  postponement: {
    isPostponed: {
      type: Boolean,
      default: false
    },
    originalEventData: {
      startDate: Date,
      endDate: Date,
      location: String,
      meetingPlatform: String,
      meetingLink: String,
      meetingId: String,
      passcode: String,
      dialInNumbers: String,
      participantInstructions: String
    },
    postponementHistory: [{
      postponedAt: {
        type: Date,
        default: Date.now
      },
      postponedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EnhancedUser'
      },
      reason: {
        type: String,
        trim: true,
        maxlength: [500, "Postponement reason cannot exceed 500 characters"]
      },
      newDates: {
        startDate: Date,
        endDate: Date
      },
      newLocation: String,
      newMeetingDetails: {
        meetingPlatform: String,
        meetingLink: String,
        meetingId: String,
        passcode: String,
        dialInNumbers: String,
        participantInstructions: String
      },
      refundOffered: {
        type: Boolean,
        default: false
      },
      refundPercentage: {
        type: Number,
        min: [0, "Refund percentage cannot be negative"],
        max: [100, "Refund percentage cannot exceed 100%"]
      },
      notificationsSent: {
        participants: {
          type: Boolean,
          default: false
        },
        speakers: {
          type: Boolean,
          default: false
        },
        sentAt: Date
      }
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for event duration
enhancedEventSchema.virtual('duration').get(function () {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for checking if event is published
enhancedEventSchema.virtual('isPublished').get(function () {
  return this.status === 'published';
});

// Virtual for checking if event is in the past
enhancedEventSchema.virtual('isPast').get(function () {
  return this.endDate < new Date();
});

// Virtual for checking if event is upcoming
enhancedEventSchema.virtual('isUpcoming').get(function () {
  return this.startDate > new Date();
});

// Virtual for checking if event is ongoing
enhancedEventSchema.virtual('isOngoing').get(function () {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now;
});

// Indexes for better query performance
enhancedEventSchema.index({ organizer: 1, status: 1 });
enhancedEventSchema.index({ startDate: 1 });
enhancedEventSchema.index({ eventMode: 1 });
enhancedEventSchema.index({ status: 1, publishedAt: -1 });

// Policy-specific indexes for efficient querying
enhancedEventSchema.index({ 'policies.metadata.isCompliant': 1 });
enhancedEventSchema.index({ 'policies.participantRefund.allowRefunds': 1 });
enhancedEventSchema.index({ 'policies.speakerCancellation.allowCancellation': 1 });
enhancedEventSchema.index({ 'policies.eventCancellation.allowCancellation': 1 });
enhancedEventSchema.index({ 'policies.eventPostponement.allowPostponement': 1 });
enhancedEventSchema.index({ 'policies.metadata.lastUpdated': -1 });

// Pre-save middleware to calculate total capacity
enhancedEventSchema.pre('save', function (next) {
  if (this.ticketTypes && this.ticketTypes.length > 0) {
    this.totalCapacity = this.ticketTypes.reduce((total, ticket) => total + ticket.quantity, 0);
  }
  next();
});

// Pre-save middleware to set publishedAt when status changes to published
enhancedEventSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Pre-save middleware for policy validation and metadata updates
enhancedEventSchema.pre('save', function (next) {
  // Update policy metadata when policies are modified
  if (this.isModified('policies')) {
    if (!this.policies.metadata) {
      this.policies.metadata = {};
    }
    this.policies.metadata.lastUpdated = new Date();
    
    // Auto-validate policy compliance
    const policyValidation = this.validatePolicies();
    this.policies.metadata.isCompliant = policyValidation.isCompliant;
    this.policies.metadata.complianceNotes = policyValidation.notes;
  }
  next();
});

// Static method to get events by organizer
enhancedEventSchema.statics.findByOrganizer = function (organizerId, status = null) {
  const query = { organizer: organizerId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get published events
enhancedEventSchema.statics.findPublished = function () {
  return this.find({ status: 'published' }).sort({ publishedAt: -1 });
};

// Instance method to check if event can be published
enhancedEventSchema.methods.canBePublished = function () {
  const errors = [];
  
  // Check required fields
  if (!this.eventName) errors.push('Event name is required');
  if (!this.startDate) errors.push('Start date is required');
  if (!this.endDate) errors.push('End date is required');
  if (!this.description) errors.push('Description is required');
  if (!this.bannerImage) errors.push('Banner image is required');
  if (!this.format) errors.push('Event format is required');
  
  // Check mode-specific requirements
  if ((this.eventMode === 'offline' || this.eventMode === 'hybrid') && !this.location) {
    errors.push('Location is required for offline/hybrid events');
  }
  if ((this.eventMode === 'online' || this.eventMode === 'hybrid') && !this.meetingLink) {
    errors.push('Meeting link is required for online/hybrid events');
  }
  if ((this.eventMode === 'online' || this.eventMode === 'hybrid') && !this.meetingPlatform) {
    errors.push('Meeting platform is required for online/hybrid events');
  }
  
  // Check date logic
  if (this.startDate >= this.endDate) {
    errors.push('End date must be after start date');
  }
  
  // Check if there's at least one speaker or ticket type
  const totalSpeakers = (this.speakers.manualSpeakers?.length || 0) + (this.speakers.platformSpeakers?.length || 0);
  if (totalSpeakers === 0) errors.push('At least one speaker is required');
  if (!this.ticketTypes || this.ticketTypes.length === 0) errors.push('At least one ticket type is required');
  
  // Check policies and terms
  const policyValidation = this.validatePolicies();
  if (!policyValidation.isCompliant) {
    errors.push('Policies and terms must be properly configured');
    errors.push(...policyValidation.errors);
  }
  
  return {
    canPublish: errors.length === 0,
    errors: errors
  };
};

// Instance method to validate policies and terms
enhancedEventSchema.methods.validatePolicies = function () {
  const errors = [];
  let isCompliant = true;
  let notes = [];

  // Check if policies exist
  if (!this.policies) {
    errors.push('Policies and terms are required');
    return { isCompliant: false, errors, notes: ['No policies configured'] };
  }

  // Validate General Terms (required)
  if (!this.policies.generalTerms || this.policies.generalTerms.trim().length === 0) {
    errors.push('General terms and conditions are required');
    isCompliant = false;
  }

  // Validate Participant Refund Policy
  if (this.policies.participantRefund?.allowRefunds) {
    const refund = this.policies.participantRefund;
    if (refund.refundDeadline === undefined || refund.refundDeadline === null || refund.refundDeadline === '') {
      errors.push('Refund deadline is required when refunds are allowed');
      isCompliant = false;
    }
    if (refund.refundPercentage === undefined || refund.refundPercentage === null || refund.refundPercentage === '') {
      errors.push('Refund percentage is required when refunds are allowed');
      isCompliant = false;
    }
    if (!refund.processingTime || refund.processingTime.trim().length === 0) {
      errors.push('Processing time is required when refunds are allowed');
      isCompliant = false;
    }
  }

  // Validate Speaker Cancellation Policy
  if (this.policies.speakerCancellation?.allowCancellation) {
    const speaker = this.policies.speakerCancellation;
    if (speaker.cancellationDeadline === undefined || speaker.cancellationDeadline === null || speaker.cancellationDeadline === '') {
      errors.push('Cancellation deadline is required when speaker cancellations are allowed');
      isCompliant = false;
    }
    // Note: partialRefundPercentage is no longer required for speaker cancellation policy
    // as per UI requirements - removed from validation
  }

  // Validate Event Cancellation Policy
  if (this.policies.eventCancellation?.allowCancellation) {
    const eventCancel = this.policies.eventCancellation;
    if (eventCancel.fullRefundDeadline === undefined || eventCancel.fullRefundDeadline === null || eventCancel.fullRefundDeadline === '') {
      errors.push('Full refund deadline is required when event cancellations are allowed');
      isCompliant = false;
    }
    if (eventCancel.partialRefundPercentage === undefined || eventCancel.partialRefundPercentage === null || eventCancel.partialRefundPercentage === '') {
      errors.push('Partial refund percentage is required when event cancellations are allowed');
      isCompliant = false;
    }
    if (!eventCancel.refundMethod || eventCancel.refundMethod.trim().length === 0) {
      errors.push('Refund method is required when event cancellations are allowed');
      isCompliant = false;
    }
    if (!eventCancel.processingTime || eventCancel.processingTime.trim().length === 0) {
      errors.push('Processing time is required when event cancellations are allowed');
      isCompliant = false;
    }
  }

  // Validate Event Postponement Policy
  if (this.policies.eventPostponement?.allowPostponement) {
    const postponement = this.policies.eventPostponement;
    if (postponement.noticeRequired === undefined || postponement.noticeRequired === null || postponement.noticeRequired === '') {
      errors.push('Notice required is required when postponements are allowed');
      isCompliant = false;
    }
    if (postponement.maxPostponementDuration === undefined || postponement.maxPostponementDuration === null || postponement.maxPostponementDuration === '') {
      errors.push('Max postponement duration is required when postponements are allowed');
      isCompliant = false;
    }
    if (postponement.partialRefundRequestDeadline === undefined || postponement.partialRefundRequestDeadline === null || postponement.partialRefundRequestDeadline === '') {
      errors.push('Partial refund request deadline is required when postponements are allowed');
      isCompliant = false;
    }
    if (postponement.offerRefundOnPostponement && (postponement.refundPercentageOnPostponement === undefined || postponement.refundPercentageOnPostponement === null || postponement.refundPercentageOnPostponement === '')) {
      errors.push('Refund percentage is required when refunds are offered on postponement');
      isCompliant = false;
    }
  }

  // Generate compliance notes
  if (isCompliant) {
    notes.push('All policies are properly configured and compliant');
  } else {
    notes.push('Policy validation failed - see errors for details');
  }

  return {
    isCompliant,
    errors,
    notes
  };
};

// Instance method to get policy summary for display
enhancedEventSchema.methods.getPolicySummary = function () {
  if (!this.policies) return null;

  return {
    participantRefund: {
      enabled: this.policies.participantRefund?.allowRefunds || false,
      deadline: this.policies.participantRefund?.refundDeadline,
      percentage: this.policies.participantRefund?.refundPercentage
    },
    speakerCancellation: {
      enabled: this.policies.speakerCancellation?.allowCancellation || false,
      deadline: this.policies.speakerCancellation?.cancellationDeadline,
      requireReplacement: this.policies.speakerCancellation?.requireReplacement || false
    },
    eventCancellation: {
      enabled: this.policies.eventCancellation?.allowCancellation || false,
      fullRefundDeadline: this.policies.eventCancellation?.fullRefundDeadline,
      partialRefundPercentage: this.policies.eventCancellation?.partialRefundPercentage
    },
    eventPostponement: {
      enabled: this.policies.eventPostponement?.allowPostponement || false,
      noticeRequired: this.policies.eventPostponement?.noticeRequired,
      maxDuration: this.policies.eventPostponement?.maxPostponementDuration,
      partialRefundRequestDeadline: this.policies.eventPostponement?.partialRefundRequestDeadline,
      ticketsValid: this.policies.eventPostponement?.ticketsValidForNewDate || false,
      allowSpeakersToCancel: this.policies.eventPostponement?.allowSpeakersToCancelOnPostponement || false
    },
    generalTerms: this.policies.generalTerms ? this.policies.generalTerms.substring(0, 200) + '...' : '',
    lastUpdated: this.policies.metadata?.lastUpdated,
    isCompliant: this.policies.metadata?.isCompliant
  };
};

// Instance method to update policy metadata
enhancedEventSchema.methods.updatePolicyMetadata = function (updatedBy) {
  if (!this.policies.metadata) {
    this.policies.metadata = {};
  }
  
  this.policies.metadata.lastUpdated = new Date();
  this.policies.metadata.updatedBy = updatedBy;
  
  // Re-validate policies
  const validation = this.validatePolicies();
  this.policies.metadata.isCompliant = validation.isCompliant;
  this.policies.metadata.complianceNotes = validation.notes.join('; ');
  
  return validation;
};

// Static method to find events with specific policy configurations
enhancedEventSchema.statics.findByPolicyType = function (policyType, enabled = true) {
  const query = {};
  query[`policies.${policyType}.allow${policyType.charAt(0).toUpperCase() + policyType.slice(1)}`] = enabled;
  return this.find(query);
};

// Static method to get events requiring policy attention (non-compliant)
enhancedEventSchema.statics.findNonCompliantPolicies = function () {
  return this.find({ 'policies.metadata.isCompliant': false });
};

const EnhancedEvent = mongoose.model('EnhancedEvent', enhancedEventSchema);

export default EnhancedEvent;


