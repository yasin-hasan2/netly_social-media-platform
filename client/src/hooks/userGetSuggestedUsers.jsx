import { axiosInstance } from "@/lib/axios";
import { setSuggestedUsers } from "@/redux/authSlice";
// import { setPosts } from "@/redux/postSlice";
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
          //   console.log("get all posts", res.data.posts);

          dispatch(setSuggestedUsers(res.data.users));
        }
      } catch (error) {
        console.log("Error fetching all suggestedUsers:", error);
      }
    };
    fetchSuggestedUsers();
  }, [dispatch]);
};

export default useGetSuggestedUsers;
