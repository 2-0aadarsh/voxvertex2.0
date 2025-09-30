import express from "express";
import { authenticateJWT, authorizeRoles } from "../middleware/jwtAuth.js";
import { 
  getAllSpeakerProfiles, 
  createSpeakerBooking,
  acceptBooking,
  declineBooking
} from "../controllers/bookSpeakerController.js";

const router = express.Router();

router.get(
  "/",
  authenticateJWT,              // ✅ First check JWT
  authorizeRoles("Organizer"),  // ✅ Only organizers allowed (check your role name!)
  getAllSpeakerProfiles
);
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("Organizer"), // ✅ only organizers allowed
  createSpeakerBooking
);

// Booking acceptance/decline routes
router.put(
  "/:bookingId/accept",
  authenticateJWT,
  authorizeRoles("Speaker"), // ✅ only speakers can accept bookings
  acceptBooking
);
router.put(
  "/:bookingId/decline",
  authenticateJWT,
  authorizeRoles("Speaker"), // ✅ only speakers can decline bookings
  declineBooking
);

export default router;  // ✅ THIS FIXES THE ERROR