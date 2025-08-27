import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import getDataUri from "../utils/datauri.js";
// import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import getDataUri from "../lib/datauri.js";
import cloudinary from "../lib/cloudinary.js";

/// user register
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(username, email, password);

    // Validate input
    if (!username || !email || !password) {
      return res.status(401).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({
        message: "User already exists",
        success: false,
      });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10); // In a real application, you should hash the password before saving
    console.log("Hashed Password:", hashedPassword);
    await User.create({
      username,
      email,
      password: hashedPassword, // In a real application, make sure to hash the password before saving
    });

    // await newUser.save(); // Save the new user to the database

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// user login
// This function handles user login by validating credentials, checking the database, and generating a JWT token

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Debug: Print incoming data
    console.log("🧪 Incoming login data:", { email, password });

    // Validate input
    if (!email || !password) {
      return res.status(401).json({
        message: "Email and password are required",
        success: false,
      });
    }

    // Find user by email
    let user = await User.findOne({ email }).select("+password");

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        message: "User not found",
        success: false,
      });
    }

    // Debug: Show found user data
    console.log("🧪 User found:", user);
    console.log("🧪 User password hash:", user.password);

    // Check if password field is present
    if (!user.password) {
      return res.status(401).json({
        message:
          "Password not found for this user. Try resetting or registering again.",
        success: false,
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password",
        success: false,
      });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "6d",
    });

    console.log("🧪 JWT Token generated:", token);

    // populate each post if in the posts array
    const populatedPosts = await Promise.all(
      // Map through the user's posts and fetch each post by ID
      user.posts.map(async (postId) => {
        // Find the post by ID
        const post = await Post.findById(postId);
        // If the post author matches the user, return the post
        if (post.author.equals(user._id)) {
          // Populate the post with author details
          return post;
        }
        return null; // Return null if the post author does not match the user
      })
    );

    // Prepare user data without password
    const sanitizedUser = {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture,
      coverPicture: user.coverPicture,
      bio: user.bio,
      dateOfBirth: user.dateOfBirth,
      relationshipStatus: user.relationshipStatus,
      contactInfo: user.contactInfo,
      followers: user.followers,
      following: user.following,
      posts: populatedPosts,
    };

    // Send response with cookie
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 6 * 24 * 60 * 60 * 1000, // 6 days
      })
      .status(200)
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user: sanitizedUser,
      });
  } catch (error) {
    console.error("🚨 Error in login:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//  user logout

export const logout = async (_, res) => {
  try {
    return res.cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully..",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// get user profile

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    // console.log(userId);
    let user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "posts",
        createdAt: -1,
      })
      .populate("bookmarks");
    return res.status(200).json({
      user,
      success: true,
    });
    // console.log(user);
  } catch (error) {
    console.log(error);
  }
};

//

export const editProfile = async (req, res) => {
  try {
    //
    // Extract user ID from request object (assuming middleware sets req.id)
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    // const coverPicture = req.file;
    // Validate input
    let cloudResponse;

    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    // if (coverPicture) {
    //   const fileUri = getDataUri(coverPicture);
    //   coverUpload = await cloudinary.uploader.upload(fileUri);
    // }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Update user profile
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;
    // if (coverUpload) user.coverPicture = coverUpload.secure_url;
    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user,
      // user: {
      //   _id: user._id,
      //   username: user.username,
      //   email: user.email,
      //   profilePicture: user.profilePicture,
      //   coverPicture: user.coverPicture,
      //   bio: user.bio,
      //   gender: user.gender,
      // },
    });
  } catch (error) {
    console.log(error);
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedUsers = await User.find({
      _id: { $ne: req.id }, // Exclude the current user
    }).select("-password"); // Exclude password from the response
    // .limit(10); // Limit to 10 suggested users
    // console.log(suggestedUsers);
    if (!suggestedUsers) {
      return res.status(400).json({
        message: "Currently do not have users to suggest",
        // success: false,
      });
    }
    // Uncomment the following lines if you want to return a message when no suggested users are found
    // if (!getSuggestedUsers) {
    //   return res.status(200).json({
    //     message: "Suggested users fetched successfully",
    //   });
    // }

    return res.status(200).json({
      success: true,
      users: suggestedUsers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const followOrUnfollowUser = async (req, res) => {
  try {
    const followingUserId = req.params.id; // User to follow/unfollow
    const currentUserId = req.id; // Current user ID from the request

    // find the user to follow/unfollow
    if (currentUserId === followingUserId) {
      return res.status(400).json({
        message: "You cannot follow or unfollow yourself",
        success: false,
      });
    }

    // Find the user to follow/unfollow
    const user = await User.findById(currentUserId);
    const targetUser = await User.findById(followingUserId);

    if (!user || !targetUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Check if the user is already following the target user
    const isFollowing = user.following.includes(followingUserId);
    if (isFollowing) {
      // Unfollow the user
      await Promise.all([
        User.updateOne(
          { _id: currentUserId },
          { $pull: { following: followingUserId } }
        ),
        User.updateOne(
          { _id: followingUserId },
          { $pull: { followers: currentUserId } }
        ),
      ]);
      return res.status(200).json({
        message: "Unfollowed successfully",
        success: true,
      });
    } else {
      // Follow the user
      await Promise.all([
        User.updateOne(
          { _id: currentUserId },
          { $push: { following: followingUserId } }
        ),
        User.updateOne(
          { _id: followingUserId },
          { $push: { followers: currentUserId } }
        ),
      ]);

      return res.status(200).json({
        message: "Followed successfully",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
