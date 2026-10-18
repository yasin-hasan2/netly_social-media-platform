import { axiosInstance } from "@/lib/axios";
import { setPosts } from "@/redux/postSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllPost = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  useEffect(() => {
    const fetchAllPost = async () => {
      try {
        const res = await axiosInstance.get("/post/all", {
          withCredentials: true,
        });
        if (res.data?.success && res.data.posts) {
          dispatch(setPosts(res.data.posts));
        }
      } catch (error) {
        console.log("Error fetching all posts:", error);
      }
    };
    fetchAllPost();
  }, [dispatch, user?._id]);
};

export default useGetAllPost;
