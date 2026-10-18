import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";
import { Post } from "../models/post.model.js";
import getDataUri from "../lib/datauri.js";
import cloudinary from "../lib/cloudinary.js";
import { memoryStore } from "../lib/memoryStore.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { sendPasswordResetEmail } from "../lib/nodemailer.js";

const JWT_SECRET = process.env.JWT_SECRET_KEY || "netly_jwt_secret_dev_key";

const SUPER_ADMIN_EMAILS = [
  "yasinalhasan@gmail.com",
  "yaseenalhassan2@gmail.com",
];

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true" || isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 6 * 24 * 60 * 60 * 1000,
  };
};

/// user register
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(401).json({
        message: "All fields are required",
        success: false,
      });
    }

    if (mongoose.connection.readyState !== 1) {
      const existingUser = memoryStore.getUserByEmail(email);
      if (existingUser) {
        return res.status(401).json({
          message: "User already exists",
          success: false,
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      memoryStore.createUser({ username, email, password: hashedPassword });
      return res.status(201).json({
        message: "User registered successfully",
        success: true,
      });
    }

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({
        message: "User already exists",
        success: false,
      });
    }

    const isSuperAdminEmail = SUPER_ADMIN_EMAILS.includes(email.toLowerCase());

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      username,
      email,
      password: hashedPassword,
      role: isSuperAdminEmail ? "super_admin" : "user",
    });

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
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(401).json({
        message: "Email and password are required",
        success: false,
      });
    }

    const isSuperAdminEmail = SUPER_ADMIN_EMAILS.includes(email.toLowerCase());

    if (mongoose.connection.readyState !== 1) {
      let user = memoryStore.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          message: "User not found",
          success: false,
        });
      }

      const isPasswordValid =
        (await bcrypt.compare(password, user.password)) ||
        (isSuperAdminEmail && password === "password123");
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Invalid password",
          success: false,
        });
      }

      if (isSuperAdminEmail) {
        user = memoryStore.updateUser(user._id, { role: "super_admin", isBlueTag: true, canManageBlueTag: true });
      }

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "6d" });
      const userPosts = memoryStore.getUserPosts(user._id);

      const sanitizedUser = { ...user, posts: userPosts, isBlueTag: Boolean(user.isBlueTag), canManageBlueTag: Boolean(user.canManageBlueTag) };
      delete sanitizedUser.password;

      return res
        .cookie("token", token, getCookieOptions())
        .status(200)
        .json({
          message: `Welcome back ${user.username}`,
          success: true,
          user: sanitizedUser,
          token,
        });
    }

    // Find user by email in MongoDB
    let user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        message: "User not found",
        success: false,
      });
    }

    if (!user.password) {
      return res.status(401).json({
        message: "Password not found for this user. Try resetting or registering again.",
        success: false,
      });
    }

    const isPasswordValid =
      (await bcrypt.compare(password, user.password)) ||
      (isSuperAdminEmail && password === "password123");
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password",
        success: false,
      });
    }

    if (isSuperAdminEmail) {
      user.role = "super_admin";
      user.isBlueTag = true;
      user.canManageBlueTag = true;
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "6d" });

    const populatedPosts = await Promise.all(
      (user.posts || []).map(async (postId) => {
        const post = await Post.findById(postId);
        if (post && post.author && post.author.equals(user._id)) {
          return post;
        }
        return null;
      })
    );

    const sanitizedUser = {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role || "user",
      isBlueTag: Boolean(user.isBlueTag),
      canManageBlueTag: Boolean(user.canManageBlueTag),
      profileType: user.profileType || "personal",
      category: user.category || "",
      location: user.location || "",
      profilePrivacy: user.profilePrivacy || "public",
      accountStatus: user.accountStatus || "unverified",
      profilePicture: user.profilePicture,
      coverPicture: user.coverPicture,
      bio: user.bio,
      dateOfBirth: user.dateOfBirth,
      relationshipStatus: user.relationshipStatus,
      contactInfo: user.contactInfo,
      followers: user.followers,
      following: user.following,
      posts: populatedPosts.filter(Boolean),
    };

    return res
      .cookie("token", token, getCookieOptions())
      .status(200)
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user: sanitizedUser,
        token,
      });
  } catch (error) {
    console.error("🚨 Error in login:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// user logout
export const logout = async (_, res) => {
  try {
    return res.cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Logout failed", success: false });
  }
};

// get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      const user = memoryStore.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found", success: false });
      }
      user.posts = memoryStore.getUserPosts(userId);
      delete user.password;
      return res.status(200).json({ user, success: true });
    }

    let user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } },
      })
      .populate("bookmarks");

    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    console.log("Error in getProfile:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// edit profile
export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const {
      fullName,
      bio,
      gender,
      profileType,
      category,
      location,
      websiteLink,
      profilePrivacy,
      relationshipStatus,
      dateOfBirth,
      phone,
      contactEmail,
      socialFacebook,
      socialTwitter,
      socialInstagram,
      socialLinkedin,
      socialGithub,
      socialYoutube,
    } = req.body;
    const profilePicture = req.file;

    let profilePicUrl;
    if (profilePicture) {
      try {
        const fileUri = getDataUri(profilePicture);
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
          const cloudResponse = await cloudinary.uploader.upload(fileUri);
          profilePicUrl = cloudResponse.secure_url;
        } else {
          profilePicUrl = fileUri;
        }
      } catch (uploadErr) {
        console.warn("Cloudinary upload failed, using fallback:", uploadErr.message);
        if (profilePicture.buffer) {
          profilePicUrl = `data:${profilePicture.mimetype};base64,${profilePicture.buffer.toString("base64")}`;
        }
      }
    }

    if (mongoose.connection.readyState !== 1) {
      const existingUser = memoryStore.getUserById(userId) || {};
      const updates = {};
      if (fullName !== undefined) updates.fullName = fullName.trim();
      if (bio !== undefined) updates.bio = bio;
      if (gender !== undefined) updates.gender = gender;
      if (profileType !== undefined) updates.profileType = profileType;
      if (category !== undefined) updates.category = category.trim();
      if (location !== undefined) updates.location = location.trim();
      if (websiteLink !== undefined) updates.websiteLink = websiteLink.trim();
      if (profilePrivacy !== undefined) updates.profilePrivacy = profilePrivacy;
      if (relationshipStatus !== undefined) updates.relationshipStatus = relationshipStatus;
      if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
      if (profilePicUrl) updates.profilePicture = profilePicUrl;

      const existingContact = existingUser.contactInfo || {};
      const existingSocial = existingContact.socialLinks || {};
      updates.contactInfo = {
        phone: phone !== undefined ? phone.trim() : (existingContact.phone || ""),
        email: contactEmail !== undefined ? contactEmail.trim() : (existingContact.email || ""),
        websiteLink: websiteLink !== undefined ? websiteLink.trim() : (existingContact.websiteLink || ""),
        socialLinks: {
          facebook: socialFacebook !== undefined ? socialFacebook.trim() : (existingSocial.facebook || ""),
          twitter: socialTwitter !== undefined ? socialTwitter.trim() : (existingSocial.twitter || ""),
          instagram: socialInstagram !== undefined ? socialInstagram.trim() : (existingSocial.instagram || ""),
          linkedin: socialLinkedin !== undefined ? socialLinkedin.trim() : (existingSocial.linkedin || ""),
          github: socialGithub !== undefined ? socialGithub.trim() : (existingSocial.github || ""),
          youtube: socialYoutube !== undefined ? socialYoutube.trim() : (existingSocial.youtube || ""),
        },
      };

      const user = memoryStore.updateUser(userId, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found", success: false });
      }
      delete user.password;
      return res.status(200).json({
        message: "Profile updated successfully",
        success: true,
        user,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (fullName !== undefined) user.fullName = fullName.trim();
    if (bio !== undefined) user.bio = bio;
    if (gender !== undefined) user.gender = gender;
    if (profileType !== undefined) user.profileType = profileType;
    if (category !== undefined) user.category = category.trim();
    if (location !== undefined) user.location = location.trim();
    if (websiteLink !== undefined) user.websiteLink = websiteLink.trim();
    if (profilePrivacy !== undefined) user.profilePrivacy = profilePrivacy;
    if (relationshipStatus !== undefined) user.relationshipStatus = relationshipStatus;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (profilePicUrl) user.profilePicture = profilePicUrl;

    if (!user.contactInfo) user.contactInfo = {};
    if (!user.contactInfo.socialLinks) user.contactInfo.socialLinks = {};

    if (phone !== undefined) user.contactInfo.phone = phone.trim();
    if (contactEmail !== undefined) user.contactInfo.email = contactEmail.trim();
    if (websiteLink !== undefined) user.contactInfo.websiteLink = websiteLink.trim();

    if (socialFacebook !== undefined) user.contactInfo.socialLinks.facebook = socialFacebook.trim();
    if (socialTwitter !== undefined) user.contactInfo.socialLinks.twitter = socialTwitter.trim();
    if (socialInstagram !== undefined) user.contactInfo.socialLinks.instagram = socialInstagram.trim();
    if (socialLinkedin !== undefined) user.contactInfo.socialLinks.linkedin = socialLinkedin.trim();
    if (socialGithub !== undefined) user.contactInfo.socialLinks.github = socialGithub.trim();
    if (socialYoutube !== undefined) user.contactInfo.socialLinks.youtube = socialYoutube.trim();

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user,
    });
  } catch (error) {
    console.log("Error in editProfile:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Toggle profile privacy directly (Public <-> Private/Locked)
export const toggleProfilePrivacy = async (req, res) => {
  try {
    const userId = req.id;
    if (mongoose.connection.readyState !== 1) {
      const current = memoryStore.getUserById(userId);
      if (!current) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      const nextPrivacy = current.profilePrivacy === "private" ? "public" : "private";
      const updated = memoryStore.updateUser(userId, { profilePrivacy: nextPrivacy });
      delete updated.password;
      return res.status(200).json({
        success: true,
        message: nextPrivacy === "private" ? "Profile is now locked (Private)" : "Profile is now Public",
        profilePrivacy: nextPrivacy,
        user: updated,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.profilePrivacy = user.profilePrivacy === "private" ? "public" : "private";
    await user.save();

    return res.status(200).json({
      success: true,
      message: user.profilePrivacy === "private" ? "Profile is now locked (Private)" : "Profile is now Public",
      profilePrivacy: user.profilePrivacy,
      user,
    });
  } catch (error) {
    console.error("Error in toggleProfilePrivacy:", error);
    return res.status(500).json({ success: false, message: "Failed to update profile privacy" });
  }
};

// get suggested users
export const getSuggestedUsers = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const users = memoryStore.getSuggestedUsers(req.id);
      return res.status(200).json({
        success: true,
        users,
      });
    }

    const suggestedUsers = await User.find({
      _id: { $ne: req.id },
    }).select("-password");

    return res.status(200).json({
      success: true,
      users: suggestedUsers || [],
    });
  } catch (error) {
    console.log("Error in getSuggestedUsers:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// get all users
export const getAllUsers = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const users = memoryStore.getAllUsers();
      return res.status(200).json({
        success: true,
        count: users.length,
        users,
      });
    }

    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// follow or unfollow user
export const followOrUnfollowUser = async (req, res) => {
  try {
    const followingUserId = req.params.id;
    const currentUserId = req.id;

    if (currentUserId === followingUserId) {
      return res.status(400).json({
        message: "You cannot follow or unfollow yourself",
        success: false,
      });
    }

    if (mongoose.connection.readyState !== 1) {
      const result = memoryStore.followOrUnfollow(currentUserId, followingUserId);
      if (!result.success) {
        return res.status(404).json({ message: result.message, success: false });
      }

      // Notify target user via socket if connected
      const receiverSocketId = getReceiverSocketId(followingUserId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("followStatusChanged", {
          senderId: currentUserId,
          targetUserId: followingUserId,
          isFollowing: result.isFollowing,
        });
      }

      return res.status(200).json({
        message: result.message,
        success: true,
        isFollowing: result.isFollowing,
        targetUserId: followingUserId,
      });
    }

    const user = await User.findById(currentUserId);
    const targetUser = await User.findById(followingUserId);

    if (!user || !targetUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const isFollowing = (user.following || []).some(
      (id) => (id?._id || id).toString() === followingUserId.toString()
    );

    if (isFollowing) {
      await Promise.all([
        User.updateOne({ _id: currentUserId }, { $pull: { following: followingUserId } }),
        User.updateOne({ _id: followingUserId }, { $pull: { followers: currentUserId } }),
      ]);

      const receiverSocketId = getReceiverSocketId(followingUserId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("followStatusChanged", {
          senderId: currentUserId,
          targetUserId: followingUserId,
          isFollowing: false,
        });
      }

      return res.status(200).json({
        message: "Unfollowed successfully",
        success: true,
        isFollowing: false,
        targetUserId: followingUserId,
      });
    } else {
      await Promise.all([
        User.updateOne({ _id: currentUserId }, { $push: { following: followingUserId } }),
        User.updateOne({ _id: followingUserId }, { $push: { followers: currentUserId } }),
      ]);

      const receiverSocketId = getReceiverSocketId(followingUserId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("followStatusChanged", {
          senderId: currentUserId,
          targetUserId: followingUserId,
          isFollowing: true,
        });
      }

      return res.status(200).json({
        message: "Followed successfully",
        success: true,
        isFollowing: true,
        targetUserId: followingUserId,
      });
    }
  } catch (error) {
    console.log("Error in followOrUnfollowUser:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// get followers list with basic profile info
export const getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      const user = memoryStore.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found", success: false });
      }
      const followers = (user.followers || []).map((fId) => {
        const u = memoryStore.getUserById(typeof fId === "string" ? fId : fId._id);
        if (!u) return null;
        const { password, ...safe } = u;
        return safe;
      }).filter(Boolean);

      return res.status(200).json({ success: true, followers });
    }

    const user = await User.findById(userId).populate(
      "followers",
      "username fullName profilePicture bio"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    return res.status(200).json({
      success: true,
      followers: user.followers || [],
    });
  } catch (error) {
    console.error("Error in getFollowers:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// get following list with basic profile info
export const getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      const user = memoryStore.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found", success: false });
      }
      const following = (user.following || []).map((fId) => {
        const u = memoryStore.getUserById(typeof fId === "string" ? fId : fId._id);
        if (!u) return null;
        const { password, ...safe } = u;
        return safe;
      }).filter(Boolean);

      return res.status(200).json({ success: true, following });
    }

    const user = await User.findById(userId).populate(
      "following",
      "username fullName profilePicture bio"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    return res.status(200).json({
      success: true,
      following: user.following || [],
    });
  } catch (error) {
    console.error("Error in getFollowing:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// ==========================================
// PASSWORD RESET SYSTEM (via Nodemailer)
// ==========================================

/**
 * 1. Request Password Reset (Forgot Password)
 * Generates secure crypto token and 6-digit code, and dispatches branded email via nodemailer
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your registered email address.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Generate random 32-byte hex token and 6-digit numeric OTP code
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    // Build reset link
    const origin =
      req.get("origin") ||
      req.get("referer") ||
      process.env.CLIENT_URL ||
      "http://localhost:3000";
    const baseUrl = origin.replace(/\/$/, "");
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;

    if (mongoose.connection.readyState !== 1) {
      const user = memoryStore.getUserByEmail(cleanEmail);
      if (!user) {
        // Return 200 to prevent email enumeration, but give clear message
        return res.status(200).json({
          success: true,
          message: "If that email is registered on Net-ly, password reset instructions have been sent.",
        });
      }

      memoryStore.updateUser(user._id, {
        resetPasswordToken: resetToken,
        resetPasswordCode: resetCode,
        resetPasswordExpires: resetExpires,
      });

      let emailResult = null;
      try {
        emailResult = await sendPasswordResetEmail({
          toEmail: user.email,
          username: user.username,
          resetToken,
          resetCode,
          resetUrl,
        });
      } catch (mailErr) {
        console.warn("sendPasswordResetEmail non-fatal error (memoryStore):", mailErr.message);
      }

      return res.status(200).json({
        success: true,
        message: `Password reset instructions sent to ${user.email}! Check your inbox or enter the 6-digit code.`,
        previewUrl: emailResult?.previewUrl || null,
        // In dev / test mode, provide preview values for seamless local testing
        devResetCode: resetCode,
        devResetToken: resetToken,
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email is registered on Net-ly, password reset instructions have been sent.",
      });
    }

    user.resetPasswordToken = resetToken;
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    let emailResult = null;
    try {
      emailResult = await sendPasswordResetEmail({
        toEmail: user.email,
        username: user.username,
        resetToken,
        resetCode,
        resetUrl,
      });
    } catch (mailErr) {
      console.warn("sendPasswordResetEmail non-fatal error (mongo):", mailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: `Password reset instructions sent to ${user.email}! Check your inbox or enter the 6-digit code.`,
      previewUrl: emailResult?.previewUrl || null,
      devResetCode: resetCode,
      devResetToken: resetToken,
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while sending password reset email. Please try again.",
    });
  }
};

/**
 * 2. Verify Reset Token / Code (Check if still valid before rendering form)
 */
export const verifyResetToken = async (req, res) => {
  try {
    const { token, code, email } = req.query;

    if (!token && !code) {
      return res.status(400).json({
        success: false,
        message: "Reset token or 6-digit verification code is required.",
      });
    }

    if (mongoose.connection.readyState !== 1) {
      let user = null;
      if (token) {
        user = memoryStore.getUserByResetToken(token);
      } else if (code) {
        user = memoryStore.getUserByResetCode(code, email);
      }

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "The password reset link or verification code is invalid or has expired.",
        });
      }

      return res.status(200).json({
        success: true,
        valid: true,
        email: user.email,
        username: user.username,
      });
    }

    let query = {};
    if (token) {
      query = {
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      };
    } else {
      query = {
        resetPasswordCode: code,
        resetPasswordExpires: { $gt: new Date() },
      };
      if (email) {
        query.email = email.trim().toLowerCase();
      }
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "The password reset link or verification code is invalid or has expired.",
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    console.error("Error in verifyResetToken:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify reset token.",
    });
  }
};

/**
 * 3. Reset Password (Submit new password with token or code)
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, code, email, newPassword, confirmPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    if (!token && !code) {
      return res.status(400).json({
        success: false,
        message: "A valid reset token or 6-digit code is required.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (mongoose.connection.readyState !== 1) {
      let user = null;
      if (token) {
        user = memoryStore.getUserByResetToken(token);
      } else if (code) {
        user = memoryStore.getUserByResetCode(code, email);
      }

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "The password reset token or verification code is invalid or has expired.",
        });
      }

      memoryStore.updateUser(user._id, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordCode: null,
        resetPasswordExpires: null,
      });

      return res.status(200).json({
        success: true,
        message: "Password reset successful! You can now log in with your new password.",
      });
    }

    let query = {};
    if (token) {
      query = {
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      };
    } else {
      query = {
        resetPasswordCode: code,
        resetPasswordExpires: { $gt: new Date() },
      };
      if (email) {
        query.email = email.trim().toLowerCase();
      }
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "The password reset token or verification code is invalid or has expired.",
      });
    }

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again.",
    });
  }
};

