import express from 'express';
import {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getAllSubscriptionPlans,
  getSubscriptionPlanById,
  togglePlanStatus
} from '../controllers/adminSubscriptionPlanController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(requireAuth);
router.use(requireAdmin);

// Admin CRUD operations for subscription plans
router.post('/', createSubscriptionPlan);                    // Create new plan
router.get('/', getAllSubscriptionPlans);                    // Get all plans (including inactive)
router.get('/:id', getSubscriptionPlanById);                 // Get specific plan by ID
router.put('/:id', updateSubscriptionPlan);                  // Update existing plan
router.delete('/:id', deleteSubscriptionPlan);               // Delete plan (soft delete)
router.patch('/:id/toggle-status', togglePlanStatus);       // Toggle plan active/inactive status

export default router;

