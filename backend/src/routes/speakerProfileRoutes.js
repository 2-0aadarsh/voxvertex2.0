// ============================================================================
// SPEAKER PROFILE ROUTES - Detailed Speaker Profile API Endpoints
// ============================================================================

import { Router } from 'express';
import {
    getDetailedSpeakerProfile,
    getSpeakerWorkExperience,
    getSpeakerEducation,
    getSpeakerAwards,
    getSpeakerFeaturedVideos
} from '../controllers/speakerProfileController.js';
import { ensureAuthenticated } from '../middleware/ensureAuth.js';

const router = Router();

// Note: Speaker profile routes are public - anyone can view speaker profiles
// Only authenticated users can edit their own profiles (future feature)

// ============================================================================
// DETAILED SPEAKER PROFILE ENDPOINTS
// ============================================================================

// Get comprehensive speaker profile with all related data
router.get('/:speakerId/detailed', getDetailedSpeakerProfile);

// Get individual sections (for lazy loading)
router.get('/:speakerId/work-experience', getSpeakerWorkExperience);
router.get('/:speakerId/education', getSpeakerEducation);
router.get('/:speakerId/awards', getSpeakerAwards);
router.get('/:speakerId/videos', getSpeakerFeaturedVideos);

export default router;