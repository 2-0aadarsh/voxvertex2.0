import express from 'express';
import { 
  searchSpeakers, 
  getSpeakerSuggestions, 
  searchSpeakersWithFilters,
  getAvailableEventTypes,
  getSavedSpeakersForDatabase,
  getSavedSpeakersWithTags
} from '../controllers/speakerSearchController.js';
import { authenticateJWT, authorizeRoles } from '../middleware/jwtAuth.js';

const router = express.Router();

// Search speakers by keywords
router.get('/search', authenticateJWT, searchSpeakers);

// Get speaker suggestions for autocomplete
router.get('/suggestions', authenticateJWT, getSpeakerSuggestions);

// Search and filter speakers based on availability and other criteria
router.get('/filter', authenticateJWT, searchSpeakersWithFilters);

// Get available event types and sub types for filtering
router.get('/event-types', authenticateJWT, getAvailableEventTypes);

// Get saved speakers for database view (organizer only)
router.get('/saved', authenticateJWT, authorizeRoles("Organizer"), getSavedSpeakersForDatabase);

// Get saved speakers with custom tags (organizer only)
router.get('/saved-with-tags', authenticateJWT, authorizeRoles("Organizer"), getSavedSpeakersWithTags);

export default router;