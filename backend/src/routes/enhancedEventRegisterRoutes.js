import express from "express";
import { authenticateJWT, authorizeRoles } from "../middleware/jwtAuth.js";
import {
  registerForEnhancedEvent,
  createPaymentForEnhancedEvent,
  verifyEnhancedEventPayment,
  getEnhancedEventRegistrationSummary,
  getEnhancedEventParticipants,
  getUserEnhancedEventRegistrations,
  cleanupExpiredReservations
} from "../controllers/enhancedEventRegisterController.js";

const router = express.Router();

// ============================================================================
// ENHANCED EVENT REGISTRATION ROUTES
// ============================================================================

/**
 * STEP 1: Register for Enhanced Event
 * POST /api/enhanced-events/:eventId/register
 * 
 * Requires: Authentication (JWT token)
 * 
 * Body:
 * {
 *   "ticketTierId": "ticket_tier_object_id",
 *   "registrant": {
 *     "name": "John Doe",
 *     "email": "john@example.com",
 *     "phone": "+1234567890"
 *   },
 *   "additionalParticipants": [
 *     {
 *       "name": "Jane Doe",
 *       "email": "jane@example.com", 
 *       "phone": "+1234567891"
 *     }
 *   ]
 * }
 */
router.post("/:eventId/register", authenticateJWT, registerForEnhancedEvent);

/**
 * STEP 2: Create Payment Order for Enhanced Event Registration
 * POST /api/enhanced-events/registrations/:registrationId/create-payment
 * 
 * Requires: Authentication (JWT token)
 * 
 * Body:
 * {
 *   "paymentMethodId": "payment_method_id"
 * }
 */
router.post("/registrations/:registrationId/create-payment", authenticateJWT, createPaymentForEnhancedEvent);

/**
 * STEP 3: Verify Payment for Enhanced Event Registration
 * POST /api/enhanced-events/registrations/:registrationId/verify-payment
 * 
 * Requires: Authentication (JWT token)
 * 
 * Body:
 * {
 *   "razorpay_order_id": "order_id",
 *   "razorpay_payment_id": "payment_id",
 *   "razorpay_signature": "signature"
 * }
 */
router.post("/registrations/:registrationId/verify-payment", authenticateJWT, verifyEnhancedEventPayment);

/**
 * STEP 4: Get Enhanced Event Registration Summary
 * GET /api/enhanced-events/registrations/:registrationId/summary
 * 
 * Requires: Authentication (JWT token)
 * Returns complete registration details including event info
 */
router.get("/registrations/:registrationId/summary", authenticateJWT, getEnhancedEventRegistrationSummary);

/**
 * Get Enhanced Event Participants (for organizers)
 * GET /api/enhanced-events/:eventId/participants
 * 
 * Requires authentication and organizer role
 * Returns all confirmed participants for an event
 */
router.get("/:eventId/participants", authenticateJWT, authorizeRoles("Organizer"), getEnhancedEventParticipants);

/**
 * Get User's Enhanced Event Registrations
 * GET /api/enhanced-events/user/registrations
 * 
 * Requires authentication
 * Returns all registrations for the current user
 */
router.get("/user/registrations", authenticateJWT, getUserEnhancedEventRegistrations);

// Reservation Management Routes
router.post("/cleanup-expired-reservations", authenticateJWT, authorizeRoles("Organizer"), cleanupExpiredReservations);

export default router;
