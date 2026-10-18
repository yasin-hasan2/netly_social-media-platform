import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import SuggestedUsersDialog from "./SuggestedUsersDialog";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { toggleFollow } from "@/redux/authSlice";
import BlueTagBadge from "./BlueTagBadge";

const SuggestedUsers = () => {
  const { suggestedUsers, user: currentUser } = useSelector((store) => store.auth);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const [loadingMap, setLoadingMap] = useState({});

  const list = suggestedUsers || [];

  const handleFollowClick = async (targetUserId) => {
    if (!currentUser) {
      toast.error("Please login to follow creators");
      return;
    }
    setLoadingMap((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      const res = await axiosInstance.post(
        `/user/followorunfollow/${targetUserId}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        dispatch(toggleFollow(targetUserId));
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update follow status");
    } finally {
      setLoadingMap((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  return (
    <div>
      {/* Header with See All button */}
      <div className="flex items-center justify-between text-xs mb-3 px-1">
        <h2 className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">
          Suggested for you
        </h2>
        {list.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="font-medium cursor-pointer text-amber-400 hover:text-amber-300 text-xs transition"
          >
            See all
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <p className="text-xs text-zinc-500 italic py-2 px-1">No suggestions right now</p>
      ) : (
        <div className="space-y-1">
          {list.slice(0, 5).map((u) => {
            const isFollowing = (currentUser?.following || []).some(
              (id) => (id?._id || id).toString() === u._id?.toString()
            );
            const isLoading = loadingMap[u._id];

            return (
              <div
                key={u._id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Link to={`/profile/${u?._id}`} className="flex-shrink-0">
                    <Avatar className="h-9 w-9 border border-white/10 group-hover:border-amber-400/50 transition">
                      <AvatarImage src={u?.profilePicture} alt={u?.username} />
                      <AvatarFallback className="bg-zinc-800 text-amber-400 text-xs font-bold">
                        {u?.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1 min-w-0">
                      <Link
                        to={`/profile/${u?._id}`}
                        className="font-medium text-xs text-zinc-200 group-hover:text-amber-400 transition truncate"
                      >
                        {u?.username}
                      </Link>
                      {Boolean(u?.isBlueTag) && <BlueTagBadge size="xs" />}
                    </div>
                    <span className="text-zinc-500 text-[11px] truncate max-w-[130px]">
                      {u?.fullName || u?.bio || "Creator"}
                    </span>
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  onClick={() => handleFollowClick(u._id)}
                  className={`text-xs font-semibold px-3 py-1 rounded-xl transition cursor-pointer flex-shrink-0 ${
                    isFollowing
                      ? "text-zinc-400 hover:text-zinc-200 bg-white/[0.06] hover:bg-white/[0.1]"
                      : "text-zinc-950 bg-amber-400 hover:bg-amber-300 shadow-sm"
                  }`}
                >
                  {isLoading ? "..." : isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog Component */}
      <SuggestedUsersDialog
        open={open}
        onOpenChange={setOpen}
        users={list}
        onFollowToggle={handleFollowClick}
      />
    </div>
  );
};

export default SuggestedUsers;
