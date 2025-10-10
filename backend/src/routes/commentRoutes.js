import { Router } from 'express'
import { ensureAuthenticated } from '../middleware/ensureAuth.js';
import {
    addComment,
    getComments,
    addReply,
    deleteComment,
    deleteReply,
    addNestedReply
} from '../controllers/commentController.js';

const router = Router()

// to add a comment
router.post('/:postId', ensureAuthenticated, addComment);

// to get all comments for a post
router.get('/:postId/comments', ensureAuthenticated, getComments);

// to reply to a comment
router.post('/:commentId/reply', ensureAuthenticated, addReply);

// to delete a comment
router.post('/:commentId/deleteComment', ensureAuthenticated, deleteComment);

// to delete a reply
router.post('/:commentId/:replyId/deleteReply', ensureAuthenticated, deleteReply);

//nested routes for replies
// router.post('/:commentId/replies/:parentReplyId/reply', ensureAuthenticated, addNestedReply);

export default router;