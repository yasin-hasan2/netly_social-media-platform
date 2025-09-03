import Messages from "@/components/shared/Messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios";
import { setMessages, setSelectedUser } from "@/redux/chatSlice";
import { MessageCircleCode } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function ChatPage() {
  const [textMessage, setTextMessage] = useState("");
  const { user, suggestedUsers } = useSelector((state) => state.auth);
  const { selectedUser, onlineUsers, messages } = useSelector(
    (state) => state.chat
  );
  const dispatch = useDispatch();

  const sendMessageHandler = async (receiverId) => {
    if (!textMessage.trim()) return;
    try {
      const res = await axiosInstance.post(
        `/message/send/${receiverId}`,
        { textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));
        setTextMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen ">
      {/* Users List */}
      <section className="w-full md:w-1/4 my-4 md:my-8  md:mx-4 flex flex-col bg-white/10 backdrop-blur-xs rounded-2xl p-3 shadow-lg">
        <h1 className="font-bold mb-4 text-xl text-white px-2">
          {user?.username}
        </h1>
        <hr className="mb-4 border-gray-300/50" />
        <div className="flex-1 overflow-y-auto">
          {suggestedUsers.map((suggestedUser) => {
            const isOnline = onlineUsers.includes(suggestedUser?._id);
            return (
              <div
                key={suggestedUser._id}
                onClick={() => dispatch(setSelectedUser(suggestedUser))}
                className="flex gap-3 items-center p-3 mb-2 rounded-xl hover:bg-white/20 cursor-pointer transition"
              >
                <div className="relative">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={suggestedUser?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-gray-900 ${
                      isOnline ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-white">
                    {suggestedUser?.username}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      isOnline ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {isOnline ? "online" : "offline"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Chat Window */}
      {selectedUser ? (
        <section className="flex-1 flex flex-col mx-2 md:mx-4 my-4 md:my-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-lg">
          {/* Header */}
          <div className="flex gap-3 items-center px-4 py-3 border-b border-gray-300/30 sticky top-0 bg-white/20 backdrop-blur-md z-10 rounded-t-2xl">
            <Avatar>
              <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-white">
              <span className="font-semibold">{selectedUser?.username}</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <Messages selectedUser={selectedUser} />
          </div>

          {/* Input */}
          <div className="flex items-center p-4 border-t border-gray-300/30 bg-white/10 backdrop-blur-md rounded-b-2xl">
            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              type="text"
              className="flex-1 mr-2 focus-visible:ring-transparent bg-white/20 text-white placeholder-gray-200 border-none rounded-xl"
              placeholder="Type a message..."
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessageHandler(selectedUser._id)
              }
            />
            <Button
              onClick={() => sendMessageHandler(selectedUser._id)}
              className="bg-[#FACE25]/20 text-[#FACE25] hover:bg-[#FACE25]/10 "
            >
              Send
            </Button>
          </div>
        </section>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-white mx-4 my-8">
          <MessageCircleCode className="w-32 h-32 my-4 text-white/70" />
          <h1 className="font-medium text-xl">Your messages</h1>
          <span className="text-gray-300">Send a message to start a chat.</span>
        </div>
      )}
    </div>
  );
}
