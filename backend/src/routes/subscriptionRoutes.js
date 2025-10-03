import express from 'express';
import { createSubscription, getAllPlans, assignSubscriptionToUser } from '../controllers/subscriptionController.js';

const router = express.Router();

router.get('/', getAllPlans);
router.post("/", createSubscription);
router.post("/assign", assignSubscriptionToUser);

export default router;
