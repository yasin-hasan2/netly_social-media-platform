import { axiosInstance } from "@/lib/axios";
import { toggleFollow } from "@/redux/authSlice";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { toast } from "sonner";

const useFollowHandler = (targetUserId) => {
  const dispatch = useDispatch();
  const { user, userProfile } = useSelector((state) => state.auth);

  // Local state for button UI
  const [following, setFollowing] = useState(false);

  // Initialize following state
  useEffect(() => {
    if (user && userProfile && userProfile._id === targetUserId) {
      setFollowing(userProfile.followers.includes(user._id));
    }
  }, [user, userProfile, targetUserId]);

  const followHandler = async () => {
    if (!user) return toast.error("You must be logged in");

    try {
      const action = following ? "unfollow" : "follow";

      const res = await axiosInstance.post(
        `/user/followorunfollow/${targetUserId}`,
        {},
        { withCredentials: true }
      );

      console.log("Follow Response:", res.data);

      if (res.data.success) {
        // Update Redux state
        dispatch(toggleFollow(targetUserId));

        // Update local state to change button immediately
        setFollowing(!following);

        toast.success(res.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    }
  };

  return { following, followHandler };
};

export default useFollowHandler;
