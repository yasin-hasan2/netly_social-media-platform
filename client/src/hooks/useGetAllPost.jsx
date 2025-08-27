import { axiosInstance } from "@/lib/axios";
import { setPosts } from "@/redux/postSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllPost = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAllPost = async () => {
      try {
        const res = await axiosInstance.get("/post/all", {
          withCredentials: true,
        });
        if (res.data.success) {
          console.log("get all posts", res.data.posts);

          dispatch(setPosts(res.data.posts));
        }
      } catch (error) {
        console.log("Error fetching all posts:", error);
      }
    };
    fetchAllPost();
  }, [dispatch]);
};

export default useGetAllPost;
