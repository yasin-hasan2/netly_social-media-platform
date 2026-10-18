import {
  Bell,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  Compass,
  Film,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import { useState } from "react";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import NotificationDialog from "./NotificationDialog";

export default function LeftSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const { user } = useSelector((store) => store.auth);
  const {
    unreadNotificationCount = 0,
    unreadMessagesCount = 0,
  } = useSelector((store) => store.realTimeNotification);

  const dispatch = useDispatch();

  const logoutHandler = async () => {
    try {
      const res = await axiosInstance.get("/user/logout", {
        withCredentials: true,
      });

      if (res.data.success) {
        localStorage.removeItem("token");
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message || "Logged out successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Compass, label: "Explore", path: "/search" },
    { icon: Film, label: "Reels", path: "/reels" },
    { icon: MessageCircle, label: "Messages", path: "/chat", badge: unreadMessagesCount },
    { icon: Bell, label: "Notifications", action: "notifications", badge: unreadNotificationCount },
  ];

  const handleAction = (item) => {
    if (item.action === "notifications") {
      setNotificationOpen(true);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#0B0E17]/95 border-r border-white/[0.06] backdrop-blur-xl z-30 flex flex-col justify-between py-6 px-4 select-none">
      {/* Top Brand Header & Menu */}
      <div className="space-y-6">
        {/* Brand Logo & Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-1 group transition"
          aria-label="Net-ly Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-zinc-950 font-black text-lg shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform">
            N
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl text-white tracking-tight group-hover:text-amber-400 transition-colors">
              Net-ly
            </span>
            <span className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase">
              Social Network
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path && location.pathname === item.path;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleAction(item)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${
                  isActive
                    ? "bg-white/[0.08] text-white font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? "text-amber-400"
                          : "text-zinc-400 group-hover:text-zinc-200"
                      }`}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                {/* Badge indicator with tabular numerals */}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="text-[11px] font-mono tabular-nums font-bold px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 min-w-5 text-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Primary Create Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-sm shadow-sm hover:shadow-amber-400/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusSquare className="w-4 h-4 stroke-[2.2]" />
            <span>Create Post</span>
          </button>
        </div>
      </div>

      {/* Bottom User Profile Section */}
      <div className="pt-4 border-t border-white/[0.06] space-y-2">
        {user ? (
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] transition group">
            <Link
              to={`/profile/${user._id}`}
              className="flex items-center gap-3 min-w-0 flex-1"
            >
              <Avatar className="h-9 w-9 border border-white/10 group-hover:border-amber-400/50 transition">
                <AvatarImage src={user.profilePicture} alt={user.username} />
                <AvatarFallback className="bg-zinc-800 text-xs font-bold text-amber-400">
                  {user.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="truncate">
                <p className="text-xs font-semibold text-zinc-100 group-hover:text-amber-400 transition truncate">
                  {user.fullName || user.username}
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  @{user.username}
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={logoutHandler}
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="flex-1 py-2 text-center text-xs font-semibold text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] rounded-xl transition"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="flex-1 py-2 text-center text-xs font-semibold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>

      {/* Modals */}
      <NotificationDialog open={notificationOpen} setOpen={setNotificationOpen} />
      <CreatePost open={open} setOpen={setOpen} />
    </aside>
  );
}
