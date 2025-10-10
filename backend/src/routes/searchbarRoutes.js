import { Router } from 'express';
import {searchUsers} from '../controllers/searchbarController.js';
import { ensureAuthenticated } from '../middleware/ensureAuth.js';


const router = Router();

router.get('/', ensureAuthenticated, searchUsers);

export default router;