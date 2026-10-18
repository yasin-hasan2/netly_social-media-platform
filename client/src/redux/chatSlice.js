import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    onlineUsers: [],
    messages: [],
    selectedUser: null,
    chatContacts: [],
    loadingContacts: false,
    typingUsers: {},
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setUserTyping: (state, action) => {
      const { userId, isTyping } = action.payload || {};
      if (!userId) return;
      if (!state.typingUsers) {
        state.typingUsers = {};
      }
      if (isTyping) {
        state.typingUsers[userId] = true;
      } else {
        delete state.typingUsers[userId];
      }
    },
    clearTypingUsers: (state) => {
      state.typingUsers = {};
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload || [];
    },
    setMessages: (state, action) => {
      state.messages = action.payload || [];
    },
    setChatContacts: (state, action) => {
      state.chatContacts = Array.isArray(action.payload) ? action.payload : [];
    },
    setLoadingContacts: (state, action) => {
      state.loadingContacts = Boolean(action.payload);
    },
    updateContactLastMessage: (state, action) => {
      if (!Array.isArray(state.chatContacts)) {
        state.chatContacts = [];
      }
      const { partnerId, message } = action.payload || {};
      const idx = state.chatContacts.findIndex(
        (c) => c._id?.toString() === partnerId?.toString()
      );
      if (idx > -1) {
        state.chatContacts[idx].lastMessage = message;
        // Move updated contact to top of list
        const [contact] = state.chatContacts.splice(idx, 1);
        state.chatContacts.unshift(contact);
      }
    },
    addOrUpdateContact: (state, action) => {
      if (!Array.isArray(state.chatContacts)) {
        state.chatContacts = [];
      }
      const contact = action.payload;
      if (!contact) return;
      const idx = state.chatContacts.findIndex(
        (c) => c._id?.toString() === contact._id?.toString()
      );
      if (idx > -1) {
        state.chatContacts[idx] = { ...state.chatContacts[idx], ...contact };
      } else {
        state.chatContacts.unshift(contact);
      }
    },
    deleteMessageAction: (state, action) => {
      const messageId = action.payload;
      state.messages = (state.messages || []).filter(
        (m) => m._id?.toString() !== messageId?.toString()
      );
    },
    updateMessageReaction: (state, action) => {
      const { messageId, reactions } = action.payload || {};
      const msg = (state.messages || []).find(
        (m) => m._id?.toString() === messageId?.toString()
      );
      if (msg) {
        msg.reactions = reactions;
      }
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});
export const {
  setSelectedUser,
  setUserTyping,
  clearTypingUsers,
  setOnlineUsers,
  setMessages,
  setChatContacts,
  setLoadingContacts,
  updateContactLastMessage,
  addOrUpdateContact,
  deleteMessageAction,
  updateMessageReaction,
  clearMessages,
} = chatSlice.actions;
export default chatSlice.reducer;
