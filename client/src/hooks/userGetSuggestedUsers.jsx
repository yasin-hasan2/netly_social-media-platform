import { axiosInstance } from "@/lib/axios";
import { setSuggestedUsers } from "@/redux/authSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetSuggestedUsers = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const res = await axiosInstance.get("/user/suggested", {
          withCredentials: true,
        });
        if (res.data?.success && res.data.users) {
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
  }, [dispatch, user?._id]);
};

export default useGetSuggestedUsers;
