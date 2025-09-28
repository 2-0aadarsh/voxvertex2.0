import { Router } from 'express';
import {
    createDispute,
    getUserDisputes,
    getDisputeById,
    addMessage,
    escalateDispute,
    assignMediator,
    resolveDispute,
    getDisputeStats,
    submitEvidence
} from '../controllers/disputeController.js';
import { authenticateJWT } from '../middleware/jwtAuth.js';

const router = Router();

// All dispute routes require authentication
router.use(authenticateJWT);

// Dispute CRUD operations
router.post('/', createDispute);                    // Create new dispute
router.get('/', getUserDisputes);                   // Get user's disputes
router.get('/stats', getDisputeStats);             // Get dispute statistics
router.get('/:disputeId', getDisputeById);         // Get specific dispute

// Dispute actions
router.post('/:disputeId/messages', addMessage);           // Add message to dispute
router.post('/:disputeId/escalate', escalateDispute);      // Escalate dispute
router.post('/:disputeId/resolve', resolveDispute);        // Resolve dispute
router.post('/:disputeId/evidence', submitEvidence);       // Submit evidence

// Mediation specific
router.post('/:disputeId/assign-mediator', assignMediator); // Assign mediator

export default router;
