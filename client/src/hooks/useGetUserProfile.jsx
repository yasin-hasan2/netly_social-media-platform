import { axiosInstance } from "@/lib/axios";
import { setUserProfile } from "@/redux/authSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;
    const fetchUserProfile = async () => {
      try {
        const res = await axiosInstance.get(`/user/${userId}/profile`, {
          withCredentials: true,
        });

        if (res.data?.success && res.data.user) {
          dispatch(setUserProfile(res.data.user));
        }
      } catch (error) {
        console.log("Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
  }, [userId, dispatch]);
};

export default useGetUserProfile;
