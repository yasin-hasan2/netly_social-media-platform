import mongoose from "mongoose";
import { Notification } from "../models/notification.model.js";
import { Message } from "../models/message.model.js";
import { memoryStore } from "../lib/memoryStore.js";

// Fetch notifications for the logged-in user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = (req.user?._id || req.id).toString();

    if (mongoose.connection.readyState !== 1) {
      if (!memoryStore.notifications) {
        memoryStore.notifications = new Map();
      }
      const notifs = Array.from(memoryStore.notifications.values())
        .filter((n) => n.recipient === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const unreadCount = notifs.filter((n) => !n.read).length;

      return res.status(200).json({
        success: true,
        notifications: notifs,
        unreadCount,
      });
    }

    const notifications = await Notification.find({ recipient: userId })
      .populate("sender", "username fullName profilePicture")
      .populate("post", "image video postType caption")
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("getUserNotifications error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = (req.user?._id || req.id).toString();

    if (mongoose.connection.readyState !== 1) {
      if (memoryStore.notifications) {
        for (const notif of memoryStore.notifications.values()) {
          if (notif.recipient === userId) {
            notif.read = true;
          }
        }
      }
      return res.status(200).json({ success: true, message: "All notifications marked as read" });
    }

    await Notification.updateMany({ recipient: userId, read: false }, { $set: { read: true } });

    return res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("markAllNotificationsAsRead error:", error);
    return res.status(500).json({ success: false, message: "Failed to mark notifications as read" });
  }
};

// Mark specific notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const notifId = req.params.id;
    const userId = (req.user?._id || req.id).toString();

    if (mongoose.connection.readyState !== 1) {
      if (memoryStore.notifications && memoryStore.notifications.has(notifId)) {
        const notif = memoryStore.notifications.get(notifId);
        if (notif.recipient === userId) {
          notif.read = true;
        }
      }
      return res.status(200).json({ success: true, message: "Notification marked as read" });
    }

    await Notification.findOneAndUpdate(
      { _id: notifId, recipient: userId },
      { $set: { read: true } }
    );

    return res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("markNotificationAsRead error:", error);
    return res.status(500).json({ success: false, message: "Failed to update notification" });
  }
};

// Clear all notifications
export const clearUserNotifications = async (req, res) => {
  try {
    const userId = (req.user?._id || req.id).toString();

    if (mongoose.connection.readyState !== 1) {
      if (memoryStore.notifications) {
        for (const [id, notif] of memoryStore.notifications.entries()) {
          if (notif.recipient === userId) {
            memoryStore.notifications.delete(id);
          }
        }
      }
      return res.status(200).json({ success: true, message: "Notifications cleared" });
    }

    await Notification.deleteMany({ recipient: userId });

    return res.status(200).json({ success: true, message: "Notifications cleared" });
  } catch (error) {
    console.error("clearUserNotifications error:", error);
    return res.status(500).json({ success: false, message: "Failed to clear notifications" });
  }
};

// Get aggregate notification & unread message counts
export const getBadgeCounts = async (req, res) => {
  try {
    const userId = (req.user?._id || req.id).toString();

    if (mongoose.connection.readyState !== 1) {
      const notifs = memoryStore.notifications
        ? Array.from(memoryStore.notifications.values()).filter((n) => n.recipient === userId && !n.read)
        : [];

      return res.status(200).json({
        success: true,
        unreadNotifications: notifs.length,
        unreadMessages: 0,
      });
    }

    const unreadNotifications = await Notification.countDocuments({
      recipient: userId,
      read: false,
    });

    return res.status(200).json({
      success: true,
      unreadNotifications,
      unreadMessages: 0,
    });
  } catch (error) {
    console.error("getBadgeCounts error:", error);
    return res.status(500).json({ success: false, message: "Failed to get badge counts" });
  }
};
