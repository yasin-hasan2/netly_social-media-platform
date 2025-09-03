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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
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

  return (
    <div className="relative">
      {/* Bottom Nav */}
      <div className="flex justify-around items-center py-2 backdrop-blur-md bg-white/30 shadow-lg rounded-t-2xl">
        {/* Open CreatePost Dialog */}
        <PlusSquare
          className="w-6 h-6 cursor-pointer"
          onClick={() => setOpen(true)}
        />

        <Link to={`/profile/${user?._id}`}>
          <User className="w-6 h-6 cursor-pointer" />
        </Link>

        {/* Bigger Home */}
        <button onClick={handleHomeClick}>
          <Link to={"/"}>
            <Home className="w-10 h-10 cursor-pointer text-[#FACD25]" />
          </Link>
        </button>

        <Link to={"/chat"}>
          <MessageCircle className="w-6 h-6 cursor-pointer" />
        </Link>

        <MenuIcon
          className="w-6 h-6 cursor-pointer"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        />
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
