import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { Notification } from "../models/notification.model.js";
import { memoryStore } from "./memoryStore.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

// Helper to extract unique @usernames from text
export const extractMentions = (text = "") => {
  if (!text || typeof text !== "string") return [];
  const matches = text.match(/@[a-zA-Z0-9_]+/g) || [];
  return Array.from(new Set(matches.map((m) => m.slice(1).toLowerCase())));
};

export const createAndEmitNotification = async ({
  recipientId,
  senderId,
  type, // "like" | "comment" | "mention" | "repost" | "message"
  postId = null,
  commentId = null,
  content = "",
}) => {
  try {
    if (!recipientId || !senderId) return null;
    const recipientIdStr = (recipientId?._id || recipientId).toString();
    const senderIdStr = (senderId?._id || senderId).toString();

    // Do not notify self
    if (recipientIdStr === senderIdStr) return null;

    let senderUser = null;
    let postDetails = null;

    // In-memory store fallback
    if (mongoose.connection.readyState !== 1) {
      senderUser = memoryStore.getUserById(senderIdStr);
      if (!senderUser) return null;

      if (postId) {
        const p = memoryStore.posts.get(postId.toString());
        if (p) {
          postDetails = {
            _id: p._id,
            image: p.image,
            video: p.video,
            postType: p.postType,
            caption: p.caption?.slice(0, 80),
          };
        }
      }

      const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const notification = {
        _id: notifId,
        recipient: recipientIdStr,
        sender: {
          _id: senderUser._id,
          username: senderUser.username,
          fullName: senderUser.fullName,
          profilePicture: senderUser.profilePicture,
        },
        type,
        postId: postId?.toString() || null,
        commentId: commentId?.toString() || null,
        content: content || "",
        post: postDetails,
        read: false,
        createdAt: new Date().toISOString(),
      };

      if (!memoryStore.notifications) {
        memoryStore.notifications = new Map();
      }
      memoryStore.notifications.set(notifId, notification);

      // Emit via socket
      const receiverSocketId = getReceiverSocketId(recipientIdStr);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("notification", notification);
      }

      return notification;
    }

    // MongoDB
    senderUser = await User.findById(senderIdStr).select("username fullName profilePicture");
    if (!senderUser) return null;

    if (postId) {
      const p = await Post.findById(postId).select("image video postType caption");
      if (p) {
        postDetails = {
          _id: p._id,
          image: p.image,
          video: p.video,
          postType: p.postType,
          caption: p.caption?.slice(0, 80),
        };
      }
    }

    const newNotif = await Notification.create({
      recipient: recipientIdStr,
      sender: senderIdStr,
      type,
      post: postId || null,
      comment: commentId || null,
      content: content || "",
      read: false,
    });

    const populatedNotif = {
      _id: newNotif._id,
      recipient: recipientIdStr,
      sender: {
        _id: senderUser._id,
        username: senderUser.username,
        fullName: senderUser.fullName,
        profilePicture: senderUser.profilePicture,
      },
      type,
      postId: postId?.toString() || null,
      commentId: commentId?.toString() || null,
      content: content || "",
      post: postDetails,
      read: false,
      createdAt: newNotif.createdAt,
    };

    // Emit real-time notification to receiver
    const receiverSocketId = getReceiverSocketId(recipientIdStr);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("notification", populatedNotif);
    }

    return populatedNotif;
  } catch (error) {
    console.error("Error in createAndEmitNotification:", error);
    return null;
  }
};

// Dispatch mention notifications for text containing @usernames
export const handleMentions = async ({ text, senderId, postId = null, commentId = null }) => {
  try {
    const mentionUsernames = extractMentions(text);
    if (mentionUsernames.length === 0) return;

    if (mongoose.connection.readyState !== 1) {
      for (const username of mentionUsernames) {
        const targetUser = Array.from(memoryStore.users.values()).find(
          (u) => (u.username || "").toLowerCase() === username
        );
        if (targetUser && targetUser._id !== senderId) {
          await createAndEmitNotification({
            recipientId: targetUser._id,
            senderId,
            type: "mention",
            postId,
            commentId,
            content: text.slice(0, 100),
          });
        }
      }
      return;
    }

    const matchedUsers = await User.find({
      username: { $in: mentionUsernames.map((u) => new RegExp(`^${u}$`, "i")) },
    }).select("_id username");

    for (const targetUser of matchedUsers) {
      if (targetUser._id.toString() !== senderId.toString()) {
        await createAndEmitNotification({
          recipientId: targetUser._id,
          senderId,
          type: "mention",
          postId,
          commentId,
          content: text.slice(0, 100),
        });
      }
    }
  } catch (error) {
    console.error("handleMentions error:", error);
  }
};
