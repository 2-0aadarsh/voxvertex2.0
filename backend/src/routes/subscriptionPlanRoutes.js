import express from 'express';
import {
  getActiveSubscriptionPlans,
  getPopularSubscriptionPlans,
  getSubscriptionPlanById
} from '../controllers/subscriptionPlanController.js';

const router = express.Router();

// Public routes for reading subscription plans
router.get('/', getActiveSubscriptionPlans);                  // Get all active plans
router.get('/popular', getPopularSubscriptionPlans);         // Get popular plans only
router.get('/:id', getSubscriptionPlanById);                  // Get specific plan by ID (public)

export default router;
