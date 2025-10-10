import express from 'express';
import { getHome } from '../controllers/exploreController.js';
import { ensureAuthenticated } from '../middleware/ensureAuth.js';

const router = express.Router();

router.get('/', ensureAuthenticated, getHome);

export default router;
