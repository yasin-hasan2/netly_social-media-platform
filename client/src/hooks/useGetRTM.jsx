import {
  setMessages,
  updateContactLastMessage,
  deleteMessageAction,
  updateMessageReaction,
  setUserTyping,
} from "@/redux/chatSlice";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetRTM = () => {
  const dispatch = useDispatch();
  const { socket } = useSelector((store) => store.socketIo);
  const { messages, selectedUser } = useSelector((store) => store.chat);
  const { user } = useSelector((store) => store.auth);
  const typingTimeoutsRef = useRef({});

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      // If message is for the currently selected chat
      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id ||
          newMessage.receiverId === selectedUser._id)
      ) {
        dispatch(setMessages([...(messages || []), newMessage]));
      }

      // Automatically clear typing state when message is received
      if (newMessage.senderId) {
        if (typingTimeoutsRef.current[newMessage.senderId]) {
          clearTimeout(typingTimeoutsRef.current[newMessage.senderId]);
          delete typingTimeoutsRef.current[newMessage.senderId];
        }
        dispatch(setUserTyping({ userId: newMessage.senderId, isTyping: false }));
      }

      // Update last message in inbox contact list
      const partnerId =
        newMessage.senderId === user?._id
          ? newMessage.receiverId
          : newMessage.senderId;
      dispatch(updateContactLastMessage({ partnerId, message: newMessage }));
    };

    const handleMessageDeleted = ({ messageId }) => {
      if (messageId) {
        dispatch(deleteMessageAction(messageId));
      }
    };

    const handleMessageReacted = ({ messageId, reactions }) => {
      if (messageId) {
        dispatch(updateMessageReaction({ messageId, reactions }));
      }
    };

    const handleUserTyping = ({ senderId }) => {
      if (!senderId) return;
      // Mark as typing
      dispatch(setUserTyping({ userId: senderId, isTyping: true }));

      // Reset safety timeout (auto-clear if sender abruptly disconnects)
      if (typingTimeoutsRef.current[senderId]) {
        clearTimeout(typingTimeoutsRef.current[senderId]);
      }
      typingTimeoutsRef.current[senderId] = setTimeout(() => {
        dispatch(setUserTyping({ userId: senderId, isTyping: false }));
        delete typingTimeoutsRef.current[senderId];
      }, 4000);
    };

    const handleUserStoppedTyping = ({ senderId }) => {
      if (!senderId) return;
      if (typingTimeoutsRef.current[senderId]) {
        clearTimeout(typingTimeoutsRef.current[senderId]);
        delete typingTimeoutsRef.current[senderId];
      }
      dispatch(setUserTyping({ userId: senderId, isTyping: false }));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messageReacted", handleMessageReacted);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messageReacted", handleMessageReacted);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);

      // Clear any pending typing timeouts on unmount
      Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
      typingTimeoutsRef.current = {};
    };
  }, [socket, messages, selectedUser, user?._id, dispatch]);
};

export default useGetRTM;
