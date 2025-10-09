import express from 'express';
import { authenticateJWT } from '../middleware/jwtAuth.js';
import { 
  getPrivacySettings, 
  updatePrivacySettings, 
  getPublicProfile 
} from '../controllers/privacyController.js';

const router = express.Router();

// Get user's privacy settings
router.get('/settings', authenticateJWT, getPrivacySettings);

// Update user's privacy settings
router.put('/settings', authenticateJWT, updatePrivacySettings);

// Get public profile (respecting privacy settings)
router.get('/public-profile/:userId', getPublicProfile);

export default router;
