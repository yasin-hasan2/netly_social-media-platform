import { axiosInstance } from "@/lib/axios";
import { setSuggestedUsers } from "@/redux/authSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetSuggestedUsers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const res = await axiosInstance.get("/user/suggested", {
          withCredentials: true,
        });
        if (res.data.success) {
          // Sort users by newest (assuming createdAt is available)
          const sortedUsers = [...res.data.users].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

          dispatch(setSuggestedUsers(sortedUsers));
        }
      } catch (error) {
        console.log("Error fetching all suggestedUsers:", error);
      }
    };
    fetchSuggestedUsers();
  }, [dispatch]);
};

export default useGetSuggestedUsers;
