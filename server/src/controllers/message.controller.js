import mongoose from "mongoose";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { memoryStore } from "../lib/memoryStore.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { textMessage: message, replyTo } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message content cannot be empty",
        success: false,
      });
    }

    if (mongoose.connection.readyState !== 1) {
      const sender = memoryStore.getUserById(senderId);
      if (!sender) {
        return res.status(404).json({ message: "Sender not found", success: false });
      }

      // Check sender messaging restriction
      if (
        sender.messagingOptions?.canSendMessages === false ||
        sender.messagingOptions?.messagingStatus === "restricted" ||
        sender.messagingOptions?.messagingStatus === "disabled"
      ) {
        return res.status(403).json({
          message: sender.messagingOptions?.restrictionReason
            ? `Your direct messaging privileges have been restricted by the Administrator: ${sender.messagingOptions.restrictionReason}`
            : "Your direct messaging privileges have been restricted by the Administrator.",
          success: false,
        });
      }

      const receiver = memoryStore.getUserById(receiverId);
      if (receiver?.messagingOptions?.messagePermission === "no_one") {
        return res.status(403).json({
          message: "This user has disabled incoming direct messages.",
          success: false,
        });
      }

      const senderFollowing = (sender.following || []).map((id) => (id?._id || id).toString());
      const senderFollowers = (sender.followers || []).map((id) => (id?._id || id).toString());
      const isFollowing = senderFollowing.includes(receiverId.toString());
      const isFollower = senderFollowers.includes(receiverId.toString());

      // Only allowed if user follows receiver or receiver follows user
      if (!isFollowing && !isFollower) {
        return res.status(403).json({
          message: "You can only message users you follow. Follow this user to start chatting!",
          success: false,
        });
      }

      const newMessage = memoryStore.addMessage(senderId, receiverId, message, replyTo);
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
        io.to(receiverSocketId).emit("messageNotification", {
          _id: newMessage._id,
          senderId,
          senderUsername: sender.username,
          senderFullName: sender.fullName,
          senderProfilePicture: sender.profilePicture,
          message: newMessage.content || newMessage.message,
          createdAt: newMessage.createdAt,
          conversationId: newMessage.conversationId,
        });
      }
      return res.status(200).json({
        success: true,
        newMessage,
      });
    }

    // In MongoDB: check follow relationship & messaging restrictions
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: "Sender not found", success: false });
    }

    if (
      sender.messagingOptions?.canSendMessages === false ||
      sender.messagingOptions?.messagingStatus === "restricted" ||
      sender.messagingOptions?.messagingStatus === "disabled"
    ) {
      return res.status(403).json({
        message: sender.messagingOptions?.restrictionReason
          ? `Your direct messaging privileges have been restricted by the Administrator: ${sender.messagingOptions.restrictionReason}`
          : "Your direct messaging privileges have been restricted by the Administrator.",
        success: false,
      });
    }

    const receiver = await User.findById(receiverId);
    if (receiver?.messagingOptions?.messagePermission === "no_one") {
      return res.status(403).json({
        message: "This user has disabled incoming direct messages.",
        success: false,
      });
    }

    const senderFollowing = (sender.following || []).map((id) => id.toString());
    const senderFollowers = (sender.followers || []).map((id) => id.toString());
    const isFollowing = senderFollowing.includes(receiverId.toString());
    const isFollower = senderFollowers.includes(receiverId.toString());

    if (!isFollowing && !isFollower) {
      return res.status(403).json({
        message: "You can only message users you follow. Follow this user to start chatting!",
        success: false,
      });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      content: message,
      replyTo: replyTo || null,
      reactions: [],
    });

    if (newMessage) conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      io.to(receiverSocketId).emit("messageNotification", {
        _id: newMessage._id,
        senderId,
        senderUsername: sender.username,
        senderFullName: sender.fullName,
        senderProfilePicture: sender.profilePicture,
        message: newMessage.content || newMessage.message,
        createdAt: newMessage.createdAt,
        conversationId: conversation._id,
      });
    }

    return res.status(200).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const userId = req.id;
    const messageId = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      const result = memoryStore.deleteMessage(messageId, userId);
      if (!result.success) {
        return res.status(result.status || 400).json(result);
      }
      io.emit("messageDeleted", { messageId });
      return res.status(200).json({
        success: true,
        message: "Message deleted successfully",
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this message" });
    }

    const receiverId = message.receiverId.toString();

    await Message.findByIdAndDelete(messageId);
    await Conversation.updateMany(
      { messages: messageId },
      { $pull: { messages: messageId } }
    );

    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(userId);

    if (receiverSocketId) io.to(receiverSocketId).emit("messageDeleted", { messageId });
    if (senderSocketId) io.to(senderSocketId).emit("messageDeleted", { messageId });

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const reactMessage = async (req, res) => {
  try {
    const userId = req.id;
    const messageId = req.params.id;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ success: false, message: "Emoji is required" });
    }

    if (mongoose.connection.readyState !== 1) {
      const result = memoryStore.reactMessage(messageId, userId, emoji);
      if (!result.success) {
        return res.status(400).json(result);
      }
      io.emit("messageReacted", { messageId, reactions: result.reactions });
      return res.status(200).json({
        success: true,
        reactions: result.reactions,
      });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (!Array.isArray(message.reactions)) {
      message.reactions = [];
    }

    const existingIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString() && r.emoji === emoji
    );

    if (existingIndex > -1) {
      message.reactions.splice(existingIndex, 1);
    } else {
      // Allow user to toggle to new emoji
      message.reactions = message.reactions.filter(
        (r) => r.userId.toString() !== userId.toString()
      );
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    const senderSocketId = getReceiverSocketId(message.senderId.toString());

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReacted", {
        messageId,
        reactions: message.reactions,
      });
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageReacted", {
        messageId,
        reactions: message.reactions,
      });
    }

    return res.status(200).json({
      success: true,
      reactions: message.reactions,
    });
  } catch (error) {
    console.error("Error in reactMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const clearConversation = async (req, res) => {
  try {
    const userId = req.id;
    const partnerId = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      const conv = memoryStore.getConversation(userId, partnerId);
      if (conv) {
        conv.messages = [];
      }
      return res.status(200).json({
        success: true,
        message: "Conversation cleared successfully",
      });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [userId, partnerId] },
    });

    if (conversation) {
      conversation.messages = [];
      await conversation.save();
    }

    return res.status(200).json({
      success: true,
      message: "Conversation cleared successfully",
    });
  } catch (error) {
    console.error("Error in clearConversation:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;

    if (mongoose.connection.readyState !== 1) {
      const messages = memoryStore.getMessages(senderId, receiverId);
      return res.status(200).json({
        success: true,
        messages: messages || [],
      });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json({
        success: true,
        messages: [],
      });
    }

    return res.status(200).json({
      success: true,
      messages: conversation?.messages || [],
    });
  } catch (error) {
    console.error("Error in getMessages:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// get all inbox contacts for the user: followed users, followers, and active chats
export const getChatUsers = async (req, res) => {
  try {
    const currentUserId = req.id;

    if (mongoose.connection.readyState !== 1) {
      const contacts = memoryStore.getChatContacts(currentUserId);
      return res.status(200).json({
        success: true,
        users: contacts,
      });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Find conversations for this user to get last message
    const conversations = await Conversation.find({
      participants: currentUserId,
    }).populate({
      path: "messages",
      options: { sort: { createdAt: -1 }, limit: 1 },
    });

    const conversationPartnerIds = [];
    const lastMessageMap = {};

    conversations.forEach((conv) => {
      const partnerId = conv.participants.find(
        (p) => p.toString() !== currentUserId.toString()
      );
      if (partnerId) {
        const pIdStr = partnerId.toString();
        conversationPartnerIds.push(partnerId);
        if (conv.messages && conv.messages.length > 0) {
          lastMessageMap[pIdStr] = conv.messages[0];
        }
      }
    });

    const currentUserFollowingIds = (currentUser.following || []).map((id) => id.toString());
    const currentUserFollowersIds = (currentUser.followers || []).map((id) => id.toString());

    // Anyone followed, followers, or conversation participants
    const relevantIds = new Set([
      ...currentUserFollowingIds,
      ...currentUserFollowersIds,
      ...conversationPartnerIds.map((id) => id.toString()),
    ]);

    const users = await User.find({ _id: { $in: Array.from(relevantIds) } }).select(
      "username fullName profilePicture bio followers following"
    );

    const contacts = users.map((u) => {
      const uIdStr = u._id.toString();
      return {
        _id: u._id,
        username: u.username,
        fullName: u.fullName || u.username,
        profilePicture: u.profilePicture,
        bio: u.bio || "",
        isFollowing: currentUserFollowingIds.includes(uIdStr),
        isFollower: currentUserFollowersIds.includes(uIdStr),
        lastMessage: lastMessageMap[uIdStr] || null,
      };
    });

    // Sort: contacts with recent messages first, followed by alphabetical
    contacts.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const timeB = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      if (timeA !== timeB) return timeB - timeA;
      return a.username.localeCompare(b.username);
    });

    return res.status(200).json({
      success: true,
      users: contacts,
    });
  } catch (error) {
    console.error("Error in getChatUsers:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
