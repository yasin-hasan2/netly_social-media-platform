import sharp from "sharp";
import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { memoryStore } from "../lib/memoryStore.js";
import { createAndEmitNotification, handleMentions } from "../lib/notificationHelper.js";

export const addNewPost = async (req, res) => {
  try {
    const { caption, location, feeling } = req.body;
    let { tags, postType } = req.body;
    const mediaFile = req.file;
    const authorId = req.user ? req.user._id : req.id;

    // Parse tags if provided
    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else if (typeof tags === "string") {
        try {
          const parsed = JSON.parse(tags);
          parsedTags = Array.isArray(parsed) ? parsed : [tags];
        } catch {
          parsedTags = tags
            .split(",")
            .map((t) => t.trim().replace(/^#/, ""))
            .filter(Boolean);
        }
      }
    }

    if (!mediaFile && (!caption || !caption.trim())) {
      return res.status(400).json({
        message: "Please write a caption or select a photo/video to share",
        success: false,
      });
    }

    let imageUrl = "";
    let videoUrl = "";
    const isVideo = mediaFile && mediaFile.mimetype.startsWith("video/");
    const detectedType = postType || (isVideo ? "reel" : "post");

    // Process media buffer
    if (mediaFile) {
      if (isVideo) {
        // Handle Video: Base64 data URI or Cloudinary video upload
        const videoDataUri = `data:${mediaFile.mimetype || "video/mp4"};base64,${mediaFile.buffer.toString("base64")}`;
        videoUrl = videoDataUri;

        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
          try {
            const cloudResponse = await cloudinary.uploader.upload(videoDataUri, {
              resource_type: "video",
              transformation: [
                { quality: "auto:eco", fetch_format: "auto" }
              ]
            });
            videoUrl = cloudResponse.secure_url;
          } catch (cloudErr) {
            console.warn("Cloudinary video upload failed, falling back to data URI:", cloudErr.message);
          }
        }
      } else {
        // Handle Image: Sharp compression & resizing to reduce footprint
        let fileUri;
        try {
          const optimizedImageBuffer = await sharp(mediaFile.buffer)
            .resize({
              width: 1200,
              height: 1200,
              fit: "inside",
            })
            .toFormat("jpeg", { quality: 85 })
            .toBuffer();
          fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString("base64")}`;
        } catch (sharpErr) {
          console.warn("Sharp resizing failed, using raw buffer:", sharpErr.message);
          fileUri = `data:${mediaFile.mimetype || "image/jpeg"};base64,${mediaFile.buffer.toString("base64")}`;
        }

        imageUrl = fileUri;
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
          try {
            const cloudResponse = await cloudinary.uploader.upload(fileUri);
            imageUrl = cloudResponse.secure_url;
          } catch (cloudErr) {
            console.warn("Cloudinary upload failed, falling back to data URI:", cloudErr.message);
          }
        }
      }
    }

    if (mongoose.connection.readyState !== 1) {
      const post = memoryStore.createPost({
        caption: (caption || "").trim(),
        image: imageUrl,
        video: videoUrl,
        authorId,
        tags: parsedTags,
        location: (location || "").trim(),
        feeling: (feeling || "").trim(),
        postType: detectedType,
      });

      // Dispatch mention notifications
      if (caption) {
        handleMentions({
          text: caption,
          senderId: authorId,
          postId: post._id,
        });
      }

      return res.status(201).json({
        message: detectedType === "reel" ? "Reel published successfully" : "Post created successfully",
        post,
        success: true,
      });
    }

    const post = await Post.create({
      caption: (caption || "").trim(),
      image: imageUrl,
      video: videoUrl,
      author: authorId,
      tags: parsedTags,
      location: (location || "").trim(),
      feeling: (feeling || "").trim(),
      postType: detectedType,
      reposts: [],
      sharesCount: 0,
      isEdited: false,
    });

    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    // Dispatch mention notifications
    if (caption) {
      handleMentions({
        text: caption,
        senderId: authorId,
        postId: post._id,
      });
    }

    await post.populate({ path: "author", select: "-password" });
    return res.status(201).json({
      message: detectedType === "reel" ? "Reel published successfully" : "Post created successfully",
      post,
      success: true,
    });
  } catch (error) {
    console.error("addPost error ", error);
    return res.status(500).json({ message: "Failed to add post", success: false });
  }
};

export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user ? req.user._id : req.id;
    const { caption, location, feeling } = req.body;
    let { tags } = req.body;

    let parsedTags = undefined;
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else if (typeof tags === "string") {
        try {
          const parsed = JSON.parse(tags);
          parsedTags = Array.isArray(parsed) ? parsed : [tags];
        } catch {
          parsedTags = tags
            .split(",")
            .map((t) => t.trim().replace(/^#/, ""))
            .filter(Boolean);
        }
      }
    }

    if (mongoose.connection.readyState !== 1) {
      const result = memoryStore.updatePost(postId, userId, {
        caption,
        location,
        feeling,
        tags: parsedTags,
      });
      return res.status(result.status || 200).json(result);
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You are not authorized to edit this post",
        success: false,
      });
    }

    if (caption !== undefined) post.caption = caption.trim();
    if (location !== undefined) post.location = location.trim();
    if (feeling !== undefined) post.feeling = feeling.trim();
    if (parsedTags !== undefined) post.tags = parsedTags;
    post.isEdited = true;
    post.editedAt = new Date();

    await post.save();
    await post.populate({ path: "author", select: "username fullName profilePicture isBlueTag role accountStatus" });

    return res.status(200).json({
      message: "Post updated successfully",
      post,
      success: true,
    });
  } catch (error) {
    console.error("updatePost error:", error);
    return res.status(500).json({ message: "Failed to update post", success: false });
  }
};

export const sharePost = async (req, res) => {
  try {
    const postId = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      const post = memoryStore.sharePost(postId);
      if (!post) return res.status(404).json({ message: "Post not found", success: false });
      return res.status(200).json({
        message: "Post shared successfully",
        sharesCount: post.sharesCount,
        success: true,
      });
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { sharesCount: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found", success: false });

    return res.status(200).json({
      message: "Post shared successfully",
      sharesCount: post.sharesCount,
      success: true,
    });
  } catch (error) {
    console.error("sharePost error:", error);
    return res.status(500).json({ message: "Failed to share post", success: false });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const posts = memoryStore.getAllPosts();
      return res.status(200).json({
        message: "Posts fetched successfully",
        success: true,
        posts,
      });
    }

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username fullName profilePicture isBlueTag role accountStatus" })
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: { path: "author", select: "username fullName profilePicture isBlueTag role accountStatus" },
      });

    return res.status(200).json({
      message: "Posts fetched successfully",
      success: true,
      posts,
    });
  } catch (error) {
    console.log("getAllPosts error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getReels = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const reels = memoryStore.getReels();
      return res.status(200).json({
        message: "Reels fetched successfully",
        success: true,
        reels,
      });
    }

    const reels = await Post.find({
      $or: [{ postType: "reel" }, { video: { $exists: true, $ne: "" } }],
    })
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username fullName profilePicture isBlueTag role accountStatus" })
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: { path: "author", select: "username fullName profilePicture isBlueTag role accountStatus" },
      });

    return res.status(200).json({
      message: "Reels fetched successfully",
      success: true,
      reels: reels || [],
    });
  } catch (error) {
    console.error("getReels error:", error);
    return res.status(500).json({
      message: "Failed to fetch reels",
      success: false,
    });
  }
};

export const repostPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.id;

    if (mongoose.connection.readyState !== 1) {
      const result = memoryStore.repostPost(postId, userId);
      if (!result) return res.status(404).json({ message: "Post not found", success: false });

      const user = memoryStore.getUserById(userId);
      const postOwnerId =
        typeof result.post.author === "string"
          ? result.post.author
          : result.post.author?._id;
      if (postOwnerId && postOwnerId !== userId && result.isReposted) {
        const notification = {
          type: "repost",
          userId,
          userDetails: user,
          postId,
          message: "reposted your video / post",
        };
        const postOwnerSocketId = getReceiverSocketId(postOwnerId);
        if (postOwnerSocketId) io.to(postOwnerSocketId).emit("notification", notification);
      }

      return res.status(200).json({
        message: result.isReposted ? "Reposted to your feed" : "Removed repost",
        success: true,
        isReposted: result.isReposted,
        repostsCount: result.repostsCount,
        post: result.post,
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    const isReposted = post.reposts && post.reposts.includes(userId);
    if (isReposted) {
      await Post.findByIdAndUpdate(postId, { $pull: { reposts: userId } });
    } else {
      await Post.findByIdAndUpdate(postId, { $addToSet: { reposts: userId } });
    }

    const updatedPost = await Post.findById(postId)
      .populate({ path: "author", select: "username fullName profilePicture isBlueTag role accountStatus" })
      .populate({
        path: "comments",
        populate: { path: "author", select: "username fullName profilePicture isBlueTag role accountStatus" },
      });

    const user = await User.findById(userId).select("username fullName profilePicture isBlueTag");
    const postOwnerId = post.author.toString();
    if (postOwnerId !== userId && !isReposted) {
      const notification = {
        type: "repost",
        userId,
        userDetails: user,
        postId,
        message: "reposted your video / post",
      };
      const postOwnerSocketId = getReceiverSocketId(postOwnerId);
      if (postOwnerSocketId) io.to(postOwnerSocketId).emit("notification", notification);
    }

    return res.status(200).json({
      message: !isReposted ? "Reposted to your feed" : "Removed repost",
      success: true,
      isReposted: !isReposted,
      repostsCount: updatedPost.reposts?.length || 0,
      post: updatedPost,
    });
  } catch (error) {
    console.error("repostPost error:", error);
    return res.status(500).json({ message: "Failed to repost", success: false });
  }
};

export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;

    if (mongoose.connection.readyState !== 1) {
      const posts = memoryStore.getUserPosts(authorId);
      return res.status(200).json({
        message: "User posts fetched successfully",
        success: true,
        posts,
      });
    }

    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username fullName profilePicture isBlueTag role accountStatus",
      })
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "author",
          select: "username fullName profilePicture isBlueTag role accountStatus",
        },
      });

    return res.status(200).json({
      message: "User posts fetched successfully",
      success: true,
      posts: posts || [],
    });
  } catch (error) {
    console.log("getUserPost error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const likePost = async (req, res) => {
  try {
    const likePostId = req.params.id;
    const userId = req.id;

    if (mongoose.connection.readyState !== 1) {
      const post = memoryStore.likePost(likePostId, userId);
      if (!post) {
        return res.status(404).json({ message: "Post not found", success: false });
      }
      const user = memoryStore.getUserById(userId);
      const postOwnerId = typeof post.author === "string" ? post.author : post.author?._id;
      if (postOwnerId && postOwnerId !== userId) {
        createAndEmitNotification({
          recipientId: postOwnerId,
          senderId: userId,
          type: "like",
          postId: likePostId,
          content: "liked your post",
        });
      }
      return res.status(200).json({ message: "Post liked successfully", success: true });
    }

    const post = await Post.findById(likePostId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    await post.updateOne({
      $addToSet: { likes: userId },
    });
    await post.save();

    const postOwnerId = post.author.toString();
    if (postOwnerId !== userId) {
      createAndEmitNotification({
        recipientId: postOwnerId,
        senderId: userId,
        type: "like",
        postId: likePostId,
        content: "liked your post",
      });
    }

    return res.status(200).json({
      message: "Post liked successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in likePost:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const disLikePost = async (req, res) => {
  try {
    const likePostId = req.params.id;
    const userId = req.id;

    if (mongoose.connection.readyState !== 1) {
      const post = memoryStore.dislikePost(likePostId, userId);
      if (!post) {
        return res.status(404).json({ message: "Post not found", success: false });
      }
      return res.status(200).json({ message: "Post disliked successfully", success: true });
    }

    const post = await Post.findById(likePostId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    await post.updateOne({
      $pull: { likes: userId },
    });
    await post.save();

    return res.status(200).json({
      message: "Post disliked successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in disLikePost:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const commentPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        message: "Comment text is required",
        success: false,
      });
    }

    if (mongoose.connection.readyState !== 1) {
      const comment = memoryStore.addComment(postId, userId, text);
      if (!comment) {
        return res.status(404).json({ message: "Post not found", success: false });
      }

      // Notify post owner
      const post = memoryStore.posts.get(postId);
      const postOwnerId = post ? (typeof post.author === "string" ? post.author : post.author?._id) : null;
      if (postOwnerId && postOwnerId !== userId) {
        createAndEmitNotification({
          recipientId: postOwnerId,
          senderId: userId,
          type: "comment",
          postId,
          commentId: comment._id,
          content: text.slice(0, 100),
        });
      }

      // Dispatch mention notifications inside comment text
      handleMentions({
        text,
        senderId: userId,
        postId,
        commentId: comment._id,
      });

      return res.status(201).json({
        message: "Comment added successfully",
        comment,
        success: true,
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    const comment = await Comment.create({
      text,
      author: userId,
      post: postId,
    });

    await comment.populate({
      path: "author",
      select: "username fullName profilePicture isBlueTag role accountStatus",
    });

    post.comments.push(comment._id);
    await post.save();

    // Notify post owner
    const postOwnerId = post.author?.toString();
    if (postOwnerId && postOwnerId !== userId) {
      createAndEmitNotification({
        recipientId: postOwnerId,
        senderId: userId,
        type: "comment",
        postId,
        commentId: comment._id,
        content: text.slice(0, 100),
      });
    }

    // Dispatch mention notifications inside comment text
    handleMentions({
      text,
      senderId: userId,
      postId,
      commentId: comment._id,
    });

    return res.status(201).json({
      message: "Comment added successfully",
      comment,
      success: true,
    });
  } catch (error) {
    console.log("comment Post error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      const comments = memoryStore.getCommentsOfPost(postId);
      return res.status(200).json({
        message: "Comments fetched successfully",
        success: true,
        comments,
      });
    }

    const comments = await Comment.find({ post: postId })
      .populate("author", "username fullName profilePicture isBlueTag role accountStatus");

    return res.status(200).json({
      message: "Comments fetched successfully",
      success: true,
      comments: comments || [],
    });
  } catch (error) {
    console.log("Post Comment err", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.id;

    if (mongoose.connection.readyState !== 1) {
      const result = memoryStore.deletePost(postId, userId);
      return res.status(result.status || 200).json(result);
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    if (post.author.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to delete this post",
        success: false,
      });
    }

    await Post.findByIdAndDelete(postId);

    let user = await User.findById(userId);
    if (user) {
      user.posts = user.posts.filter((id) => id.toString() !== postId);
      await user.save();
    }

    await Comment.deleteMany({ post: postId });

    return res.status(200).json({
      message: "Post deleted successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.id;

    if (mongoose.connection.readyState !== 1) {
      const result = memoryStore.bookmarkPost(postId, userId);
      if (!result) return res.status(404).json({ message: "User or post not found", success: false });
      return res.status(200).json({ ...result, success: true });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    if (user.bookmarks.includes(post._id)) {
      await user.updateOne({
        $pull: { bookmarks: post._id },
      });
      await user.save();
      return res.status(200).json({
        type: "unsaved",
        message: "Post removed from bookmarks",
        success: true,
      });
    } else {
      await user.updateOne({
        $addToSet: { bookmarks: post._id },
      });
      await user.save();
      return res.status(200).json({
        type: "saved",
        message: "Post bookmarked successfully",
        success: true,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
