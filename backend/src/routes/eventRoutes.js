// Import required modules
import express from 'express';
import {
  createEvent, getAllEvents, getEventById,
  updateEvent, deleteEvent, getUserEvents
} from '../controllers/eventController.js';
import upload from '../middleware/upload.js';
// import { ensureAuthenticated } from '../middleware/ensureAuth.js';
import { authenticateJWT, authorizeRoles } from "../middleware/jwtAuth.js";


const router = express.Router();

// Create a new event
// router.post('/new-event',ensureAuthenticated, upload.single('eventBanner'), createEvent);
router.post('/new-event',authenticateJWT,              // ✅ First check JWT
  authorizeRoles("Organizer"),createEvent);

// Get all events
// router.get('/', ensureAuthenticated, getAllEvents);
router.get('/', getAllEvents);

// Get an event by ID
router.get('/:id',authenticateJWT,              // ✅ First check JWT
  authorizeRoles("Organizer"), getEventById);

// Update an event by ID
router.put('/:id',authenticateJWT,              // ✅ First check JWT
  authorizeRoles("Organizer"), updateEvent);

// Delete an event by ID
router.delete('/:id',authenticateJWT,              // ✅ First check JWT
  authorizeRoles("Organizer"), deleteEvent);

// get events for a speaker or an organizer
router.get('/user/me', authenticateJWT,              // ✅ First check JWT
  authorizeRoles("Organizer"), getUserEvents);

// Export the router
export default router;