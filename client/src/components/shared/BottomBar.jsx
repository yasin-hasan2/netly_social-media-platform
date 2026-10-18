import { useState } from "react";
import {
  Home,
  PlusSquare,
  BookOpen,
  MessageCircle,
  User,
  Settings,
  LogOut,
  MenuIcon,
  Film,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CreatePost from "./CreatePost";
import { axiosInstance } from "@/lib/axios";
import { setAuthUser } from "@/redux/authSlice";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { toast } from "sonner";

export default function BottomBar() {
  const [open, setOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { unreadMessagesCount = 0 } = useSelector((store) => store.realTimeNotification);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleHomeClick = () => {
    window.scrollTo(0, 0); // scroll top immediately
    window.location.reload(); // reload page
  };

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

  const location = useLocation();
  const isReels = location.pathname === "/reels";

  return (
    <div className="relative">
      {/* Bottom Nav */}
      <div className="flex justify-around items-center py-2 backdrop-blur-md bg-zinc-950/80 border-t border-zinc-800 shadow-lg rounded-t-2xl">
        {/* Home */}
        <Link
          to={"/"}
          onClick={handleHomeClick}
          className="p-2 text-zinc-400 hover:text-[#FACD25] transition"
        >
          <Home className={`w-6 h-6 cursor-pointer ${location.pathname === "/" ? "text-[#FACD25]" : ""}`} />
        </Link>

        {/* Reels */}
        <Link
          to={"/reels"}
          className={`p-2 transition ${isReels ? "text-[#FACD25]" : "text-zinc-400 hover:text-[#FACD25]"}`}
          title="Reels"
        >
          <Film className="w-6 h-6 cursor-pointer" />
        </Link>

        {/* Open CreatePost Dialog */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 text-zinc-400 hover:text-white transition cursor-pointer"
          title="Create Post or Reel"
        >
          <PlusSquare className="w-6 h-6 cursor-pointer" />
        </button>

        {/* Messages */}
        <Link to={"/chat"} className="p-2 text-zinc-400 hover:text-[#FACD25] transition relative">
          <MessageCircle className={`w-6 h-6 cursor-pointer ${location.pathname.startsWith("/chat") ? "text-[#FACD25]" : ""}`} />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1 right-1 text-[9px] font-black bg-[#FACE25] text-zinc-950 rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-md animate-pulse">
              {unreadMessagesCount}
            </span>
          )}
        </Link>

        {/* Profile */}
        <Link to={`/profile/${user?._id}`} className="p-2 text-zinc-400 hover:text-[#FACD25] transition">
          <User className={`w-6 h-6 cursor-pointer ${location.pathname.startsWith("/profile") ? "text-[#FACD25]" : ""}`} />
        </Link>

        <button
          type="button"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="p-2 text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <MenuIcon className="w-6 h-6 cursor-pointer" />
        </button>
      </div>

      {/* Profile popup */}
      <AnimatePresence>
        {showProfileMenu && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-14 right-4 flex flex-col gap-3 p-3 rounded-xl backdrop-blur-lg bg-white/40 shadow-xl"
          >
            <BookOpen className="w-6 h-6 cursor-pointer" />
            <Settings className="w-6 h-6 cursor-pointer" />
            <LogOut
              onClick={logoutHandler}
              className="w-6 h-6 cursor-pointer text-red-500"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Post Dialog */}
      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
}
