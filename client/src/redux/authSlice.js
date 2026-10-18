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
      if (!currentUserId || !targetUserId) return;

      const targetIdStr = targetUserId.toString();
      const currentIdStr = currentUserId.toString();

      // 1. Update authenticated user's following array
      if (state.user) {
        if (!Array.isArray(state.user.following)) {
          state.user.following = [];
        }
        const isFollowingTarget = state.user.following.some(
          (id) => (id?._id || id).toString() === targetIdStr
        );
        if (isFollowingTarget) {
          state.user.following = state.user.following.filter(
            (id) => (id?._id || id).toString() !== targetIdStr
          );
        } else {
          state.user.following.push(targetUserId);
        }
      }

      // 2. Update userProfile if currently loaded in store
      if (state.userProfile) {
        if (!Array.isArray(state.userProfile.followers)) state.userProfile.followers = [];
        if (!Array.isArray(state.userProfile.following)) state.userProfile.following = [];

        // If viewing target user's profile: toggle current user in their followers
        if (state.userProfile._id?.toString() === targetIdStr) {
          const isFollower = state.userProfile.followers.some(
            (id) => (id?._id || id).toString() === currentIdStr
          );
          if (isFollower) {
            state.userProfile.followers = state.userProfile.followers.filter(
              (id) => (id?._id || id).toString() !== currentIdStr
            );
          } else {
            state.userProfile.followers.push(currentUserId);
          }
        }
        // If viewing own profile: toggle target user in own following
        else if (state.userProfile._id?.toString() === currentIdStr) {
          const isFollowing = state.userProfile.following.some(
            (id) => (id?._id || id).toString() === targetIdStr
          );
          if (isFollowing) {
            state.userProfile.following = state.userProfile.following.filter(
              (id) => (id?._id || id).toString() !== targetIdStr
            );
          } else {
            state.userProfile.following.push(targetUserId);
          }
        }
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
