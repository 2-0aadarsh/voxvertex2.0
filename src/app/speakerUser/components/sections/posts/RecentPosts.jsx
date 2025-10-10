"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiFileText,
  FiDownload,
  FiMoreVertical,
  FiTrash2,
  FiEdit,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const MediaGallery = ({ media }) => {
  if (!media || media.length === 0) return null;

  // Debug media items
  console.log("🖼️ Media items in gallery:", media);

  return (
    <div className="mt-3 mb-4">
      <div className="flex flex-wrap gap-2">
        {media.map((item, idx) => {
          // Debug individual item
          console.log(`Media item ${idx}:`, item);

          // Handle different media object structures
          let mediaUrl = null;
          let mediaType = null;
          let mediaFilename = null;

          // Check if item has cloudinaryUrl (from server response)
          if (item.cloudinaryUrl) {
            mediaUrl = item.cloudinaryUrl;
            mediaType = item.type;
            mediaFilename = item.filename;
          }
          // Check if item has url property (from client preview)
          else if (item.url) {
            mediaUrl = item.url;
            mediaType = item.type;
            mediaFilename = item.filename;
          }
          // Handle direct string URLs
          else if (typeof item === "string") {
            mediaUrl = item;
            // Try to determine type from URL
            if (
              item.includes("image") ||
              /\.(jpg|jpeg|png|gif|webp)$/i.test(item)
            ) {
              mediaType = "image";
            } else {
              mediaType = "document";
            }
            mediaFilename = "File";
          }

          console.log(`Processed media item ${idx}:`, {
            mediaUrl,
            mediaType,
            mediaFilename,
          });

          // Test if image URL is accessible
          if (mediaType === "image" && mediaUrl) {
            const testImg = new Image();
            testImg.onload = () => {
              console.log(
                "🔍 Test image loaded successfully:",
                mediaUrl,
                "Dimensions:",
                testImg.naturalWidth,
                "x",
                testImg.naturalHeight
              );
            };
            testImg.onerror = () => {
              console.error("🔍 Test image failed to load:", mediaUrl);
            };
            testImg.src = mediaUrl;
          }

          if (mediaType === "image") {
            return (
              <div
                key={idx}
                onClick={() => window.open(mediaUrl, "_blank")}
                style={{ cursor: "pointer", display: "inline-block" }}
              >
                <img
                  src={mediaUrl}
                  alt={mediaFilename || "Post image"}
                  width="96"
                  height="96"
                  style={{
                    objectFit: "cover",
                    borderRadius: "8px",
                    display: "block",
                  }}
                  onLoad={() => {
                    console.log("✅ Image loaded successfully:", mediaUrl);
                  }}
                  onError={() => {
                    console.error("❌ Image failed to load:", mediaUrl);
                  }}
                />
              </div>
            );
          } else {
            return (
              <a
                key={idx}
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-24 h-24 bg-gray-100 flex flex-col items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors"
              >
                <FiFileText className="text-gray-500 text-xl mb-1" />
                <p className="text-xs text-gray-500 truncate px-2 w-full text-center">
                  {mediaFilename || "Document"}
                </p>
                <FiDownload className="text-gray-400 text-xs mt-1" />
              </a>
            );
          }
        })}
      </div>
    </div>
  );
};

// Post menu component
const PostMenu = ({ postId, post, onDelete, onEdit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(
    post?.caption || post?.content || ""
  );

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleEdit = async () => {
    if (isEditing) return;

    try {
      setIsEditing(true);

      // Call API to update post using the correct enhanced-posts endpoint
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL ||
        "https://voxvertex20-production.up.railway.app/api"
      }/enhanced-posts/${postId}`;
      const response = await fetch(apiUrl, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caption: editContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update post");
      }

      const result = await response.json();

      // Close menu and notify parent with updated post
      setIsOpen(false);
      setIsEditing(false);
      onEdit(postId, result.post);
      toast.success("Post updated successfully");
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error(error.message || "Failed to update post");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);

      // Call API to delete post using the correct enhanced-posts endpoint
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL ||
        "https://voxvertex20-production.up.railway.app/api"
      }/enhanced-posts/${postId}`;
      const response = await fetch(apiUrl, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete post");
      }

      // Close menu and notify parent
      setIsOpen(false);
      onDelete(postId);
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error(error.message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={toggleMenu}
        whileHover={{ scale: 1.2, rotate: 10, color: "#FF6B35" }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="text-[rgba(107,114,128,0.65)] p-1 rounded-full hover:bg-gray-100"
      >
        <FiMoreVertical size={18} />
      </motion.button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                setIsEditing(true);
              }}
            >
              <FiEdit className="mr-2" /> Edit
            </button>
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
              role="menuitem"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <FiTrash2 className="mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Edit Post
            </h3>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="What's on your mind?"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post?.caption || post?.content || "");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={isEditing || !editContent.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isEditing ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RecentPosts = ({ recentPosts, onPostDelete, onPostEdit }) => {
  // Limit to showing only the 3 most recent posts
  const displayPosts = recentPosts.slice(0, 3);

  const handlePostDelete = (postId) => {
    if (onPostDelete) {
      onPostDelete(postId);
    }
  };

  const handlePostEdit = (postId, updatedPost) => {
    if (onPostEdit) {
      onPostEdit(postId, updatedPost);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-black font-medium text-lg">Recent Posts</h3>

        <motion.button
          whileHover={{ scale: 1.05, color: "#FF6B35" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-[#FF6B35] text-sm font-medium flex items-center cursor-pointer"
        >
          View All ({recentPosts.length})
        </motion.button>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {displayPosts.length > 0 ? (
          displayPosts.map((post, index) => (
            <motion.div
              key={post._id || index}
              whileHover={{
                scale: 1.001,
                boxShadow: "0px 4px 12px rgba(0,0,0,0.12)",
              }}
              transition={{ type: "spring", stiffness: 250, damping: 18 }}
              className="bg-[rgba(255,107,53,0.1)] border border-[rgba(255,107,53,0.24)] rounded-2xl p-5 transition-all"
            >
              {/* Post content */}
              <p className="text-[rgba(0,0,0,0.6)] text-sm leading-relaxed">
                {post.caption || post.content}
              </p>

              {/* Media gallery */}
              <MediaGallery media={post.media} />

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-[rgba(107,114,128,0.65)] font-medium">
                    {post.date}
                  </span>
                  <span className="text-xs text-[rgba(107,114,128,0.65)] font-medium">
                    {post.likes} likes
                  </span>
                  <span className="text-xs text-[rgba(107,114,128,0.65)] font-medium">
                    {post.comments} comments
                  </span>
                </div>

                <PostMenu
                  postId={post._id}
                  post={post}
                  onDelete={handlePostDelete}
                  onEdit={handlePostEdit}
                />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No posts yet. Be the first to share something!
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentPosts;
