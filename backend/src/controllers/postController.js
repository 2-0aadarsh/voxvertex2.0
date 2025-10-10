import Post from '../models/post.js'
import User from '../models/user.js';

export const createPost = async (req, res) => {
    try {
        const { caption, title } = req.body;
        
        // Get user from authenticated session
        const user_id = req.user._id; // Changed from req.params.userId
        const user = req.user; // Already available from ensureAuthenticated

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const mimeType = req.file.mimetype;
        const isImage = mimeType.startsWith('image');
        const isVideo = mimeType.startsWith('video');

        let mediaType;
        if (isImage) {
            mediaType = 'image';
        } else if (isVideo) {
            mediaType = 'video';
        } else {
            return res.status(400).json({ message: "Unsupported media type" });
        }

        const base64Data = req.file.buffer.toString('base64');
        const mediaData = `data:${mimeType};base64,${base64Data}`;

        const post = new Post({
            user_id,
            user_name: `${user.firstName} ${user.lastName}`,
            caption,
            title,
            mediaType,
            mediaData
        });

        await post.save();
        res.status(201).json({ message: 'Post saved', post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// export const getPosts = async (req, res) => {
//     try {
//         const { event_id, user_id } = req.query;
//         const filter = {};
//         if (event_id) filter.event_id = event_id;
//         if (user_id) filter.user_id = user_id;

//         const allPosts = await Post.find(filter).sort({ createdAt: -1 });
//         res.status(200).json(allPosts);
//     } catch (error) {
//         res.status(500).json({ error: 'error while showing all posts', message: error.message });
//     }
// }


// get posts by a user
export const getPosts = async (req, res) => {
    try {
        
        console.log('User making request:', req.user); 
        console.log('User ID from request:', req.user._id); 

        const allPosts = await Post.find({ user_id: req.user._id })
                                 .sort({ createdAt: -1 });
        res.status(200).json(allPosts);
    } catch (error) {
        res.status(500).json({ 
            error: 'Error while fetching posts', 
            message: error.message 
        });
    }
};


// delete post

export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Verify post belongs to authenticated user
        if (post.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized to delete this post" });
        }

        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// show a post

export const showPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findOne({ _id: postId });
        
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ 
            error: 'Error while fetching post', 
            message: error.message 
        });
    }
};


// share post link based on userId and postId
export const generateLink = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await Post.findOne({ _id: postId, user_id: req.user._id });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const baseUrl = process.env.FRONTEND_URL || "localhost:3000";
        const shareUrl = `${baseUrl}/posts/${postId}`;

        res.status(200).json({ shareUrl });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error generating share link', 
            error: error.message 
        });
    }
};