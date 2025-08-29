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
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { useState } from "react";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import logo from "../../../public/vite.png";

export default function LeftSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const { user } = useSelector((store) => store.auth);
  const { likeNotification } = useSelector(
    (store) => store.realTimeNotification
  );

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
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  const sidebarItems = [
    { icon: <Home />, label: "Home", path: "/" },
    { icon: <Search />, label: "Search" },
    { icon: <TrendingUp />, label: "Explore" },
    { icon: <MessageCircle />, label: "Messages", path: "/chat" },
    { icon: <Heart />, label: "Notifications" },
    { icon: <PlusSquare />, label: "Create" },
    {
      icon: (
        <Avatar className="w-7 h-7">
          <AvatarImage src={user?.profilePicture} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      label: "Profile",
    },
    { icon: <LogOut />, label: "Logout" },
  ];

  const sidebarHandler = (textType, path) => {
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
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-[16%] border-r border-white/20  shadow-xl z-20 flex flex-col">
      {/* Logo */}
      <div className="p-6 flex justify-center">
        <img
          src={logo}
          alt="Logo"
          className="w-12 h-12 rounded-full cursor-pointer hover:scale-105 transition"
          onClick={() => navigate("/")}
        />
      </div>

      {/* Menu Items */}
      <div className="flex-1 flex flex-col mt-4 space-y-2">
        {sidebarItems.map((item, index) => {
          const isActive = item.path && location.pathname === item.path;
          return (
            <div
              key={index}
              onClick={() => sidebarHandler(item.label, item.path)}
              className={`flex items-center gap-4 px-6 py-3 cursor-pointer rounded-xl mx-3 transition-all
                ${
                  isActive
                    ? "bg-[#FACE25]/20 text-[#FACE25] shadow-sm"
                    : "hover:bg-[#FACE25]/10 hover:text-[#FACE25]"
                }`}
            >
              <div className="relative">
                {item.icon}
                {item.label === "Notifications" &&
                  likeNotification.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size={"icon"}
                          className="rounded-full h-5 w-5 absolute -top-2 -right-2 bg-red-500 text-white text-xs"
                        >
                          {likeNotification.length}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72">
                        <div>
                          {likeNotification.map((notification) => (
                            <div
                              className="flex gap-2 items-center mb-2"
                              key={notification.userId}
                            >
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={notification.userDetails?.profilePicture}
                                />
                                <AvatarFallback>CN</AvatarFallback>
                              </Avatar>
                              <p className="text-sm">
                                <span className="font-bold">
                                  {notification.userDetails?.username}
                                </span>{" "}
                                {notification.type === "like"
                                  ? "liked your post"
                                  : "unliked your post"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
              </div>
              <span className="font-medium">{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Create Post Modal */}
      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
}
