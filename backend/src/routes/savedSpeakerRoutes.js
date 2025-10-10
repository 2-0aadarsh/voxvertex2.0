import express from "express";
import { authenticateJWT, authorizeRoles } from "../middleware/jwtAuth.js";
import {
  saveSpeaker,
  getSavedSpeakers,
  updateSavedSpeakerTags,
  removeSavedSpeaker,
  getOrganizerCustomTags,
  checkSpeakerSavedStatus,
  checkMultipleSpeakersSavedStatus
} from "../controllers/savedSpeakerController.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateJWT);

// Apply organizer authorization to all routes
router.use(authorizeRoles("Organizer"));

// Save a speaker with custom tags
// POST /api/saved-speakers
router.post("/", saveSpeaker);

// Get all saved speakers for organizer
// GET /api/saved-speakers
router.get("/", getSavedSpeakers);

// Check if a specific speaker is saved by organizer
// GET /api/saved-speakers/check/:speakerId
router.get("/check/:speakerId", checkSpeakerSavedStatus);

// Check saved status for multiple speakers (batch)
// POST /api/saved-speakers/check-batch
router.post("/check-batch", checkMultipleSpeakersSavedStatus);

// Update tags and notes for a saved speaker
// PUT /api/saved-speakers/:savedSpeakerId
router.put("/:savedSpeakerId", updateSavedSpeakerTags);

// Remove a saved speaker by speakerId (soft delete) - for bookmark toggle
// DELETE /api/saved-speakers/unsave/:speakerId
router.delete("/unsave/:speakerId", removeSavedSpeaker);

// Get all custom tags for organizer
// GET /api/saved-speakers/tags
router.get("/tags", getOrganizerCustomTags);

export default router;

