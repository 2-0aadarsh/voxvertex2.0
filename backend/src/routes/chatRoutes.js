// routes/chatRoutes.js
import { Router } from "express";
import { ensureAuthenticated } from "../middleware/ensureAuth.js";
import { getMessagesBetweenUsers, sendMessage, sharePost, shareProfile } from "../controllers/chatController.js";

const router = Router();

router.post('/', ensureAuthenticated, sendMessage);

router.post('/share-post', ensureAuthenticated, sharePost);

router.get('/:userId', ensureAuthenticated, getMessagesBetweenUsers); // Get chat with another user

router.post('/share-profile', ensureAuthenticated, shareProfile);

export default router;
