import EnhancedUser from '../models/enhancedUser.js';

/**
 * Get user privacy settings
 * @route GET /api/privacy/settings
 */
export const getPrivacySettings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const user = await EnhancedUser.findById(req.user._id).select('privacySettings');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user.privacySettings
    });
  } catch (error) {
    console.error('Get privacy settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Update user privacy settings
 * @route PUT /api/privacy/settings
 */
export const updatePrivacySettings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const { 
      profileVisibility, 
      showContactInformation, 
      showEmail, 
      showPhone, 
      showLocation, 
      showSocialLinks, 
      showExperience, 
      showEducation, 
      showAwards 
    } = req.body;

    // Validate profileVisibility
    const validVisibilityOptions = ['public', 'private', 'connections'];
    if (profileVisibility && !validVisibilityOptions.includes(profileVisibility)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile visibility option'
      });
    }

    const updateData = {};
    
    if (profileVisibility !== undefined) updateData['privacySettings.profileVisibility'] = profileVisibility;
    if (showContactInformation !== undefined) updateData['privacySettings.showContactInformation'] = showContactInformation;
    if (showEmail !== undefined) updateData['privacySettings.showEmail'] = showEmail;
    if (showPhone !== undefined) updateData['privacySettings.showPhone'] = showPhone;
    if (showLocation !== undefined) updateData['privacySettings.showLocation'] = showLocation;
    if (showSocialLinks !== undefined) updateData['privacySettings.showSocialLinks'] = showSocialLinks;
    if (showExperience !== undefined) updateData['privacySettings.showExperience'] = showExperience;
    if (showEducation !== undefined) updateData['privacySettings.showEducation'] = showEducation;
    if (showAwards !== undefined) updateData['privacySettings.showAwards'] = showAwards;

    const user = await EnhancedUser.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, select: 'privacySettings' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: user.privacySettings
    });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get public profile data (respecting privacy settings)
 * @route GET /api/privacy/public-profile/:userId
 */
export const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?._id;

    const user = await EnhancedUser.findById(userId).select(
      'firstName lastName profileImageUrl bio professionalTitle location areaOfExpertise yearsOfExperience roleSpecificData privacySettings'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if profile is public or if current user has access
    const isPublic = user.privacySettings.profileVisibility === 'public';
    const isCurrentUser = currentUserId && currentUserId.toString() === userId;
    
    if (!isPublic && !isCurrentUser) {
      return res.status(403).json({
        success: false,
        message: 'Profile is private'
      });
    }

    // Filter data based on privacy settings
    const publicData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      role: user.role
    };

    // Add data based on privacy settings
    if (user.privacySettings.showContactInformation) {
      if (user.privacySettings.showEmail) {
        publicData.email = user.email;
      }
      if (user.privacySettings.showPhone) {
        publicData.mobileNo = user.mobileNo;
      }
    }

    if (user.privacySettings.showLocation) {
      publicData.location = user.location;
    }

    if (user.privacySettings.showSocialLinks && user.roleSpecificData?.socialLinks) {
      publicData.socialLinks = user.roleSpecificData.socialLinks;
    }

    if (user.privacySettings.showExperience) {
      publicData.bio = user.bio;
      publicData.professionalTitle = user.professionalTitle;
      publicData.areaOfExpertise = user.areaOfExpertise;
      publicData.yearsOfExperience = user.yearsOfExperience;
    }

    res.status(200).json({
      success: true,
      data: publicData
    });
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
