import Profile from "../models/profile.js";
import Event from "../models/event.js";
import mongoose from "mongoose";

// Helper function to get or create profile
const getOrCreateProfile = async (userId) => {
  let profile = await Profile.findOne({ user: userId });
  if (!profile) {
    profile = new Profile({ user: userId });
    await profile.save();
  }
  return profile;
};

// helper function to convert date string to Date object
function convertToDate(dateString) {
  if (!dateString) return new Date(0); // Default to epoch if no date

  // Split the date string into day, month, year
  const [day, month, year] = dateString.split('/').map(Number);

  // Note: Months are 0-indexed in JavaScript Date (0 = January)
  return new Date(year, month - 1, day);
}

// get a profile
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id })
      .populate({
        path: 'mutualReviews.reviewer',
        select: 'name profileImage'
      })
      .populate({
        path: 'mutualReviews.event',
        select: 'topic eventDate'
      });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Get user role data including subField
    const userRole = await mongoose.model('UserRole').findOne({ userId: req.user._id })
      .select('subField role industry');

    // Convert to plain object and remove sensitive data
    const profileData = profile.toObject();

    // Add user role data to the profile response
    if (userRole) {
      profileData.userRoleData = {
        subField: userRole.subField,
        role: userRole.role,
        industry: userRole.industry
      };
    }

    if (profile.experience && profile.experience.length > 0) {
      profile.experience.sort((a, b) => {
        const dateA = convertToDate(a.start);
        const dateB = convertToDate(b.start);
        return dateB - dateA;
      });
    }

    res.status(200).json({
      ...profileData,
      // Include review summary from mutualReviews
      reviewSummary: {
        businessRatings: profile.businessRatings,
        expertRatings: profile.expertRatings,
        totalReviews: profile.mutualReviews?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

// Update bio
export const updateBio = async (req, res) => {
  try {
    const { bio } = req.body;

    if (typeof bio === 'undefined') {
      return res.status(400).json({ message: "Bio is required" });
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { bio },
      {
        new: true,
        select: '-__v -createdAt -updatedAt' // Exclude these fields
      }
    )
    // .populate('expertEvents', 'topic eventDate'); // Example of populating referenced data

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Convert to plain object and remove any mongoose-specific properties
    const profileData = updatedProfile.toObject();

    res.status(200).json({
      success: true,
      message: "Bio updated successfully",
      profile: profileData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating bio",
      error: error.message
    });
  }
};

// Update profile image
export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }
    const profile = await getOrCreateProfile(req.user._id);
    profile.profileImage = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
    await profile.save();
    res.status(200).json({ message: "Profile image updated", profile });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile image", error: error.message });
  }
};

// Update about section
export const updateAbout = async (req, res) => {
  try {
    const { about } = req.body;
    const profile = await getOrCreateProfile(req.user._id);
    profile.about = about;
    await profile.save();
    res.status(200).json({ message: "About section updated", profile });
  } catch (error) {
    res.status(500).json({ message: "Error updating about section", error: error.message });
  }
};

// Add skill
export const addSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill || skill.length === 0) {
      return res.status(400).json({ message: "Skill is required" });
    }
    const profile = await getOrCreateProfile(req.user._id);
    if (!profile.skills.includes(skill)) {
      profile.skills.push(skill);
      await profile.save();
    }
    else {
      return res.status(400).json({ message: "Skill already exists" });
    }
    res.status(200).json({ message: "Skill added", profile });
  } catch (error) {
    res.status(500).json({ message: "Error adding skill", error: error.message });
  }
};

// Remove skill
export const removeSkill = async (req, res) => {
  try {
    const { skill } = req.params;
    const profile = await getOrCreateProfile(req.user._id);
    if (profile.skills.includes(skill) === false) {
      return res.status(404).json({ message: "Skill not found" });
    }
    profile.skills = profile.skills.filter(s => s !== skill);
    await profile.save();
    res.status(200).json({ message: "Skill removed", profile });
  } catch (error) {
    res.status(500).json({ message: "Error removing skill", error: error.message });
  }
};

// Add experience
export const addExperience = async (req, res) => {
  try {
    const experienceData = req.body.data ? JSON.parse(req.body.data) : req.body;
    const { title, organization, description, start, end, location, type } = experienceData;
    if (!title || !organization || !description || !start || !end || !location || !type) {
      return res.status(400).json({ message: "All experience fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "A certificate is required" });
    }

    const profile = await getOrCreateProfile(req.user._id);
    profile.experience.push({ title, description, organization, start, end, location, type });
    if (req.file) {
      profile.experience[profile.experience.length - 1].certificate = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }
    await profile.save();
    // res.status(201).json({ message: "Experience added", profile });
    res.status(201).json({ message: "Experience added", experience: profile.experience[profile.experience.length - 1] });
  } catch (error) {
    res.status(500).json({ message: "Error adding experience", error: error.message });
  }
};

// Update experience
export const updateExperience = async (req, res) => {
  try {
    const { expId } = req.params;

    // Parse the JSON data from form-data or use req.body directly
    const experienceData = req.body.data ? JSON.parse(req.body.data) : req.body;
    const { title, organization, description, start, end, location, type } = experienceData;

    const profile = await getOrCreateProfile(req.user._id);
    const expIndex = profile.experience.findIndex(exp => exp._id.toString() === expId);

    if (expIndex === -1) {
      return res.status(404).json({ message: "Experience not found" });
    }

    // Update only the fields that were provided
    const experience = profile.experience[expIndex];
    if (title) experience.title = title;
    if (organization) experience.organization = organization;
    if (description) experience.description = description;
    if (start) experience.start = start;
    if (end) experience.end = end;
    if (location) experience.location = location;
    if (type) experience.type = type;

    // Handle certificate update if file was uploaded
    if (req.file) {
      experience.certificate = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Experience updated successfully",
    });

  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({
      success: false,
      message: "Error updating experience",
      error: error.message
    });
  }
};

// Remove experience
export const removeExperience = async (req, res) => {
  try {
    const { expId } = req.params;
    const profile = await getOrCreateProfile(req.user._id);
    profile.experience = profile.experience.filter(exp => exp._id.toString() !== expId);
    await profile.save();
    // res.status(200).json({ message: "Experience removed", profile });
    res.status(200).json({ message: "Experience removed"});
  } catch (error) {
    res.status(500).json({ message: "Error removing experience", error: error.message });
  }
};

// Add education
export const addEducation = async (req, res) => {
  try {
    // Parse the JSON data from form-data or use req.body directly
    const educationData = req.body.data ? JSON.parse(req.body.data) : req.body;
    const { degree, organization, start, end, field, description } = educationData;

    // Validate required fields
    if (!degree || !organization || !start || !end || !field || !description) {
      return res.status(400).json({
        message: "All education fields are required",
        requiredFields: ["degree", "organization", "start", "end", "field", "description"]
      });
    }

    const profile = await getOrCreateProfile(req.user._id);

    // Create new education entry
    const newEducation = {
      degree,
      organization,
      start,
      end,
      field,
      description
    };

    // Add certificate if uploaded
    if (req.file) {
      newEducation.certificate = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    profile.education.push(newEducation);
    await profile.save();

    // Return the newly added education (without the buffer data)
    const addedEducation = profile.education[profile.education.length - 1].toObject();
    if (addedEducation.certificate) {
      delete addedEducation.certificate.data; // Remove binary data from response
    }

    res.status(201).json({
      success: true,
      message: "Education added successfully",
      education: addedEducation,
      // profile // Optional: include full profile if needed
    });

  } catch (error) {
    console.error('Error adding education:', error);
    res.status(500).json({
      success: false,
      message: "Error adding education",
      error: error.message
    });
  }
};

// Update education
export const updateEducation = async (req, res) => {
  try {
    const { eduId } = req.params;

    // Parse the JSON data from form-data or use req.body directly
    const educationData = req.body.data ? JSON.parse(req.body.data) : req.body;
    const { degree, organization, start, end, field, description } = educationData;

    const profile = await getOrCreateProfile(req.user._id);
    const eduIndex = profile.education.findIndex(edu => edu._id.toString() === eduId);

    if (eduIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Education not found"
      });
    }

    // Update only the fields that were provided
    const education = profile.education[eduIndex];
    if (degree) education.degree = degree;
    if (organization) education.organization = organization;
    if (start) education.start = start;
    if (end) education.end = end;
    if (field) education.field = field;
    if (description) education.description = description;

    // Handle certificate update if file was uploaded
    if (req.file) {
      education.certificate = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    await profile.save();

    // Convert to plain object and remove binary data
    const updatedEducation = profile.education[eduIndex].toObject();
    if (updatedEducation.certificate) {
      delete updatedEducation.certificate.data;
    }

    res.status(200).json({
      success: true,
      message: "Education updated successfully",
      // profile // Optional: include full profile if needed
    });

  } catch (error) {
    console.error('Error updating education:', error);
    res.status(500).json({
      success: false,
      message: "Error updating education",
      error: error.message
    });
  }
};

// Remove education
export const removeEducation = async (req, res) => {
  try {
    const { eduId } = req.params;
    const profile = await getOrCreateProfile(req.user._id);
    profile.education = profile.education.filter(edu => edu._id.toString() !== eduId);
    await profile.save();
    res.status(200).json({ message: "Education removed"});
  } catch (error) {
    res.status(500).json({ message: "Error removing education", error: error.message });
  }
};

// Add award
export const addAward = async (req, res) => {
  try {
    // Parse the JSON data from form-data or use req.body directly
    const awardData = req.body.data ? JSON.parse(req.body.data) : req.body;
    const { title, organization, year, description } = awardData;
    // const { title, organization, year, description } = req.body;

    if (!title || !organization || !year) {
      return res.status(400).json({
        message: "Title, organization and year are required"
      });
    }

    const profile = await getOrCreateProfile(req.user._id);

    const newAward = {
      title,
      organization,
      year,
      description
    };

    if (req.file) {
      newAward.certificate = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    profile.awards.push(newAward);
    await profile.save();

    res.status(201).json({
      message: "Award added successfully", 
      // profile
      award: profile.awards[profile.awards.length - 1] // Return the newly added award
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      message: "Error adding award",
      error: error.message
    });
  }
};

// Update award
export const updateAward = async (req, res) => {
  try {
    const { awardId } = req.params;
    const { title, organization, year, description } = req.body;

    const profile = await getOrCreateProfile(req.user._id);
    const awardIndex = profile.awards.findIndex(a => a._id.toString() === awardId);

    if (awardIndex === -1) {
      return res.status(404).json({ message: "Award not found" });
    }

    const award = profile.awards[awardIndex];

    if (title) award.title = title;
    if (organization) award.organization = organization;
    if (year) award.year = year;
    if (description) award.description = description;

    if (req.file) {
      award.certificate = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    await profile.save();

    res.status(200).json({
      message: "Award updated successfully",
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      message: "Error updating award",
      error: error.message
    });
  }
};


// Remove award
export const removeAward = async (req, res) => {
  try {
    const { awardId } = req.params;
    const profile = await getOrCreateProfile(req.user._id);

    const initialLength = profile.awards.length;
    profile.awards = profile.awards.filter(a => a._id.toString() !== awardId);

    if (profile.awards.length === initialLength) {
      return res.status(404).json({ message: "Award not found" });
    }

    await profile.save();
    res.status(200).json({ message: "Award removed successfully" });

  } catch (error) {
    res.status(500).json({
      message: "Error removing award",
      error: error.message
    });
  }
};

// add an event to expert profile
export const addExpertEvent = async (req, res) => {
  try {
    const { eventId } = req.body;

    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is a speaker in this event
    const isSpeaker = event.speakers.some(
      speaker => speaker.userId.toString() === req.user._id.toString()
    );

    if (!isSpeaker) {
      return res.status(403).json({
        success: false,
        message: 'User is not a speaker for this event'
      });
    }

    // Update profile...
    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $addToSet: { expertEvents: eventId } }, // Prevents duplicates
      { new: true, upsert: true } // Creates profile if doesn't exist
    );

    res.status(200).json({
      success: true,
      message: 'Event added to expert profile',
      data: profile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error adding expert event'
    });
  }
};


// Add a video
export const addVideo = async (req, res) => {
  try {
    // Handle both JSON and form-data
    const videoData = req.body.data ? JSON.parse(req.body.data) : req.body;

    const { title, platform, videoUrl, description } = videoData;

    // Validate required fields
    if (!title || !platform || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Title, platform and video URL are required",
        missingFields: [
          !title && 'title',
          !platform && 'platform',
          !videoUrl && 'videoUrl'
        ].filter(Boolean)
      });
    }

    const profile = await getOrCreateProfile(req.user._id);

    // Create new video with user-specified platform
    const newVideo = {
      title,
      platform, // Accept any platform name
      videoUrl,
      description: description || '',
      createdAt: new Date()
    };

    // Handle thumbnail upload
    if (req.file) {
      newVideo.thumbnail = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    profile.videos.push(newVideo);
    await profile.save();

    // Prepare clean response
    const addedVideo = {
      ...profile.videos[profile.videos.length - 1].toObject(),
      thumbnail: profile.videos[profile.videos.length - 1].thumbnail
        ? { contentType: profile.videos[profile.videos.length - 1].thumbnail.contentType }
        : undefined
    };

    res.status(201).json({
      success: true,
      message: "Video added successfully",
      video: addedVideo
    });

  } catch (error) {
    console.error('Error adding video:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Error adding video",
      error: error.message
    });
  }
};

// Update video
export const updateVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const videoData = req.body.data ? JSON.parse(req.body.data) : req.body;
    const { title, platform, videoUrl, description } = videoData;

    const profile = await getOrCreateProfile(req.user._id);
    const videoIndex = profile.videos.findIndex(v => v._id.toString() === videoId);

    if (videoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Video not found"
      });
    }

    const video = profile.videos[videoIndex];

    // Update fields if provided
    if (title) video.title = title;
    if (platform) video.platform = platform; // Accept any platform name
    if (videoUrl) video.videoUrl = videoUrl;
    if (description) video.description = description;

    // Update thumbnail if new file provided
    if (req.file) {
      video.thumbnail = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    await profile.save();

    // Prepare clean response
    const updatedVideo = {
      ...video.toObject(),
      thumbnail: video.thumbnail
        ? { contentType: video.thumbnail.contentType }
        : undefined
    };

    res.status(200).json({
      success: true,
      message: "Video updated successfully",
    });

  } catch (error) {
    console.error('Error updating video:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating video",
      error: error.message
    });
  }
};
// Delete thumbnail from video
// export const deleteVideoThumbnail = async (req, res) => {
//   try {
//     const { videoId } = req.params;
//     const profile = await getOrCreateProfile(req.user._id);
    
//     const videoIndex = profile.videos.findIndex(v => v._id.toString() === videoId);
//     if (videoIndex === -1) {
//       return res.status(404).json({ 
//         success: false,
//         message: "Video not found" 
//       });
//     }

//     // Check if thumbnail exists
//     if (!profile.videos[videoIndex].thumbnail) {
//       return res.status(400).json({ 
//         success: false,
//         message: "No thumbnail exists for this video" 
//       });
//     }

//     // Remove the thumbnail
//     profile.videos[videoIndex].thumbnail = undefined;
//     await profile.save();

//     res.status(200).json({ 
//       success: true,
//       message: "Thumbnail removed from video",
//       video: profile.videos[videoIndex]
//     });
//   } catch (error) {
//     console.error('Error removing video thumbnail:', error);
//     res.status(500).json({ 
//       success: false,
//       message: "Error removing thumbnail", 
//       error: error.message 
//     });
//   }
// };

// Delete video
export const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const profile = await getOrCreateProfile(req.user._id);

    const initialLength = profile.videos.length;
    profile.videos = profile.videos.filter(v => v._id.toString() !== videoId);

    if (profile.videos.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Video not found"
      });
    }

    await profile.save();
    res.status(200).json({
      success: true,
      message: "Video deleted successfully"
    });

  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      message: "Error deleting video",
      error: error.message
    });
  }
};


// Delete video thumbnail
export const deleteVideoThumbnail = async (req, res) => {
  try {
    const { videoId } = req.params;
    const profile = await getOrCreateProfile(req.user._id);

    // Find the video in the profile
    const videoIndex = profile.videos.findIndex(v => v._id.toString() === videoId);

    if (videoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Video not found"
      });
    }

    // Check if thumbnail exists
    if (!profile.videos[videoIndex].thumbnail) {
      return res.status(400).json({
        success: false,
        message: "Video doesn't have a thumbnail"
      });
    }

    // Remove the thumbnail
    profile.videos[videoIndex].thumbnail = undefined;
    await profile.save();

    res.status(200).json({
      success: true,
      message: "Video thumbnail removed successfully",
      video: profile.videos[videoIndex]
    });

  } catch (error) {
    console.error('Error deleting video thumbnail:', error);
    res.status(500).json({
      success: false,
      message: "Error deleting video thumbnail",
      error: error.message
    });
  }
};


// Delete certificate from experience
export const deleteExperienceCertificate = async (req, res) => {
  try {
    const { expId } = req.params;
    const profile = await getOrCreateProfile(req.user._id);

    const expIndex = profile.experience.findIndex(exp => exp._id.toString() === expId);
    if (expIndex === -1) {
      return res.status(404).json({ message: "Experience not found" });
    }

    profile.experience[expIndex].certificate = undefined;
    await profile.save();

    res.status(200).json({
      message: "Certificate removed from experience",
      experience: profile.experience[expIndex]
    });
  } catch (error) {
    res.status(500).json({
      message: "Error removing certificate",
      error: error.message
    });
  }
};

// Delete certificate from education
export const deleteEducationCertificate = async (req, res) => {
  try {
    const { eduId } = req.params;
    const profile = await getOrCreateProfile(req.user._id);

    const eduIndex = profile.education.findIndex(edu => edu._id.toString() === eduId);
    if (eduIndex === -1) {
      return res.status(404).json({ message: "Education not found" });
    }

    profile.education[eduIndex].certificate = undefined;
    await profile.save();

    res.status(200).json({
      message: "Certificate removed from education",
      education: profile.education[eduIndex]
    });
  } catch (error) {
    res.status(500).json({
      message: "Error removing certificate",
      error: error.message
    });
  }
};

// Delete certificate from award
export const deleteAwardCertificate = async (req, res) => {
  try {
    const { awardId } = req.params;
    const profile = await getOrCreateProfile(req.user._id);

    const awardIndex = profile.awards.findIndex(award => award._id.toString() === awardId);
    if (awardIndex === -1) {
      return res.status(404).json({ message: "Award not found" });
    }

    profile.awards[awardIndex].certificate = undefined;
    await profile.save();

    res.status(200).json({
      message: "Certificate removed from award",
      award: profile.awards[awardIndex]
    });
  } catch (error) {
    res.status(500).json({
      message: "Error removing certificate",
      error: error.message
    });
  }
};


// Add mutual review after event
export const addMutualReview = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { rating, remarks, eventId, reviewerType } = req.body;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (!['business', 'expert', 'freelancer'].includes(reviewerType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reviewer type'
      });
    }

    // Check if event exists and has ended
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (new Date(event.endDate) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Event has not ended yet'
      });
    }

    // Check authorization based on reviewer type
    let isAuthorized = false;
    if (reviewerType === 'business') {
      // For business reviews, user must be the event organizer
      isAuthorized = event.organizer.userId.toString() === req.user._id.toString();
    } else if (reviewerType === 'freelancer') {
      // For freelancer reviews, user must be the event organizer
      isAuthorized = event.organizer.userId.toString() === req.user._id.toString();
    }
    else if (reviewerType === 'expert') {
      // For expert reviews, user must be a speaker at the event
      isAuthorized = event.speakers.some(
        speaker => speaker.userId.toString() === req.user._id.toString()
      );
    }

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this profile for the specified event'
      });
    }

    // Check for existing review for this event
    const existingReview = await Profile.findOne({
      _id: profileId,
      'mutualReviews': {
        $elemMatch: {
          event: eventId,
          reviewer: req.user._id
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this profile for this event'
      });
    }

    // Add the new review
    const newReview = {
      reviewer: req.user._id,
      reviewerType,
      rating: Number(rating),
      remarks,
      event: eventId
    };

    // Update profile using findById + save() to trigger pre-save hooks
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Initialize expertEvents if undefined
    if (!profile.expertEvents) {
      profile.expertEvents = [];
    }

    // Add the new review
    profile.mutualReviews.push(newReview);

    // Add event to expertEvents if not already present
    if (!profile.expertEvents.includes(eventId)) {
      profile.expertEvents.push(eventId);
    }

    await profile.save();

    // Populate the response data
    const populatedProfile = await Profile.findById(profileId)
      .populate({
        path: 'mutualReviews.reviewer',
        select: 'name profileImage'
      })
      .populate({
        path: 'mutualReviews.event',
        select: 'topic eventDate'
      });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      profile: populatedProfile
    });

  } catch (error) {
    console.error('Error adding mutual review:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding review',
      error: error.message
    });
  }
};

// Get mutual reviews
export const getMutualReviews = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { type } = req.query; // 'business' or 'expert'

    const profile = await Profile.findById(profileId)
      .select('mutualReviews businessRatings expertRatings')
      .populate({
        path: 'mutualReviews.reviewer',
        select: 'name profileImage'
      })
      .populate({
        path: 'mutualReviews.event',
        select: 'topic eventDate'
      });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    let filteredReviews = profile.mutualReviews;
    if (type === 'business') {
      filteredReviews = profile.mutualReviews.filter(r => r.reviewerType === 'business');
    } else if (type === 'freelancer') {
      filteredReviews = profile.mutualReviews.filter(r => r.reviewerType === 'freelancer');
    } else if (type === 'expert') {
      filteredReviews = profile.mutualReviews.filter(r => r.reviewerType === 'expert');
    }

    res.status(200).json({
      success: true,
      businessRatings: profile.businessRatings,
      expertRatings: profile.expertRatings,
      reviews: filteredReviews
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};
