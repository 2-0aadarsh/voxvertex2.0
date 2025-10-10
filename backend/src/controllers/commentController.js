import Comment from '../models/comment.js';
import Post from '../models/post.js';
import mongoose from 'mongoose';

//add a comment
export const addComment = async (req, res) => {
    try {
        const post_id = req.params.postId;
        const { commentText } = req.body;
        const user_id = req.user._id;
        
        if (!commentText) {
            return res.status(400).json({ message: "Comment can't be empty." });
        }

        // Create comment
        const newComment = await Comment.create({ post_id, user_id, commentText });
        
        // Increment post's comment count
        await Post.findByIdAndUpdate(post_id, { 
            $inc: { commentCount: 1 } 
        });

        // Populate the user details
        const populatedComment = await Comment.findById(newComment._id)
            .populate('user_id', 'firstName lastName')
            .exec();

        // Format the response
        const response = {
            message: "Comment added successfully.",
            comment: {
                _id: populatedComment._id,
                post_id: populatedComment.post_id,
                commentText: populatedComment.commentText,
                createdAt: populatedComment.createdAt,
                updatedAt: populatedComment.updatedAt,
                user_id: {
                    _id: populatedComment.user_id._id,
                    firstName: populatedComment.user_id.firstName,
                    lastName: populatedComment.user_id.lastName
                },
                replies: populatedComment.replies || []
            }
        };

        res.status(201).json(response);
    } catch (err) {
        res.status(500).json({ 
            message: "Error adding comment", 
            error: err.message 
        });
    }
}

// get all comments for a post
export const getComments = async (req, res) => {
  try {
    const post_id = req.params.postId;

    const comments = await Comment.find({ post_id })
      .populate({
        path: 'user_id',
        select: 'firstName lastName'
      })
      .populate({
        path: 'replies.user_id',
        select: 'firstName lastName'
      })

      // Add more levels if needed
      .sort({ createdAt: -1 });

    res.status(200).json({ comments });
  } catch (err) {
    res.status(500).json({ 
      message: "Error fetching comments", 
      error: err.message 
    });
  }
};

// add reply to a comment
export const addReply = async (req, res) => {
    try {
        const comment_id = req.params.commentId;
        const {replyText} = req.body;
        const user_id = req.user._id;

        const comment = await Comment.findById(comment_id);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        if (!replyText) {
            return res.status(400).json({ message: "Reply can't be empty." })
        }

        comment.replies.push({ user_id, replyText });
        await comment.save();

        res.status(200).json({ message: "Reply added", comment });
    } catch (err) {
        res.status(500).json({ message: "Error adding reply", error: err.message });
    }
};

// delete a comment
export const deleteComment = async (req, res) => {
    try {
        const comment_id = req.params.commentId;
        const user_id = req.user._id;

        const delComment = await Comment.findById(comment_id);
        if (!delComment) {
            return res.status(404).json({ message: "Comment not found!" });
        }

        if (!delComment.user_id.equals(user_id)) {
            return res.status(403).json({ message: "Unauthorized user!" });
        }

        // Delete comment and decrement count
        await Promise.all([
            delComment.deleteOne(),
            Post.findByIdAndUpdate(delComment.post_id, {
                $inc: { commentCount: -1 }
            })
        ]);

        res.status(200).json({ message: "Comment deleted successfully!" });
    } catch (err) {
        res.status(500).json({ 
            message: "Error deleting comment.", 
            error: err.message 
        });
    }
}

//delete a reply
export const deleteReply = async (req, res) => {
    try {
        const { commentId, replyId } = req.params;
        const user_id = req.user._id;

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        const reply = comment.replies.id(replyId);
        if (!reply) return res.status(404).json({ message: "Reply not found" });

        if (!reply.user_id.equals(user_id)) {
            return res.status(403).json({ message: "Not authorized to delete this reply" });
        }

        // reply.remove();
        comment.replies.pull(replyId);
        await comment.save();

        res.status(200).json({ message: "Reply deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting reply", error: err.message });
    }
};



export const addNestedReply = async (req, res) => {
  try {
    const { commentId, parentReplyId } = req.params;
    const { replyText } = req.body;
    const user_id = req.user._id;

    if (!replyText) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    if (!mongoose.isValidObjectId(parentReplyId)) {
      return res.status(400).json({ message: "Invalid parent reply ID format" });
    }

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Find the parent reply
    const parentReply = findReplyInTree(comment.replies, parentReplyId);
    if (!parentReply) {
      return res.status(404).json({ message: "Parent reply not found" });
    }

    // Initialize replies array if it doesn't exist
    if (!parentReply.replies) {
      parentReply.replies = [];
    }

    // Create new reply with explicit _id
    const newReply = {
      _id: new mongoose.Types.ObjectId(), // Explicitly create ID
      user_id,
      replyText,
      replies: [],
      createdAt: new Date()
    };

    // Add the new reply
    parentReply.replies.push(newReply);

    // Save the comment
    await comment.save();

    // Get the fully populated version
    const populatedComment = await Comment.findById(commentId)
      .populate({
        path: 'replies.user_id',
        select: 'firstName lastName'
      })
      .populate({
        path: 'replies.replies.user_id',
        select: 'firstName lastName'
      });

    // Find the newly added reply
    const savedReply = findReplyInTree(populatedComment.replies, newReply._id);

    if (!savedReply) {
      throw new Error("Failed to retrieve the newly created reply");
    }

    return res.status(201).json({
      message: "Nested reply added successfully",
      reply: savedReply
    });

  } catch (err) {
    console.error("Nested reply error:", err);
    return res.status(500).json({
      message: "Error adding nested reply",
      error: err.message
    });
  }
}

// Helper function with improved ID handling
function findReplyInTree(replies, targetId) {
  if (!replies || !targetId) return null;
  
  // Normalize targetId to ObjectId
  const targetObjId = targetId instanceof mongoose.Types.ObjectId 
    ? targetId 
    : new mongoose.Types.ObjectId(targetId);

  for (const reply of replies) {
    // Check current reply
    if (reply._id && reply._id.equals(targetObjId)) {
      return reply;
    }
    
    // Check nested replies
    if (reply.replies && reply.replies.length > 0) {
      const found = findReplyInTree(reply.replies, targetId);
      if (found) return found;
    }
  }
  return null;
}