import { axiosInstance } from "@/lib/axios";
import { setMessages } from "@/redux/chatSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAllMessage = () => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.chat);
  //   console.log("selectedUser:", selectedUser?._id);

  useEffect(() => {
    const fetchAllMessage = async () => {
      try {
        const res = await axiosInstance.get(
          `/message/all/${selectedUser?._id}`,
          { withCredentials: true }
        );
        // console.log(res.data);
        if (res.data.success) {
          dispatch(setMessages(res.data.messages));
          //   console.log("All messages fetched successfully:", res.data.messages);
        }
      } catch (error) {
        console.log("error from useGetAllMessage hook", error);
      }
    };
    fetchAllMessage();
  }, [selectedUser]);
};
export default useGetAllMessage;
