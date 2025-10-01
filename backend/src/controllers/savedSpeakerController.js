import SavedSpeaker from "../models/savedSpeaker.js";
import EnhancedUser from "../models/enhancedUser.js";

// Save a speaker with custom tags for organizer
export const saveSpeaker = async (req, res) => {
  try {
    const { speakerId, customTags = [], notes = "" } = req.body;
    const organizerId = req.user._id;

    console.log('🔖 Saving speaker:', { organizerId, speakerId, customTags, notes });

    // Validate input
    if (!speakerId) {
      return res.status(400).json({
        success: false,
        message: "Speaker ID is required"
      });
    }

    // Validate tags
    if (!Array.isArray(customTags)) {
      return res.status(400).json({
        success: false,
        message: "Custom tags must be an array"
      });
    }

    if (customTags.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Cannot have more than 10 tags"
      });
    }

    // Validate each tag
    const validTags = customTags
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && tag.length <= 50)
      .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates

    // Check if speaker exists
    const speaker = await EnhancedUser.findById(speakerId);
    if (!speaker) {
      return res.status(404).json({
        success: false,
        message: "Speaker not found"
      });
    }

    // Check if already saved (handle gracefully)
    const existingSavedSpeaker = await SavedSpeaker.isSpeakerSaved(organizerId, speakerId);
    if (existingSavedSpeaker) {
      // Update existing saved speaker
      await existingSavedSpeaker.updateTags(validTags);
      existingSavedSpeaker.notes = notes.trim();
      await existingSavedSpeaker.save();

      // Populate speaker data
      await existingSavedSpeaker.populate({
        path: 'speaker',
        select: 'firstName lastName fullName email profileImageUrl bio professionalTitle location areaOfExpertise yearsOfExperience roleSpecificData isProfileComplete createdAt'
      });

      return res.status(200).json({
        success: true,
        message: "Speaker saved successfully (updated existing)",
        data: existingSavedSpeaker
      });
    }

    // Create new saved speaker
    const savedSpeaker = new SavedSpeaker({
      organizer: organizerId,
      speaker: speakerId,
      customTags: validTags,
      notes: notes.trim()
    });

    await savedSpeaker.save();

    // Populate speaker data
    await savedSpeaker.populate({
      path: 'speaker',
      select: 'firstName lastName fullName email profileImageUrl bio professionalTitle location areaOfExpertise yearsOfExperience roleSpecificData isProfileComplete createdAt'
    });

    console.log('✅ Speaker saved successfully:', savedSpeaker._id);

    res.status(201).json({
      success: true,
      message: "Speaker saved successfully",
      data: savedSpeaker
    });

  } catch (error) {
    console.error('❌ Error saving speaker:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Speaker is already saved"
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while saving speaker",
      error: error.message
    });
  }
};

// Get all saved speakers for organizer
export const getSavedSpeakers = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const { page = 1, limit = 20, tags } = req.query;

    console.log('📋 Fetching saved speakers for organizer:', organizerId);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    let query = { organizer: organizerId, isActive: true };
    
    // Filter by tags if provided
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.customTags = { $in: tagArray };
    }

    // Get saved speakers with pagination
    const savedSpeakers = await SavedSpeaker.find(query)
      .populate({
        path: 'speaker',
        select: 'firstName lastName fullName email profileImageUrl bio professionalTitle location areaOfExpertise yearsOfExperience roleSpecificData isProfileComplete createdAt'
      })
      .sort({ savedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const totalCount = await SavedSpeaker.countDocuments(query);

    console.log(`✅ Found ${savedSpeakers.length} saved speakers`);

    res.status(200).json({
      success: true,
      message: "Saved speakers retrieved successfully",
      data: {
        savedSpeakers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          hasNextPage: skip + savedSpeakers.length < totalCount,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching saved speakers:', error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching saved speakers",
      error: error.message
    });
  }
};

// Update custom tags for saved speaker
export const updateSavedSpeakerTags = async (req, res) => {
  try {
    const { savedSpeakerId } = req.params;
    const { customTags = [], notes = "" } = req.body;
    const organizerId = req.user._id;

    console.log('🏷️ Updating tags for saved speaker:', { savedSpeakerId, customTags, notes });

    // Find saved speaker
    const savedSpeaker = await SavedSpeaker.findOne({
      _id: savedSpeakerId,
      organizer: organizerId,
      isActive: true
    });

    if (!savedSpeaker) {
      return res.status(404).json({
        success: false,
        message: "Saved speaker not found"
      });
    }

    // Validate tags
    if (!Array.isArray(customTags)) {
      return res.status(400).json({
        success: false,
        message: "Custom tags must be an array"
      });
    }

    if (customTags.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Cannot have more than 10 tags"
      });
    }

    // Update tags and notes
    await savedSpeaker.updateTags(customTags);
    savedSpeaker.notes = notes.trim();
    await savedSpeaker.save();

    // Populate speaker data
    await savedSpeaker.populate({
      path: 'speaker',
      select: 'firstName lastName fullName email profileImageUrl bio professionalTitle location areaOfExpertise yearsOfExperience roleSpecificData isProfileComplete createdAt'
    });

    console.log('✅ Tags updated successfully');

    res.status(200).json({
      success: true,
      message: "Tags updated successfully",
      data: savedSpeaker
    });

  } catch (error) {
    console.error('❌ Error updating tags:', error);
    res.status(500).json({
      success: false,
      message: "Server error while updating tags",
      error: error.message
    });
  }
};

// Remove saved speaker (soft delete)
export const removeSavedSpeaker = async (req, res) => {
  try {
    const { savedSpeakerId } = req.params;
    const organizerId = req.user._id;

    console.log('🗑️ Removing saved speaker:', { savedSpeakerId, organizerId });

    // Find saved speaker
    const savedSpeaker = await SavedSpeaker.findOne({
      _id: savedSpeakerId,
      organizer: organizerId,
      isActive: true
    });

    if (!savedSpeaker) {
      return res.status(404).json({
        success: false,
        message: "Saved speaker not found"
      });
    }

    // Soft delete
    await savedSpeaker.softDelete();

    console.log('✅ Saved speaker removed successfully');

    res.status(200).json({
      success: true,
      message: "Speaker removed from saved list successfully"
    });

  } catch (error) {
    console.error('❌ Error removing saved speaker:', error);
    res.status(500).json({
      success: false,
      message: "Server error while removing saved speaker",
      error: error.message
    });
  }
};

// Get all custom tags for organizer
export const getOrganizerCustomTags = async (req, res) => {
  try {
    const organizerId = req.user._id;

    console.log('🏷️ Fetching custom tags for organizer:', organizerId);

    const customTags = await SavedSpeaker.getOrganizerCustomTags(organizerId);

    // Sort tags alphabetically
    const sortedTags = customTags.sort();

    console.log(`✅ Found ${sortedTags.length} custom tags`);

    res.status(200).json({
      success: true,
      message: "Custom tags retrieved successfully",
      data: {
        customTags: sortedTags,
        count: sortedTags.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching custom tags:', error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching custom tags",
      error: error.message
    });
  }
};

// Check if speaker is saved by organizer
export const checkSpeakerSavedStatus = async (req, res) => {
  try {
    const { speakerId } = req.params;
    const organizerId = req.user._id;

    console.log('🔍 Checking if speaker is saved:', { speakerId, organizerId });

    const savedSpeaker = await SavedSpeaker.isSpeakerSaved(organizerId, speakerId);

    res.status(200).json({
      success: true,
      message: "Speaker saved status retrieved successfully",
      data: {
        isSaved: !!savedSpeaker,
        savedSpeaker: savedSpeaker || null
      }
    });

  } catch (error) {
    console.error('❌ Error checking speaker saved status:', error);
    res.status(500).json({
      success: false,
      message: "Server error while checking speaker saved status",
      error: error.message
    });
  }
};

