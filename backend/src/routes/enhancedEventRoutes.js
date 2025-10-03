import express from 'express';
import {
  createEnhancedEvent,
  getAllEnhancedEvents,
  getEnhancedEventById,
  updateEnhancedEvent,
  deleteEnhancedEvent,
  getUserEnhancedEvents,
  publishEnhancedEvent,
  saveEventDraft,
  getEventDrafts,
  updateEventDraft,
  deleteEventDraft,
  validateEvent,
  getEventSpeakers,
  getEventStats
} from '../controllers/enhancedEventController.js';
import upload from '../middleware/upload.js';
import { authenticateJWT, authorizeRoles } from "../middleware/jwtAuth.js";

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllEnhancedEvents); // Get published events (public)
router.get('/published', getAllEnhancedEvents); // Get published events (public)


// Apply authentication to all other routes
router.use(authenticateJWT);
router.get('/:id', getEnhancedEventById); // Get specific event (public if published)

// Protected Event Management Routes
router.post('/', authorizeRoles("Organizer"), createEnhancedEvent);
router.get('/user/me', authorizeRoles("Organizer"), getUserEnhancedEvents);
router.put('/:id', authorizeRoles("Organizer"), updateEnhancedEvent);
router.delete('/:id', authorizeRoles("Organizer"), deleteEnhancedEvent);

// Event Publishing Routes
router.patch('/:id/publish', authorizeRoles("Organizer"), publishEnhancedEvent);
router.post('/:id/validate', authorizeRoles("Organizer"), validateEvent);

// Draft Management Routes
router.post('/drafts', authorizeRoles("Organizer"), saveEventDraft);
router.get('/drafts', authorizeRoles("Organizer"), getEventDrafts);
router.put('/drafts/:id', authorizeRoles("Organizer"), updateEventDraft);
router.delete('/drafts/:id', authorizeRoles("Organizer"), deleteEventDraft);

// Event Data Routes
router.get('/:id/speakers', authorizeRoles("Organizer"), getEventSpeakers);
router.get('/:id/stats', authorizeRoles("Organizer"), getEventStats);

export default router;

