import mongoose from "mongoose";

const savedSpeakerSchema = new mongoose.Schema({
  organizer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "EnhancedUser", 
    required: true 
  },
  speaker: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "EnhancedUser", 
    required: true 
  },
  customTags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  savedAt: { 
    type: Date, 
    default: Date.now 
  },
  notes: { 
    type: String, 
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

// Compound index to prevent duplicate saves
savedSpeakerSchema.index({ organizer: 1, speaker: 1 }, { unique: true });

// Index for efficient querying
savedSpeakerSchema.index({ organizer: 1, isActive: 1 });
savedSpeakerSchema.index({ speaker: 1, isActive: 1 });

// Static method to find saved speakers for organizer
savedSpeakerSchema.statics.findByOrganizer = function(organizerId, options = {}) {
  const query = { organizer: organizerId, isActive: true };
  return this.find(query)
    .populate({
      path: 'speaker',
      select: 'firstName lastName fullName email profileImageUrl bio professionalTitle location areaOfExpertise yearsOfExperience roleSpecificData isProfileComplete createdAt'
    })
    .sort({ savedAt: -1 })
    .limit(options.limit || 50)
    .skip(options.skip || 0);
};

// Static method to check if speaker is saved by organizer
savedSpeakerSchema.statics.isSpeakerSaved = function(organizerId, speakerId) {
  return this.findOne({ 
    organizer: organizerId, 
    speaker: speakerId, 
    isActive: true 
  });
};

// Static method to get custom tags for organizer
savedSpeakerSchema.statics.getOrganizerCustomTags = function(organizerId) {
  return this.distinct('customTags', { 
    organizer: organizerId, 
    isActive: true 
  });
};

// Instance method to update tags
savedSpeakerSchema.methods.updateTags = function(newTags) {
  // Validate tags
  if (!Array.isArray(newTags)) {
    throw new Error('Tags must be an array');
  }
  
  if (newTags.length > 10) {
    throw new Error('Cannot have more than 10 tags');
  }
  
  // Clean and validate each tag
  this.customTags = newTags
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0 && tag.length <= 50)
    .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates
  
  return this.save();
};

// Instance method to soft delete
savedSpeakerSchema.methods.softDelete = function() {
  this.isActive = false;
  return this.save();
};

export default mongoose.model("SavedSpeaker", savedSpeakerSchema);

