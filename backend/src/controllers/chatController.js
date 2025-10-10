// controllers/chatController.js
import Message from "../models/message.js";
import Post from "../models/post.js";
import User from "../models/user.js";

// send messages
export const sendMessage = async (req, res) => {
  try {
    const { receiver, content, sharedProfile } = req.body;
    
    if (!content && !req.body.sharedPost && !sharedProfile) {
      return res.status(400).json({ message: "Message content, shared post, or shared profile is required" });
    }

    const newMsg = new Message({
      sender: req.user._id,
      receiver,
      content,
      sharedPost: req.body.sharedPost,
      sharedProfile
    });
    
    await newMsg.save();
    
    // Populate both shared post and profile if they exist
    let populatedMsg = await Message.findById(newMsg._id);
    if (populatedMsg.sharedPost) {
      populatedMsg = await populatedMsg.populate('sharedPost');
    }
    if (populatedMsg.sharedProfile) {
      populatedMsg = await populatedMsg.populate('sharedProfile', 'firstName lastName email');
    }
    
    res.status(201).json(populatedMsg);
  } catch (err) {
    res.status(500).json({ message: "Error sending message", error: err.message });
  }
};

// share a post with another user
export const sharePost = async (req, res) => {
  try {
    const { receiver, postId, content } = req.body;
    const sender = req.user._id;

    // Verify the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create a message with the shared post
    const newMsg = new Message({
      sender,
      receiver,
      sharedPost: postId,
      content: content || `Check out this post: ${post.caption}` 
    });

    await newMsg.save();
    
    // Populate the post details in the response
    const populatedMsg = await Message.findById(newMsg._id).populate('sharedPost');
    
    res.status(201).json(populatedMsg);
  } catch (err) {
    res.status(500).json({ message: "Error sharing post", error: err.message });
  }
};

// get messages between two users (updated to populate shared posts)
export const getMessagesBetweenUsers = async (req, res) => {
  try {
    const user1 = req.user._id;
    const user2 = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ]
    })
    .populate('sharedPost')
    .populate('sharedProfile', 'firstName lastName email') // Populate shared profiles
    .sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages", error: err.message });
  }
};

// share a user profile with another user
export const shareProfile = async (req, res) => {
  try {
    const { receiver, profileId, content } = req.body;
    const sender = req.user._id;

    // Verify the profile exists
    const profileToShare = await User.findById(profileId);
    if (!profileToShare) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Don't allow sharing your own profile (optional)
    if (profileId === sender.toString()) {
      return res.status(400).json({ message: "Cannot share your own profile" });
    }

    // Create a message with the shared profile
    const newMsg = new Message({
      sender,
      receiver,
      sharedProfile: profileId,
      content: content || `Check out this profile: ${profileToShare.firstName} ${profileToShare.lastName}`
    });

    await newMsg.save();
    
    // Populate the profile details in the response
    const populatedMsg = await Message.findById(newMsg._id)
      .populate('sharedProfile', 'firstName lastName email'); // Only include necessary fields
    
    res.status(201).json(populatedMsg);
  } catch (err) {
    res.status(500).json({ message: "Error sharing profile", error: err.message });
  }
};