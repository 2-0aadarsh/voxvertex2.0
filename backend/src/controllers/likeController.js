import Post from '../models/post.js';

export const toggleLike = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likedBy.includes(userId);

    if (alreadyLiked) {
      post.likedBy.pull(userId);
      post.likesCount = post.likedBy.length;
      await post.save();
      return res.status(200).json({ message: "Post unliked", likesCount: post.likesCount });
    } else {
      post.likedBy.push(userId);
      post.likesCount = post.likedBy.length;
      await post.save();
      return res.status(200).json({ message: "Post liked", likesCount: post.likesCount });
    }
  } catch (err) {
    res.status(500).json({ message: "Error toggling like", error: err.message });
  }
};

export const getLikesByPost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId).populate('likedBy', 'username _id');
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json({
      likesCount: post.likedBy.length,
      likedBy: post.likedBy
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching likes", error: err.message });
  }
};