import { axiosInstance } from "@/lib/axios";
import { toggleFollow } from "@/redux/authSlice";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";

const useFollowHandler = (targetUserId) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  // Directly derive following status reactively from Redux auth user
  const isFollowing = Boolean(
    targetUserId &&
      user?.following &&
      user.following.some(
        (id) => (id?._id || id).toString() === targetUserId.toString()
      )
  );

  const followHandler = async () => {
    if (!user) {
      toast.error("You must be logged in to follow users");
      return { success: false };
    }
    if (user._id?.toString() === targetUserId?.toString()) {
      toast.error("You cannot follow yourself");
      return { success: false };
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post(
        `/user/followorunfollow/${targetUserId}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(toggleFollow(targetUserId));
        toast.success(res.data.message || (isFollowing ? "Unfollowed" : "Followed"));
        return { success: true, isFollowing: res.data.isFollowing };
      } else {
        toast.error(res.data.message || "Action failed");
        return { success: false };
      }
    } catch (err) {
      console.error("Follow error:", err);
      toast.error(err.response?.data?.message || "Failed to update follow status");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { following: isFollowing, followHandler, loading };
};

export default useFollowHandler;
