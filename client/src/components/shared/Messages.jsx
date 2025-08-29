import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import useGetAllMessage from "@/hooks/useGetAllMessage";
import useGetRTM from "@/hooks/useGetRTM";

export default function Messages({ selectedUser }) {
  useGetRTM();
  useGetAllMessage();

  const { messages } = useSelector((store) => store.chat);
  const { user } = useSelector((store) => store.auth);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* User Header */}
      <div className="flex items-center gap-3 p-2 border-b border-gray-300 bg-white/10 backdrop-blur-xs rounded-t-xl shadow-md sticky top-0 z-10">
        <Avatar className="h-10 w-10">
          <AvatarImage src={selectedUser?.profilePicture} alt="profilePic" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex flex-col">
          <span className="text-white font-semibold text-sm">
            {selectedUser?.username}
          </span>
          <Link
            to={`/profile/${selectedUser?._id}`}
            className="text-xs text-gray-300 hover:underline"
          >
            View Profile
          </Link>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-white/5 backdrop-blur-xs rounded-b-xl">
        {messages &&
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${
                msg.senderId === user?._id ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-2 sm:p-3 rounded-2xl max-w-[75%] break-words font-sans shadow-md transition-all duration-200 ${
                  msg.senderId === user?._id
                    ? "bg-white/20 text-black hover:bg-white/30"
                    : "bg-[#FACE25]/20 text-[#FACE25] hover:bg-[#FACE25]/10"
                }`}
              >
                {msg?.content}
              </div>
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input placeholder for spacing */}
      <div className="p-2 sm:p-4 bg-transparent" />
    </div>
  );
}
