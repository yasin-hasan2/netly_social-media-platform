import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { useState } from "react";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";

export default function LeftSidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { user } = useSelector((store) => store.auth);
  console.log("user in sidebar", user);

  const { likeNotification } = useSelector(
    (store) => store.realTimeNotification
  );
  console.log("likeNotification in sidebar", likeNotification);

  const dispatch = useDispatch();

  const logoutHandler = async () => {
    try {
      const res = await axiosInstance.get("/user/logout", {
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log("logout error", error);
      toast.error(error.response.data.message);
    }
  };

  const sidebarItems = [
    // Define your sidebar items here
    { icon: <Home />, label: "Home" },
    { icon: <Search />, label: "Search" },
    { icon: <TrendingUp />, label: "Explore" },
    { icon: <MessageCircle />, label: "Messages" },
    { icon: <Heart />, label: "Notifications" },
    { icon: <PlusSquare />, label: "Create" },
    {
      icon: (
        <Avatar>
          <AvatarImage src={user?.profilePicture} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      label: "Profile",
    },
    { icon: <LogOut />, label: "Logout" },
  ];

  const sidebarHandler = (textType) => {
    if (textType === "Logout") {
      logoutHandler();
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Profile") {
      if (user?._id) {
        navigate(`/profile/${user?._id}`);
      } else {
        toast.error("User ID not found");
      }
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === "Messages") {
      navigate("/chat");
    }
  };

  return (
    <div className="fixed top-0 z-10 left-0  border-r border-gray-300 w-[16%] h-screen">
      <div className="flex flex-col ">
        <h1 className="my-8 pl-3 font-bold text-xl">LOGO</h1>
        <div>
          {sidebarItems.map((item, index) => {
            return (
              <div
                onClick={() => sidebarHandler(item.label)}
                key={index}
                className="flex  items-center gap-3 relative hover:bg-gray-100 cursor-pointer  p-3 my-3"
              >
                {item.icon}
                <span>{item.label}</span>
                {item.label === "Notifications" &&
                  likeNotification.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size={"icon"}
                          className={
                            "rounded-full h-5 w-5 absolute bottom-6 left-6"
                          }
                        >
                          {" "}
                          {likeNotification.length}{" "}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72">
                        <div>
                          {likeNotification.length === 0 ? (
                            <p>No new notification</p>
                          ) : (
                            likeNotification.map((notification) => {
                              return (
                                <div
                                  className="flex gap-2 items-center mb-2"
                                  key={notification.userId}
                                >
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage
                                      src={
                                        notification.userDetails?.profilePicture
                                      }
                                    />
                                    <AvatarFallback>CN</AvatarFallback>
                                  </Avatar>
                                  <p className="text-xm">
                                    {" "}
                                    <span className="font-bold">
                                      {" "}
                                      {notification.userDetails?.username}{" "}
                                    </span>{" "}
                                    {notification.type === "like"
                                      ? "liked your post"
                                      : "unliked your post"}
                                  </p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
              </div>
            );
          })}
        </div>
      </div>
      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
}
