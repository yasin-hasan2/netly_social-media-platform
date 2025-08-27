import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    // user: null,
    // suggestedUsers: [],
    // userProfile: null,
    onlineUsers: [],
    messages: [],
    selectedUser: null,
  },
  reducers: {
    // actions
    // setAuthUser: (state, action) => {
    //   state.user = action.payload;
    // },
    // setSuggestedUsers: (state, action) => {
    //   state.suggestedUsers = action.payload;
    // },
    // setUserProfile: (state, action) => {
    //   state.userProfile = action.payload;
    // },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
  },
});
export const {
  //   setAuthUser,
  //   setSuggestedUsers,
  //   setUserProfile,
  setSelectedUser,
  setOnlineUsers,
  setMessages,
} = chatSlice.actions;
export default chatSlice.reducer;
