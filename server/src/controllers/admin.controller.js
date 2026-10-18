import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { Story } from "../models/story.model.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { memoryStore } from "../lib/memoryStore.js";

const PROTECTED_SUPER_ADMIN_EMAILS = [
  "yasinalhasan@gmail.com",
  "yaseenalhassan2@gmail.com",
];

// Helper to determine if target user is a protected Super Admin
const isProtectedUser = (user) => {
  if (!user) return false;
  const email = (user.email || "").toLowerCase();
  return user.role === "super_admin" || PROTECTED_SUPER_ADMIN_EMAILS.includes(email);
};

// 1. Get high-level platform statistics
export const getAdminStats = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const allUsers = Array.from(memoryStore.users.values());
      const allPosts = Array.from(memoryStore.posts.values());
      const allComments = Array.from(memoryStore.comments.values());
      const allStories = Array.from(memoryStore.stories.values());

      const verifiedCount = allUsers.filter((u) => u.accountStatus === "verified").length;
      const suspendedCount = allUsers.filter((u) => u.accountStatus === "suspended").length;
      const adminCount = allUsers.filter((u) => u.role === "admin").length;
      const superAdminCount = allUsers.filter((u) => isProtectedUser(u)).length;
      const blueTagCount = allUsers.filter((u) => Boolean(u.isBlueTag)).length;
      const adminsWithBlueTagAccessCount = allUsers.filter(
        (u) => (u.role === "admin" && Boolean(u.canManageBlueTag)) || isProtectedUser(u)
      ).length;

      const reelsCount = allPosts.filter((p) => p.postType === "reel" || (p.video && p.video.trim())).length;

      return res.status(200).json({
        success: true,
        stats: {
          totalUsers: allUsers.length,
          verifiedUsers: verifiedCount,
          suspendedUsers: suspendedCount,
          adminUsers: adminCount,
          superAdminUsers: superAdminCount,
          blueTagUsers: blueTagCount,
          adminsWithBlueTagAccess: adminsWithBlueTagAccessCount,
          totalPosts: allPosts.length,
          totalReels: reelsCount,
          totalComments: allComments.length,
          totalStories: allStories.length,
        },
      });
    }

    const [
      totalUsers,
      verifiedUsers,
      suspendedUsers,
      adminUsers,
      superAdminUsers,
      blueTagUsers,
      adminsWithBlueTagAccess,
      totalPosts,
      totalReels,
      totalComments,
      totalStories,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ accountStatus: "verified" }),
      User.countDocuments({ accountStatus: "suspended" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({
        $or: [{ role: "super_admin" }, { email: { $in: PROTECTED_SUPER_ADMIN_EMAILS } }],
      }),
      User.countDocuments({ isBlueTag: true }),
      User.countDocuments({
        $or: [
          { canManageBlueTag: true },
          { role: "super_admin" },
          { email: { $in: PROTECTED_SUPER_ADMIN_EMAILS } },
        ],
      }),
      Post.countDocuments({}),
      Post.countDocuments({
        $or: [{ postType: "reel" }, { video: { $exists: true, $ne: "" } }],
      }),
      Comment.countDocuments({}),
      Story.countDocuments({}),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        suspendedUsers,
        adminUsers,
        superAdminUsers,
        blueTagUsers,
        adminsWithBlueTagAccess,
        totalPosts,
        totalReels,
        totalComments,
        totalStories,
      },
    });
  } catch (error) {
    console.error("Error in getAdminStats:", error);
    return res.status(500).json({ success: false, message: "Failed to load platform stats" });
  }
};

// 2. Get all users with full detail & analytics
export const getAllUsersAdmin = async (req, res) => {
  try {
    const { q, role, status } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let users = Array.from(memoryStore.users.values()).map((u) => {
        const { password, ...safe } = u;
        const posts = memoryStore.getUserPosts(u._id) || [];
        const isSuper = isProtectedUser(u);
        return {
          ...safe,
          role: isSuper ? "super_admin" : (safe.role || "user"),
          isBlueTag: Boolean(u.isBlueTag),
          canManageBlueTag: isSuper ? true : Boolean(u.canManageBlueTag),
          postsCount: posts.length,
          followersCount: (safe.followers || []).length,
          followingCount: (safe.following || []).length,
        };
      });

      if (q) {
        const query = q.toLowerCase();
        users = users.filter(
          (u) =>
            u.username?.toLowerCase().includes(query) ||
            u.email?.toLowerCase().includes(query) ||
            u.fullName?.toLowerCase().includes(query)
        );
      }

      if (role && role !== "all") {
        users = users.filter((u) => u.role === role);
      }

      if (status && status !== "all") {
        users = users.filter((u) => u.accountStatus === status);
      }

      const isCallerSuper = req.userRole === "super_admin" || isProtectedUser(req.adminUser);
      const callerCanManageBlueTag = isCallerSuper || Boolean(req.canManageBlueTag) || Boolean(req.adminUser?.canManageBlueTag);

      return res.status(200).json({
        success: true,
        users,
        currentAdminRole: req.userRole || "admin",
        callerCanManageBlueTag,
        isSuperAdmin: isCallerSuper,
      });
    }

    let filter = {};
    if (q) {
      filter.$or = [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { fullName: { $regex: q, $options: "i" } },
      ];
    }
    if (role && role !== "all") {
      filter.role = role;
    }
    if (status && status !== "all") {
      filter.accountStatus = status;
    }

    const rawUsers = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .populate("posts", "_id");

    const users = rawUsers.map((u) => {
      const userObj = u.toObject();
      const isSuper = isProtectedUser(userObj);
      return {
        ...userObj,
        role: isSuper ? "super_admin" : userObj.role,
        isBlueTag: Boolean(userObj.isBlueTag),
        canManageBlueTag: isSuper ? true : Boolean(userObj.canManageBlueTag),
        postsCount: (userObj.posts || []).length,
        followersCount: (userObj.followers || []).length,
        followingCount: (userObj.following || []).length,
      };
    });

    const isCallerSuper = req.userRole === "super_admin" || isProtectedUser(req.adminUser);
    const callerCanManageBlueTag = isCallerSuper || Boolean(req.canManageBlueTag) || Boolean(req.adminUser?.canManageBlueTag);

    return res.status(200).json({
      success: true,
      users,
      currentAdminRole: req.userRole || "admin",
      callerCanManageBlueTag,
      isSuperAdmin: isCallerSuper,
    });
  } catch (error) {
    console.error("Error in getAllUsersAdmin:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// 3. Update user info by admin (90% control) or super admin (100% control)
export const updateUserByAdmin = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const isSuperAdminUser = req.userRole === "super_admin";
    const canManageBlueTag = isSuperAdminUser || Boolean(req.canManageBlueTag) || Boolean(req.adminUser?.canManageBlueTag);
    const {
      username,
      email,
      fullName,
      bio,
      accountStatus,
      profilePrivacy,
      profileType,
      category,
      gender,
      role, // Can only be changed by super admin
      isBlueTag, // Can be changed by super admin or authorized admin
      canManageBlueTag: grantBlueTagAccess, // Can ONLY be changed by super admin
    } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const targetUser = memoryStore.getUserById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: "Target user not found" });
      }

      // Check protection: normal admin cannot edit super admin
      if (isProtectedUser(targetUser) && !isSuperAdminUser) {
        return res.status(403).json({
          success: false,
          message: "Admins are not authorized to modify a Super Admin profile.",
        });
      }

      const updates = {};
      if (username) updates.username = username.trim();
      if (email) updates.email = email.trim().toLowerCase();
      if (fullName !== undefined) updates.fullName = fullName.trim();
      if (bio !== undefined) updates.bio = bio;
      if (accountStatus) updates.accountStatus = accountStatus;
      if (profilePrivacy) updates.profilePrivacy = profilePrivacy;
      if (profileType) updates.profileType = profileType;
      if (category !== undefined) updates.category = category.trim();
      if (gender !== undefined) updates.gender = gender;

      // Blue Tag modification: Super Admin or authorized Admin
      if (isBlueTag !== undefined && canManageBlueTag) {
        updates.isBlueTag = Boolean(isBlueTag);
        updates.blueTagGivenBy = req.id;
        updates.blueTagGivenAt = isBlueTag ? new Date() : null;
      }

      // Admin Blue Tag Delegation: Super Admin ONLY
      if (grantBlueTagAccess !== undefined && isSuperAdminUser) {
        updates.canManageBlueTag = Boolean(grantBlueTagAccess);
      }

      // Only Super Admin can change user roles
      if (role && isSuperAdminUser) {
        if (isProtectedUser(targetUser) && role !== "super_admin") {
          return res.status(400).json({
            success: false,
            message: "Super Admin status cannot be revoked.",
          });
        }
        updates.role = role;
      }

      const updated = memoryStore.updateUser(targetUserId, updates);
      delete updated.password;
      return res.status(200).json({
        success: true,
        message: `User @${updated.username} updated successfully`,
        user: updated,
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Target user not found" });
    }

    if (isProtectedUser(targetUser) && !isSuperAdminUser) {
      return res.status(403).json({
        success: false,
        message: "Admins are not authorized to modify a Super Admin profile.",
      });
    }

    if (username) targetUser.username = username.trim();
    if (email) targetUser.email = email.trim().toLowerCase();
    if (fullName !== undefined) targetUser.fullName = fullName.trim();
    if (bio !== undefined) targetUser.bio = bio;
    if (accountStatus) targetUser.accountStatus = accountStatus;
    if (profilePrivacy) targetUser.profilePrivacy = profilePrivacy;
    if (profileType) targetUser.profileType = profileType;
    if (category !== undefined) targetUser.category = category.trim();
    if (gender !== undefined) targetUser.gender = gender;

    // Blue Tag modification
    if (isBlueTag !== undefined && canManageBlueTag) {
      targetUser.isBlueTag = Boolean(isBlueTag);
      targetUser.blueTagGivenBy = req.id;
      targetUser.blueTagGivenAt = isBlueTag ? new Date() : null;
    }

    // Admin Blue Tag Delegation
    if (grantBlueTagAccess !== undefined && isSuperAdminUser) {
      targetUser.canManageBlueTag = Boolean(grantBlueTagAccess);
    }

    // Role modification check: Super Admin ONLY
    if (role && isSuperAdminUser) {
      if (isProtectedUser(targetUser) && role !== "super_admin") {
        return res.status(400).json({
          success: false,
          message: "Super Admin status cannot be revoked.",
        });
      }
      targetUser.role = role;
    }

    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: `User @${targetUser.username} updated successfully`,
      user: targetUser,
    });
  } catch (error) {
    console.error("Error in updateUserByAdmin:", error);
    return res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

// 4. Change user role (Super Admin ONLY: Promote to Admin / Demote to User)
export const changeUserRole = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { newRole } = req.body;

    if (!["user", "admin"].includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified. Role can be 'admin' or 'user'.",
      });
    }

    if (mongoose.connection.readyState !== 1) {
      const targetUser = memoryStore.getUserById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (isProtectedUser(targetUser)) {
        return res.status(400).json({
          success: false,
          message: "Super Admin status is permanent and cannot be modified.",
        });
      }

      const updated = memoryStore.updateUser(targetUserId, { role: newRole });
      delete updated.password;

      return res.status(200).json({
        success: true,
        message: `Role for @${updated.username} updated to '${newRole}'`,
        user: updated,
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (isProtectedUser(targetUser)) {
      return res.status(400).json({
        success: false,
        message: "Super Admin status is permanent and cannot be modified.",
      });
    }

    targetUser.role = newRole;
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: `Role for @${targetUser.username} updated to '${newRole}'`,
      user: targetUser,
    });
  } catch (error) {
    console.error("Error in changeUserRole:", error);
    return res.status(500).json({ success: false, message: "Failed to change user role" });
  }
};

// 5. Delete user and their platform data
export const deleteUserByAdmin = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const isSuperAdminUser = req.userRole === "super_admin";

    if (mongoose.connection.readyState !== 1) {
      const targetUser = memoryStore.getUserById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // Check: Super admin cannot be deleted
      if (isProtectedUser(targetUser)) {
        return res.status(403).json({
          success: false,
          message: "Super Admin account is protected and cannot be deleted.",
        });
      }

      // Check: Regular admin cannot delete another admin
      if (targetUser.role === "admin" && !isSuperAdminUser) {
        return res.status(403).json({
          success: false,
          message: "Only Super Admin can delete administrator accounts.",
        });
      }

      // Delete user posts & comments
      const userPosts = memoryStore.getUserPosts(targetUserId) || [];
      userPosts.forEach((p) => memoryStore.deletePost(p._id));
      memoryStore.deleteUser(targetUserId);

      return res.status(200).json({
        success: true,
        message: `User @${targetUser.username} and their data were deleted successfully`,
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (isProtectedUser(targetUser)) {
      return res.status(403).json({
        success: false,
        message: "Super Admin account is protected and cannot be deleted.",
      });
    }

    if (targetUser.role === "admin" && !isSuperAdminUser) {
      return res.status(403).json({
        success: false,
        message: "Only Super Admin can delete administrator accounts.",
      });
    }

    // Cascade delete user posts, comments, stories
    await Promise.all([
      Post.deleteMany({ author: targetUserId }),
      Comment.deleteMany({ author: targetUserId }),
      Story.deleteMany({ author: targetUserId }),
      User.findByIdAndDelete(targetUserId),
    ]);

    return res.status(200).json({
      success: true,
      message: `User @${targetUser.username} and their data were deleted successfully`,
    });
  } catch (error) {
    console.error("Error in deleteUserByAdmin:", error);
    return res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

// 6. Get all platform posts for content moderation
export const getAllPostsAdmin = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const posts = Array.from(memoryStore.posts.values()).map((p) => {
        const author = memoryStore.getUserById(p.author) || { username: "Unknown" };
        return {
          ...p,
          author: {
            _id: author._id,
            username: author.username,
            profilePicture: author.profilePicture,
          },
          likesCount: (p.likes || []).length,
          commentsCount: (p.comments || []).length,
        };
      });
      return res.status(200).json({ success: true, posts });
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate("author", "username profilePicture email")
      .limit(100);

    return res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error("Error in getAllPostsAdmin:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch platform posts" });
  }
};

// 7. Delete any post across the platform
export const deletePostByAdmin = async (req, res) => {
  try {
    const postId = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      const deleted = memoryStore.deletePost(postId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Post not found" });
      }
      return res.status(200).json({ success: true, message: "Post deleted by admin" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    await Post.findByIdAndDelete(postId);
    await Comment.deleteMany({ post: postId });

    return res.status(200).json({ success: true, message: "Post deleted by admin" });
  } catch (error) {
    console.error("Error in deletePostByAdmin:", error);
    return res.status(500).json({ success: false, message: "Failed to delete post" });
  }
};

// 8. Super Admin: Control any user's messaging privileges and options
export const updateUserMessagingOptions = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const {
      canSendMessages,
      messagingStatus, // 'active' | 'restricted' | 'disabled'
      messagePermission, // 'everyone' | 'followers_only' | 'no_one'
      restrictionReason,
    } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const targetUser = memoryStore.getUserById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (isProtectedUser(targetUser)) {
        return res.status(403).json({
          success: false,
          message: "Cannot modify messaging permissions for the Super Admin.",
        });
      }

      const currentOptions = targetUser.messagingOptions || {};
      const updatedOptions = {
        canSendMessages: canSendMessages !== undefined ? Boolean(canSendMessages) : currentOptions.canSendMessages !== false,
        messagingStatus: messagingStatus || currentOptions.messagingStatus || "active",
        messagePermission: messagePermission || currentOptions.messagePermission || "everyone",
        restrictionReason: restrictionReason !== undefined ? restrictionReason.trim() : (currentOptions.restrictionReason || ""),
      };

      const updated = memoryStore.updateUser(targetUserId, { messagingOptions: updatedOptions });
      delete updated.password;

      return res.status(200).json({
        success: true,
        message: `Messaging options for @${updated.username} updated successfully`,
        messagingOptions: updatedOptions,
        user: updated,
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (isProtectedUser(targetUser)) {
      return res.status(403).json({
        success: false,
        message: "Cannot modify messaging permissions for the Super Admin.",
      });
    }

    if (!targetUser.messagingOptions) {
      targetUser.messagingOptions = {
        canSendMessages: true,
        messagingStatus: "active",
        messagePermission: "everyone",
        restrictionReason: "",
      };
    }

    if (canSendMessages !== undefined) {
      targetUser.messagingOptions.canSendMessages = Boolean(canSendMessages);
    }
    if (messagingStatus) {
      targetUser.messagingOptions.messagingStatus = messagingStatus;
      if (messagingStatus === "restricted" || messagingStatus === "disabled") {
        targetUser.messagingOptions.canSendMessages = false;
      } else if (messagingStatus === "active") {
        targetUser.messagingOptions.canSendMessages = true;
      }
    }
    if (messagePermission) {
      targetUser.messagingOptions.messagePermission = messagePermission;
    }
    if (restrictionReason !== undefined) {
      targetUser.messagingOptions.restrictionReason = restrictionReason.trim();
    }

    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: `Messaging options for @${targetUser.username} updated successfully`,
      messagingOptions: targetUser.messagingOptions,
      user: targetUser,
    });
  } catch (error) {
    console.error("Error in updateUserMessagingOptions:", error);
    return res.status(500).json({ success: false, message: "Failed to update messaging options" });
  }
};

// 9. Super Admin & Admin: Get all conversations across platform
export const getAllConversationsAdmin = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const conversations = Array.from(memoryStore.conversations.values()).map((conv) => {
        const participantUsers = (conv.participants || []).map((id) => {
          const u = memoryStore.getUserById(id);
          return u ? {
            _id: u._id,
            username: u.username,
            fullName: u.fullName,
            email: u.email,
            profilePicture: u.profilePicture,
            role: u.role,
            messagingOptions: u.messagingOptions,
          } : { _id: id, username: "Unknown" };
        });

        const messages = (conv.messages || []).map((mId) => memoryStore.messages.get(mId)).filter(Boolean);
        const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;

        return {
          _id: conv._id,
          participants: participantUsers,
          messagesCount: messages.length,
          lastMessage: lastMsg ? {
            content: lastMsg.content || lastMsg.message,
            createdAt: lastMsg.createdAt,
            senderId: lastMsg.senderId,
          } : null,
          createdAt: conv.createdAt || new Date(),
        };
      });

      return res.status(200).json({ success: true, conversations });
    }

    const conversations = await Conversation.find({})
      .populate("participants", "username fullName email profilePicture role messagingOptions")
      .populate({
        path: "messages",
        options: { sort: { createdAt: -1 }, limit: 1 },
      })
      .sort({ updatedAt: -1 });

    const formatted = conversations.map((conv) => {
      const lastMsg = conv.messages && conv.messages.length > 0 ? conv.messages[0] : null;
      return {
        _id: conv._id,
        participants: conv.participants,
        messagesCount: (conv.messages || []).length,
        lastMessage: lastMsg ? {
          content: lastMsg.content,
          createdAt: lastMsg.createdAt,
          senderId: lastMsg.senderId,
        } : null,
        updatedAt: conv.updatedAt,
      };
    });

    return res.status(200).json({ success: true, conversations: formatted });
  } catch (error) {
    console.error("Error in getAllConversationsAdmin:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch conversations" });
  }
};

// 10. Get full message thread for a conversation
export const getConversationMessagesAdmin = async (req, res) => {
  try {
    const convId = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      const conv = memoryStore.conversations.get(convId);
      if (!conv) {
        return res.status(404).json({ success: false, message: "Conversation not found" });
      }

      const messages = (conv.messages || [])
        .map((mId) => {
          const m = memoryStore.messages.get(mId);
          if (!m) return null;
          const sender = memoryStore.getUserById(m.senderId);
          const receiver = memoryStore.getUserById(m.receiverId);
          return {
            ...m,
            sender: sender ? { _id: sender._id, username: sender.username, profilePicture: sender.profilePicture } : null,
            receiver: receiver ? { _id: receiver._id, username: receiver.username, profilePicture: receiver.profilePicture } : null,
          };
        })
        .filter(Boolean);

      return res.status(200).json({ success: true, messages });
    }

    const conv = await Conversation.findById(convId).populate({
      path: "messages",
      populate: [
        { path: "senderId", select: "username profilePicture email" },
        { path: "receiverId", select: "username profilePicture email" },
      ],
    });

    if (!conv) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    return res.status(200).json({ success: true, messages: conv.messages || [] });
  } catch (error) {
    console.error("Error in getConversationMessagesAdmin:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch conversation messages" });
  }
};

// 11. Delete specific message
export const deleteMessageByAdmin = async (req, res) => {
  try {
    const messageId = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      const msg = memoryStore.messages.get(messageId);
      if (!msg) {
        return res.status(404).json({ success: false, message: "Message not found" });
      }
      memoryStore.messages.delete(messageId);
      for (const conv of memoryStore.conversations.values()) {
        conv.messages = (conv.messages || []).filter((id) => id !== messageId);
      }
      return res.status(200).json({ success: true, message: "Message deleted by administrator" });
    }

    const msg = await Message.findById(messageId);
    if (!msg) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    await Message.findByIdAndDelete(messageId);
    await Conversation.updateMany(
      { messages: messageId },
      { $pull: { messages: messageId } }
    );

    return res.status(200).json({ success: true, message: "Message deleted by administrator" });
  } catch (error) {
    console.error("Error in deleteMessageByAdmin:", error);
    return res.status(500).json({ success: false, message: "Failed to delete message" });
  }
};

// 12. Delete entire conversation
export const deleteConversationByAdmin = async (req, res) => {
  try {
    const convId = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      const conv = memoryStore.conversations.get(convId);
      if (!conv) {
        return res.status(404).json({ success: false, message: "Conversation not found" });
      }
      (conv.messages || []).forEach((mId) => memoryStore.messages.delete(mId));
      memoryStore.conversations.delete(convId);
      return res.status(200).json({ success: true, message: "Conversation removed by administrator" });
    }

    const conv = await Conversation.findById(convId);
    if (!conv) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    if (conv.messages && conv.messages.length > 0) {
      await Message.deleteMany({ _id: { $in: conv.messages } });
    }
    await Conversation.findByIdAndDelete(convId);

    return res.status(200).json({ success: true, message: "Conversation removed by administrator" });
  } catch (error) {
    console.error("Error in deleteConversationByAdmin:", error);
    return res.status(500).json({ success: false, message: "Failed to delete conversation" });
  }
};

// 13. Grant / Revoke Blue Tag on User Account
// Super Admin or authorized Admin (canManageBlueTag = true) can perform this
export const toggleUserBlueTag = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const isSuper = req.userRole === "super_admin" || isProtectedUser(req.adminUser);
    const hasPrivilege = isSuper || Boolean(req.canManageBlueTag) || Boolean(req.adminUser?.canManageBlueTag);

    if (!hasPrivilege) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Super Admin or authorized Admins with Blue Tag privileges can grant or revoke Blue Tags.",
      });
    }

    if (mongoose.connection.readyState !== 1) {
      const targetUser = memoryStore.getUserById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: "Target user not found" });
      }

      const nextStatus =
        req.body.isBlueTag !== undefined ? Boolean(req.body.isBlueTag) : !targetUser.isBlueTag;

      const updated = memoryStore.updateUser(targetUserId, {
        isBlueTag: nextStatus,
        blueTagGivenBy: req.id,
        blueTagGivenAt: nextStatus ? new Date() : null,
      });
      delete updated.password;

      return res.status(200).json({
        success: true,
        message: nextStatus
          ? `Blue Tag verified badge granted to @${updated.username}`
          : `Blue Tag verified badge removed from @${updated.username}`,
        user: updated,
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Target user not found" });
    }

    const nextStatus =
      req.body.isBlueTag !== undefined ? Boolean(req.body.isBlueTag) : !targetUser.isBlueTag;

    targetUser.isBlueTag = nextStatus;
    targetUser.blueTagGivenBy = req.id;
    targetUser.blueTagGivenAt = nextStatus ? new Date() : null;
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: nextStatus
        ? `Blue Tag verified badge granted to @${targetUser.username}`
        : `Blue Tag verified badge removed from @${targetUser.username}`,
      user: targetUser,
    });
  } catch (error) {
    console.error("Error in toggleUserBlueTag:", error);
    return res.status(500).json({ success: false, message: "Failed to update Blue Tag status" });
  }
};

// 14. Super Admin ONLY: Grant or Revoke Blue Tag Management Privileges to Other Admins
export const toggleAdminBlueTagAccess = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const isSuper = req.userRole === "super_admin" || isProtectedUser(req.adminUser);

    if (!isSuper) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Super Admin can grant or revoke Blue Tag management permissions to other admins.",
      });
    }

    if (mongoose.connection.readyState !== 1) {
      const targetUser = memoryStore.getUserById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: "Target user not found" });
      }

      if (targetUser.role !== "admin" && targetUser.role !== "super_admin") {
        return res.status(400).json({
          success: false,
          message: "Target user must be an administrator to receive Blue Tag delegation privileges.",
        });
      }

      const nextAccess =
        req.body.canManageBlueTag !== undefined
          ? Boolean(req.body.canManageBlueTag)
          : !targetUser.canManageBlueTag;

      const updated = memoryStore.updateUser(targetUserId, {
        canManageBlueTag: nextAccess,
      });
      delete updated.password;

      return res.status(200).json({
        success: true,
        message: nextAccess
          ? `Blue Tag management privileges granted to Admin @${updated.username}`
          : `Blue Tag management privileges revoked from Admin @${updated.username}`,
        user: updated,
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Target user not found" });
    }

    if (targetUser.role !== "admin" && targetUser.role !== "super_admin") {
      return res.status(400).json({
        success: false,
        message: "Target user must be an administrator to receive Blue Tag delegation privileges.",
      });
    }

    const nextAccess =
      req.body.canManageBlueTag !== undefined
        ? Boolean(req.body.canManageBlueTag)
        : !targetUser.canManageBlueTag;

    targetUser.canManageBlueTag = nextAccess;
    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: nextAccess
        ? `Blue Tag management privileges granted to Admin @${targetUser.username}`
        : `Blue Tag management privileges revoked from Admin @${targetUser.username}`,
      user: targetUser,
    });
  } catch (error) {
    console.error("Error in toggleAdminBlueTagAccess:", error);
    return res.status(500).json({ success: false, message: "Failed to update Admin Blue Tag privileges" });
  }
};
