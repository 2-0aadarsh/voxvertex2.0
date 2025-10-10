import UserRole from '../models/userRole.js';
import Post from '../models/post.js';
import mongoose from 'mongoose';

export const getHome = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // 1. Get user's interests (subFields)
        const userRole = await UserRole.findOne({ userId });
        if (!userRole) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Prepare regex pattern for matching subfields
        const subFields = userRole.subField.map(s => s.toLowerCase());
        const subFieldsRegex = new RegExp(subFields.join("|"), "i");

        // 3. Find relevant posts (excluding user's own posts)
        const posts = await Post.find({
            $and: [
                {
                    $or: [
                        { caption: { $regex: subFieldsRegex } },
                        { title: { $regex: subFieldsRegex } }
                    ]
                },
                { user_id: { $ne: userId } } // Exclude user's own posts
            ]
        })
        .sort({ createdAt: -1 }) // Newest first
        .limit(20) // Limit results
        .populate('user_id', 'firstName lastName profileImage'); // Add user info

        res.status(200).json({ 
            success: true,
            posts,
            count: posts.length
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
}