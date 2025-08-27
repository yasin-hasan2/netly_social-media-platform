import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    suggestedUsers: [],
    userProfile: null,
    // selectedUser: null,
  },
  reducers: {
    // actions
    setAuthUser: (state, action) => {
      state.user = action.payload;
    },
    setSuggestedUsers: (state, action) => {
      state.suggestedUsers = action.payload;
    },
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    // setSelectedUser: (state, action) => {
    //   state.selectedUser = action.payload;
    // },
    toggleFollow: (state, action) => {
      const currentUserId = state.user?._id;
      const targetUserId = action.payload;

      if (!state.userProfile || state.userProfile._id !== targetUserId) return;

      const isFollowing = state.userProfile.followers.includes(currentUserId);

      if (isFollowing) {
        // unfollow
        state.userProfile.followers = state.userProfile.followers.filter(
          (id) => id !== currentUserId
        );
      } else {
        // follow
        state.userProfile.followers.push(currentUserId);
      }
    },
  },
});
export const {
  setAuthUser,
  setSuggestedUsers,
  setUserProfile,
  toggleFollow,
  // setSelectedUser,
} = authSlice.actions;
export default authSlice.reducer;
