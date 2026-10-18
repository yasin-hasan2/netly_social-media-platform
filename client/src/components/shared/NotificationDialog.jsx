import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import {
  X,
  Heart,
  MessageCircle,
  AtSign,
  Repeat,
  Bell,
  CheckCheck,
  Trash2,
  Film,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  markAllNotificationsRead,
  markNotificationRead,
  clearNotifications,
} from "@/redux/rtnSlice";
import { setSelectedPost } from "@/redux/postSlice";
import { axiosInstance } from "@/lib/axios";
import { formatTimeAgo } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";

export default function NotificationDialog({ open, setOpen }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // 'all' | 'likes' | 'comments' | 'mentions'

  const { notifications = [], unreadNotificationCount = 0 } = useSelector(
    (store) => store.realTimeNotification
  );

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      dispatch(markAllNotificationsRead());
      await axiosInstance.put("/notification/mark-all-read", {}, { withCredentials: true });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    try {
      dispatch(clearNotifications());
      await axiosInstance.delete("/notification/clear", { withCredentials: true });
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  // Handle clicking a notification
  const handleNotificationClick = async (notif) => {
    const notifId = notif._id || notif.id;
    if (notifId && !notif.read) {
      dispatch(markNotificationRead(notifId));
      try {
        await axiosInstance.put(`/notification/${notifId}/read`, {}, { withCredentials: true });
      } catch {
        // Ignored
      }
    }

    setOpen(false);

    // If it has a post, view the post
    if (notif.postId || notif.post?._id) {
      const pId = notif.postId || notif.post?._id;
      // If full post object is available, select it
      if (notif.post && typeof notif.post === "object") {
        dispatch(setSelectedPost(notif.post));
      }
    } else if (notif.sender?._id || notif.userId) {
      const uid = notif.sender?._id || notif.userId;
      navigate(`/profile/${uid}`);
    }
  };

  // Filter notifications
  const filteredList = useMemo(() => {
    if (!Array.isArray(notifications)) return [];
    if (filter === "all") return notifications;
    if (filter === "likes") return notifications.filter((n) => n.type === "like");
    if (filter === "comments") return notifications.filter((n) => n.type === "comment");
    if (filter === "mentions") return notifications.filter((n) => n.type === "mention");
    return notifications;
  }, [notifications, filter]);

  const renderIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />;
      case "comment":
        return <MessageCircle className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />;
      case "mention":
        return <AtSign className="w-3.5 h-3.5 text-[#FACE25]" />;
      case "repost":
        return <Repeat className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-[#FACE25]" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-2xl shadow-2xl w-[95%] max-w-lg p-0 overflow-hidden backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#FACE25]/15 text-[#FACE25]">
              <Bell className="w-4 h-4" />
            </div>
            <DialogTitle className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Notifications</span>
              {unreadNotificationCount > 0 && (
                <span className="text-[10px] font-extrabold bg-[#FACE25] text-zinc-950 px-2 py-0.5 rounded-full">
                  {unreadNotificationCount} new
                </span>
              )}
            </DialogTitle>
          </div>

          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllRead}
                  className="h-7 px-2 text-[11px] text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5 mr-1 text-[#FACE25]" />
                  <span className="hidden sm:inline">Mark read</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-7 px-2 text-[11px] text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                  title="Clear all"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              </>
            )}

            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-2 bg-zinc-900/40 border-b border-zinc-800/60 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              filter === "all"
                ? "bg-zinc-800 text-[#FACE25] shadow-sm font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            All ({notifications.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter("likes")}
            className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
              filter === "likes"
                ? "bg-zinc-800 text-[#FACE25] shadow-sm font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Heart className="w-3 h-3 text-rose-400" />
            <span>Likes</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("comments")}
            className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
              filter === "comments"
                ? "bg-zinc-800 text-[#FACE25] shadow-sm font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <MessageCircle className="w-3 h-3 text-sky-400" />
            <span>Comments</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("mentions")}
            className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
              filter === "mentions"
                ? "bg-zinc-800 text-[#FACE25] shadow-sm font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <AtSign className="w-3 h-3 text-[#FACE25]" />
            <span>Mentions</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-zinc-900">
          {filteredList.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#FACE25]">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-zinc-300">
                No notifications in this filter
              </p>
              <p className="text-[11px] text-zinc-500">
                When people like, comment, or mention you, updates will appear in real time here!
              </p>
            </div>
          ) : (
            filteredList.map((item, idx) => {
              const sender = item.sender || item.userDetails || {};
              const senderName = sender.username || "Someone";
              const timeString = item.createdAt
                ? formatTimeAgo(item.createdAt)
                : item.time || "recently";

              return (
                <div
                  key={item._id || item.id || idx}
                  onClick={() => handleNotificationClick(item)}
                  className={`flex items-start gap-3 p-3.5 hover:bg-zinc-900/70 transition cursor-pointer group ${
                    !item.read ? "bg-amber-500/[0.04]" : ""
                  }`}
                >
                  {/* Sender Avatar with action badge */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10 border border-zinc-700">
                      <AvatarImage src={sender.profilePicture} />
                      <AvatarFallback className="bg-zinc-800 text-xs font-bold text-[#FACE25]">
                        {senderName[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-zinc-950 border border-zinc-800 shadow-sm">
                      {renderIcon(item.type)}
                    </div>
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-200 leading-snug">
                      <strong className="text-white font-bold group-hover:text-[#FACE25] transition">
                        @{senderName}
                      </strong>{" "}
                      {item.type === "like" ? (
                        <span>liked your post.</span>
                      ) : item.type === "comment" ? (
                        <span>
                          commented:{" "}
                          <em className="text-zinc-300 not-italic font-medium">
                            "{item.content || item.text || "Nice post!"}"
                          </em>
                        </span>
                      ) : item.type === "mention" ? (
                        <span>
                          mentioned you:{" "}
                          <em className="text-zinc-300 not-italic font-medium">
                            "{item.content || ""}"
                          </em>
                        </span>
                      ) : item.type === "repost" ? (
                        <span>reposted your post to their feed.</span>
                      ) : (
                        <span>{item.message || "interacted with you."}</span>
                      )}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {timeString}
                      </span>
                      {!item.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FACE25]" />
                      )}
                    </div>
                  </div>

                  {/* Post thumbnail preview if available */}
                  {(item.post?.image || item.post?.video) && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 flex-shrink-0">
                      {item.post.image ? (
                        <img
                          src={item.post.image}
                          alt="Post preview"
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black text-[#FACE25]">
                          <Film className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
