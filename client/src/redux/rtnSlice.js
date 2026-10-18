import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
  name: "realTimeNotification",
  initialState: {
    notifications: [],
    likeNotification: [], // Backwards-compatible alias
    unreadNotificationCount: 0,
    unreadMessagesCount: 0,
    unreadMessagesBySender: {}, // { [senderId]: number }
  },
  reducers: {
    setNotifications: (state, action) => {
      const list = Array.isArray(action.payload) ? action.payload : [];
      state.notifications = list;
      state.likeNotification = list;
      state.unreadNotificationCount = list.filter((n) => !n.read).length;
    },

    addNotification: (state, action) => {
      const notif = action.payload;
      if (!notif) return;

      if (!Array.isArray(state.notifications)) {
        state.notifications = [];
      }

      // Check if notification already exists (idempotency)
      const notifId = notif._id || notif.id;
      const exists = state.notifications.some(
        (n) => (n._id || n.id) === notifId
      );

      if (!exists) {
        state.notifications.unshift(notif);
        state.likeNotification = state.notifications;
        state.unreadNotificationCount += 1;
      }
    },

    setLikeNotification: (state, action) => {
      // Legacy compatibility handler
      const payload = action.payload;
      if (!payload) return;

      if (!Array.isArray(state.notifications)) {
        state.notifications = [];
      }

      if (payload.type === "dislike") {
        state.notifications = state.notifications.filter(
          (n) => n.userId !== payload.userId && n.sender?._id !== payload.userId
        );
        state.likeNotification = state.notifications;
        state.unreadNotificationCount = state.notifications.filter((n) => !n.read).length;
        return;
      }

      // Add to notifications
      const notifId = payload._id || payload.id || `notif_${Date.now()}`;
      const exists = state.notifications.some((n) => (n._id || n.id) === notifId);
      if (!exists) {
        const normalized = {
          ...payload,
          _id: notifId,
          read: false,
          createdAt: payload.createdAt || new Date().toISOString(),
        };
        state.notifications.unshift(normalized);
        state.likeNotification = state.notifications;
        state.unreadNotificationCount += 1;
      }
    },

    markAllNotificationsRead: (state) => {
      if (Array.isArray(state.notifications)) {
        state.notifications.forEach((n) => {
          n.read = true;
        });
        state.likeNotification = state.notifications;
      }
      state.unreadNotificationCount = 0;
    },

    markNotificationRead: (state, action) => {
      const id = action.payload;
      if (!id) return;
      const target = state.notifications.find((n) => (n._id || n.id) === id);
      if (target && !target.read) {
        target.read = true;
        state.unreadNotificationCount = Math.max(0, state.unreadNotificationCount - 1);
        state.likeNotification = state.notifications;
      }
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.likeNotification = [];
      state.unreadNotificationCount = 0;
    },

    // --- Direct Messages Notifications ---
    addMessageNotification: (state, action) => {
      const msg = action.payload;
      if (!msg) return;
      const senderId = (msg.senderId?._id || msg.senderId)?.toString();
      if (!senderId) return;

      state.unreadMessagesCount += 1;
      if (!state.unreadMessagesBySender) {
        state.unreadMessagesBySender = {};
      }
      state.unreadMessagesBySender[senderId] =
        (state.unreadMessagesBySender[senderId] || 0) + 1;
    },

    clearMessageNotificationsForSender: (state, action) => {
      const senderId = (action.payload?._id || action.payload)?.toString();
      if (!senderId || !state.unreadMessagesBySender) return;

      const count = state.unreadMessagesBySender[senderId] || 0;
      delete state.unreadMessagesBySender[senderId];
      state.unreadMessagesCount = Math.max(0, state.unreadMessagesCount - count);
    },

    clearAllMessageNotifications: (state) => {
      state.unreadMessagesCount = 0;
      state.unreadMessagesBySender = {};
    },

    setUnreadCounts: (state, action) => {
      const { unreadNotifications, unreadMessages } = action.payload || {};
      if (unreadNotifications !== undefined) {
        state.unreadNotificationCount = unreadNotifications;
      }
      if (unreadMessages !== undefined) {
        state.unreadMessagesCount = unreadMessages;
      }
    },
  },
});

export const {
  setNotifications,
  addNotification,
  setLikeNotification,
  markAllNotificationsRead,
  markNotificationRead,
  clearNotifications,
  addMessageNotification,
  clearMessageNotificationsForSender,
  clearAllMessageNotifications,
  setUnreadCounts,
} = rtnSlice.actions;

export default rtnSlice.reducer;
