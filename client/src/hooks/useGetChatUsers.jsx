import { axiosInstance } from "@/lib/axios";
import { setChatContacts, setLoadingContacts } from "@/redux/chatSlice";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetChatUsers = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const fetchChatUsers = useCallback(async () => {
    if (!user?._id) return;
    dispatch(setLoadingContacts(true));
    try {
      const res = await axiosInstance.get("/message/chat-users", {
        withCredentials: true,
      });
      if (res.data?.success && res.data.users) {
        dispatch(setChatContacts(res.data.users));
      }
    } catch (error) {
      console.error("Error fetching chat users:", error);
    } finally {
      dispatch(setLoadingContacts(false));
    }
  }, [user?._id, dispatch]);

  useEffect(() => {
    fetchChatUsers();
  }, [fetchChatUsers]);

  return { refreshContacts: fetchChatUsers };
};

export default useGetChatUsers;
