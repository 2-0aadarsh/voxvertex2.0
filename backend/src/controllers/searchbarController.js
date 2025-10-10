import User from "../models/user.js"
import Post from "../models/post.js"

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.trim() === "") {
            return res.status(400).json({ message: "search bar can't be empty" });
        }

        const users = await User.find({
            $or: [
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { mobileNo: { $regex: query, $options: 'i' } }
            ]
        }).select('firstName lastName email mobileNo');

        const posts = await Post.find({
            $or: [
                { caption: { $regex: query, $options: 'i' } },
                { title: { $regex: query, $options: 'i' } } // Assuming posts have mediaData with title
            ]
        })
            .populate('user_id', 'firstName lastName profileImage')
            .select('caption title user_id createdAt');

        res.status(200).json({users, posts});
    } catch (error) {
        res.status(500).json({ message: "Error searching users", error: error.message });
    }
}