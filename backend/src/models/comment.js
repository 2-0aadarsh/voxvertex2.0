import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, 
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  replyText: { 
    type: String, 
    required: true 
  },
  // replies: {  //  recursive replies 
  //   type: [this],
  //   default: [] // Initialize with an empty array 
  // },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
},  { _id: true });

const Reply = mongoose.model("Reply", replySchema);

const commentSchema = new mongoose.Schema({
  post_id: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  commentText: { type: String, required: true },
  replies: [replySchema]
}, { timestamps: true });

export default mongoose.model("Comment", commentSchema);
