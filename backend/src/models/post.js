import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  user_name: {  // New field to store user's full name
    type: String,
    required: false
  },
  caption: { type: String, default: '', required: true },
  mediaData: { type: String },
  title : {type: String, default: ''},
  mediaType: { type: String, enum: ['image', 'video'], required: true },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

postSchema.index({ caption: "text" });

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
export default Post;

