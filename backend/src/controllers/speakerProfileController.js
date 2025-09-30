// ============================================================================
// SPEAKER PROFILE CONTROLLER - Detailed Speaker Profile Business Logic
// ============================================================================

import EnhancedUser from '../models/enhancedUser.js';
import WorkExperience from '../models/workExperience.js';
import Education from '../models/education.js';
import Award from '../models/award.js';
import FeaturedVideo from '../models/featuredVideo.js';
import Availability from '../models/availability.js';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Validate if speaker exists and is active
const validateSpeaker = async (speakerId) => {
  const speaker = await EnhancedUser.findOne({
    _id: speakerId,
    role: 'speaker',
    accountStatus: 'active'
  }).select('_id firstName lastName fullName email profileImageUrl bio professionalTitle location areaOfExpertise yearsOfExperience roleSpecificData isProfileComplete createdAt updatedAt');

  if (!speaker) {
    throw new Error('Speaker not found or inactive');
  }

  return speaker;
};

// Helper function to get speaker ID from request (for public access)
const getSpeakerIdFromRequest = (req) => {
  // For public routes, speakerId comes from URL params
  return req.params.speakerId;
};

// Calculate total experience years from work experience
const calculateTotalExperience = (workExperiences) => {
  if (!workExperiences || workExperiences.length === 0) {
    return 0;
  }

  let totalMonths = 0;
  
  workExperiences.forEach(exp => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.isCurrentlyWorking ? new Date() : new Date(exp.endDate);
    
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth());
    
    totalMonths += Math.max(0, months);
  });

  return Math.round(totalMonths / 12);
};

// ============================================================================
// MAIN CONTROLLER FUNCTIONS
// ============================================================================

// Get detailed speaker profile with all related data
export const getDetailedSpeakerProfile = async (req, res) => {
  try {
    const speakerId = getSpeakerIdFromRequest(req);

    // Validate speaker exists
    const speaker = await validateSpeaker(speakerId);

    // Fetch all related data in parallel
    const [
      workExperiences,
      education,
      awards,
      featuredVideos,
      availabilityData
    ] = await Promise.all([
      WorkExperience.find({ user: speakerId })
        .sort({ order: 1, startDate: -1 })
        .lean(),
      Education.find({ user: speakerId })
        .sort({ order: 1, startDate: -1 })
        .lean(),
      Award.find({ user: speakerId })
        .sort({ order: 1, dateIssued: -1 })
        .lean(),
      FeaturedVideo.find({ 
        user: speakerId,
        visibility: 'public',
        status: 'ready'
      })
        .sort({ order: 1, createdAt: -1 })
        .lean(),
      Availability.find({ userId: speakerId })
        .sort({ date: 1 })
        .lean()
    ]);

    // Calculate statistics
    const totalExperience = calculateTotalExperience(workExperiences);
    
    // Process availability data
    const availability = {
      dates: availabilityData.map(avail => avail.date.toISOString().split('T')[0]), // Extract dates as YYYY-MM-DD strings
      eventTypes: availabilityData.flatMap(avail => avail.eventTypes || []),
      modes: [...new Set(availabilityData.flatMap(avail => avail.modes || []))], // Remove duplicates
      timeSlots: availabilityData.flatMap(avail => avail.timeSlots || [])
    };
    
    const detailedProfile = {
      speaker: speaker.toObject(),
      workExperience: workExperiences,
      education: education,
      awards: awards,
      featuredVideos: featuredVideos,
      availability: availability,
      statistics: {
        totalExperience: totalExperience,
        totalVideos: featuredVideos.length,
        totalAwards: awards.length,
        totalEducation: education.length,
        totalAvailabilityDates: availability.dates.length
      }
    };

    res.status(200).json({
      success: true,
      message: 'Detailed speaker profile retrieved successfully',
      data: detailedProfile
    });

  } catch (error) {
    console.error('Error fetching detailed speaker profile:', error);
    
    if (error.message === 'Speaker not found or inactive') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching detailed speaker profile',
      error: error.message
    });
  }
};

// Get speaker work experience
export const getSpeakerWorkExperience = async (req, res) => {
  try {
    const speakerId = getSpeakerIdFromRequest(req);

    // Validate speaker exists
    await validateSpeaker(speakerId);

    // Fetch work experience
    const workExperiences = await WorkExperience.find({ user: speakerId })
      .sort({ order: 1, startDate: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Speaker work experience retrieved successfully',
      data: workExperiences
    });

  } catch (error) {
    console.error('Error fetching speaker work experience:', error);
    
    if (error.message === 'Speaker not found or inactive') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching speaker work experience',
      error: error.message
    });
  }
};

// Get speaker education
export const getSpeakerEducation = async (req, res) => {
  try {
    const speakerId = getSpeakerIdFromRequest(req);

    // Validate speaker exists
    await validateSpeaker(speakerId);

    // Fetch education
    const education = await Education.find({ user: speakerId })
      .sort({ order: 1, startDate: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Speaker education retrieved successfully',
      data: education
    });

  } catch (error) {
    console.error('Error fetching speaker education:', error);
    
    if (error.message === 'Speaker not found or inactive') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching speaker education',
      error: error.message
    });
  }
};

// Get speaker awards
export const getSpeakerAwards = async (req, res) => {
  try {
    const speakerId = getSpeakerIdFromRequest(req);

    // Validate speaker exists
    await validateSpeaker(speakerId);

    // Fetch awards
    const awards = await Award.find({ user: speakerId })
      .sort({ order: 1, dateIssued: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Speaker awards retrieved successfully',
      data: awards
    });

  } catch (error) {
    console.error('Error fetching speaker awards:', error);
    
    if (error.message === 'Speaker not found or inactive') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching speaker awards',
      error: error.message
    });
  }
};

// Get speaker featured videos
export const getSpeakerFeaturedVideos = async (req, res) => {
  try {
    const speakerId = getSpeakerIdFromRequest(req);

    // Validate speaker exists
    await validateSpeaker(speakerId);

    // Fetch featured videos
    const featuredVideos = await FeaturedVideo.find({ 
      user: speakerId,
      visibility: 'public',
      status: 'ready'
    })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Speaker featured videos retrieved successfully',
      data: featuredVideos
    });

  } catch (error) {
    console.error('Error fetching speaker featured videos:', error);
    
    if (error.message === 'Speaker not found or inactive') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching speaker featured videos',
      error: error.message
    });
  }
};