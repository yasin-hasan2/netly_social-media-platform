import { axiosInstance } from "@/lib/axios";
import { setMessages } from "@/redux/chatSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllMessage = () => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.chat);

  useEffect(() => {
    if (!selectedUser?._id) return;
    const fetchAllMessage = async () => {
      try {
        const res = await axiosInstance.get(
          `/message/all/${selectedUser._id}`,
          { withCredentials: true }
        );
        if (res.data?.success && res.data.messages) {
          dispatch(setMessages(res.data.messages));
        }
      } catch (error) {
        console.log("error from useGetAllMessage hook", error);
      }
    };
    fetchAllMessage();
  }, [selectedUser?._id, dispatch]);
};
export default useGetAllMessage;
