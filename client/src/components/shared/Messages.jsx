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
  //   console.log(messages);
  return (
    <div className="overflow-y-auto flex-1 p-4">
      <div className="flex justify-center">
        <div className="flex flex-col items-center justify-center">
          <Avatar className={"h-20 w-20"}>
            <AvatarImage src={selectedUser?.profilePicture} alt="profilePic" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span> {selectedUser?.username} </span>
          <Link to={`/profile/${selectedUser?._id}`}>
            <Button className={"h-8 my-2"} variant={"secondary"}>
              View Profile
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {messages &&
          messages?.map((msg) => {
            return (
              <div
                className={`flex ${
                  msg.senderId === user?._id ? "justify-end" : "justify-start"
                } `}
              >
                <div
                  className={`p-2 rounded-lg max-w-xs break-words font-sans ${
                    msg.senderId === user?._id
                      ? "bg-gray-200 text-black "
                      : " bg-blue-500 text-white"
                  }`}
                >
                  {" "}
                  {msg?.content}{" "}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
