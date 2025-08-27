import sharp from "sharp"; // Import sharp for image processing
import cloudinary from "../lib/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.user._id; // Assuming the user ID is stored in req.id by authentication middleware

    // console.log("Author ID:", authorId); // Log the author ID for debugging
    // console.log("Caption:", caption); // Log the caption for debugging
    // console.log("Image:", image); // Log the image file for debugging

    // Validate input
    if (!image) {
      return res.status(400).json({
        message: "Image file is required",
      });
    }

    // image upload logic
    const optimizedImageBuffer = await sharp(
      image.buffer // Use the buffer from the uploaded file
    )
      .resize({
        width: 800, // Resize to a width of 800px
        height: 800, // Resize to a height of 600px
        fit: "inside", // Cover the area while maintaining aspect ratio
      })
      .toFormat("jpeg", { quality: 80 }) // Set JPEG quality to 80%
      .toBuffer(); // Convert the image to a buffer

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`; // Convert the buffer to a data URI format

    const cloudResponse = await cloudinary.uploader.upload(fileUri); // Upload the image to Cloudinary or any other cloud storage service
    const post = await Post.create({
      caption, // Assuming caption is an object with a 'caption' property
      image: cloudResponse.secure_url, // Use the secure URL from Cloudinary response
      author: authorId, // Use the author ID from the request
    }); // Create a new post with the provided caption, image URL, and author ID

    const user = await User.findById(authorId); // Find the user by ID
    if (user) {
      user.posts.push(post._id); // Add the post ID to the user's posts array
      await user.save(); // Save the updated user document
    } // Save the user document with the new post

    await post.populate({ path: "author", select: "-password" }); // Populate the author field with username and profile picture
    return res.status(201).json({
      message: "Post created successfully",
      post, // Return the created post
      success: true,
    });
  } catch (error) {
    console.log("addPost error ", error); // Log the error for debugging
  }
};
// console.log("Post controller loaded successfully", addNewPost);

export const getAllPosts = async (req, res) => {
  try {
    const post = await Post.find()
      .sort({ createdAt: -1 }) // Sort posts by creation date in descending order
      .populate({ path: "author", select: "username profilePicture" }) // Populate the author field with username and profile picture
      .populate({
        path: "comments",
        sort: { createdAt: -1 }, // Sort comments by creation date in descending order
        populate: { path: "author", select: "username profilePicture" },
      }); // Populate comments with author details

    return res.status(200).json({
      message: "Posts fetched successfully",
      success: true,
      posts: post, // Return the fetched posts
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id; // Assuming the user ID is stored in req.id by authentication middleware
    const posts = await Post.find({ author: authorId }) // Find posts by the author ID
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username profilePicture",
      }) // Populate the author field with username and profile picture
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username profilePicture",
        },
      }); // Populate comments with author details

    if (!posts || posts.length === 0) {
      return res.status(404).json({
        message: "No posts found for this user",
        success: false,
      });
    }
    return res.status(200).json({
      message: "User posts fetched successfully",
      success: true,
      posts, // Return the user's posts
    });
  } catch (error) {
    console.log(error);
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

    const user = await User.findById(userId).select("username profilePicture");
    const postOwnerId = post.author.toString();
    if (postOwnerId !== userId) {
      const notification = {
        type: "like",
        userId,
        userDetails: user,
        postId: likePostId, // ✅ FIXED
        message: "Your post was liked",
        // createdAt: new Date(), // Add a timestamp to the notification
      };
      const postOwnerSocketId = getReceiverSocketId(postOwnerId);
      io.to(postOwnerSocketId).emit("notification", notification);
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

    const user = await User.findById(userId).select("username profilePicture");
    const postOwnerId = post.author.toString();
    if (postOwnerId !== userId) {
      const notification = {
        type: "dislike",
        userId,
        userDetails: user,
        postId: likePostId, // ✅ FIXED
        message: "Your post was disliked",
      };
      const postOwnerSocketId = getReceiverSocketId(postOwnerId);
      io.to(postOwnerSocketId).emit("notification", notification);
    }

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
    const postId = req.params.id; // Get the post ID from the request parameters
    const userId = req.id; // Get the user ID from the request object (assuming
    const { text } = req.body; // Get the comment text from the request body
    const post = await Post.findById(postId); // Find the post by ID
    if (!text)
      return res.status(400).json({
        message: "Comment text is required",
        success: false,
      });

    const comment = await Comment.create({
      text: text, // Use the comment text from the request body
      author: userId, // Use the user ID from the request object
      post: postId, // Associate the comment with the post ID
    });

    await comment.populate({
      path: "author",
      select: "username profilePicture", // Populate the author field with username and profile picture
    });

    post.comments.push(comment._id); // Add the comment ID to the post's comments array
    await post.save(); // Save the updated post document

    return res.status(201).json({
      message: "Comment added successfully",
      comment, // Return the created comment
      success: true,
    });
  } catch (error) {
    console.log("comment Post", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id; // Get the post ID from the request parameters
    const comments = await Comment.find({ post: postId }) // Find comments associated with the post ID
      .populate("author", "username profilePicture"); // Populate the author field with username and profile picture

    if (!comments || comments.length === 0) {
      return res.status(404).json({
        message: "No comments found for this post",
        success: false,
      });
    } // Check if there are no comments

    return res.status(200).json({
      message: "Comments fetched successfully",
      success: true,
      comments, // Return the fetched comments
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
    const postId = req.params.id; // Get the post ID from the request parameters
    const userId = req.id; // Get the user ID from the request object (assuming

    const post = await Post.findById(postId); // Find the post by ID
    // console.log("Post to be deleted:", post); // Log the post for debugging
    // console.log("Post ID:", postId); // Log the post for debugging
    // console.log("User Id:", userId); // Log the post for debugging

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    } // Check if the post exists

    // Check if the user is the author of the post
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to delete this post",
        success: false,
      });
    } // Ensure that only the author can delete the post

    // Delete the post
    await Post.findByIdAndDelete(postId); // Delete the post from the database

    // Remove the post ID from the author's posts array
    let user = await User.findById(userId); // Find the user by ID
    user.posts = user.posts.filter((id) => id.toString() !== postId); // Filter out the deleted post ID
    await user.save(); // Save the updated user document

    // delete all comments associated with the post
    await Comment.deleteMany({ post: postId }); // Delete all comments associated with the post

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

// Function to bookmark a post
export const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id; // Get the post ID from the request parameters
    const userId = req.id; // Get the user ID from the request object (assuming
    const post = await Post.findById(postId); // Find the post by ID

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    } // Check if the post exists

    const user = await User.findById(userId); // Find the user by ID

    // Check if the post is already bookmarked
    if (user.bookmarks.includes(post._id)) {
      // If the post is already bookmarked, remove it from bookmarks
      await user.updateOne({
        $pull: { bookmarks: post._id }, // Remove the post ID from the bookmarks array
      });
      await user.save(); // Save the updated user document
      return res.status(200).json({
        type: "unsaved",
        message: "Post removed from bookmarks",
        success: true,
      });
    } else {
      await user.updateOne({
        $addToSet: { bookmarks: post._id }, // Add the post ID to the bookmarks array if not already present
      });
      await user.save(); // Save the updated user document
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
    console.log(error);
  }
};
