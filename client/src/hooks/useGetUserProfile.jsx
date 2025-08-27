import { axiosInstance } from "@/lib/axios";
import { setUserProfile } from "@/redux/authSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetUserProfile = (userId) => {
  console.log("userId in hook", userId);

  const dispatch = useDispatch();
  // const [userProfile, setUserProfile] = useState(null);
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axiosInstance.get(`user/${userId}/profile`, {
          withCredentials: true,
        });

        if (res.data.success) {
          dispatch(setUserProfile(res.data.user));
          console.log("user fetched successfully:", res.data.user);
        }
      } catch (error) {
        console.log("Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
  }, [userId]);
};

export default useGetUserProfile;
