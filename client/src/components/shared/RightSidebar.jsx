import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSelector } from "react-redux";
import SuggestedUsers from "./SuggestedUsers";
import Footer from "./Footer";
import BlueTagBadge from "./BlueTagBadge";

export default function RightSidebar() {
  const { user } = useSelector((store) => store.auth);

  return (
    <div className="space-y-5">
      {/* User profile card */}
      {user && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#111726]/60 border border-white/[0.06] backdrop-blur-md shadow-sm">
          <Link
            to={`/profile/${user?._id}`}
            className="flex items-center gap-3.5 min-w-0 flex-1 group"
          >
            <Avatar className="h-11 w-11 border border-white/10 group-hover:border-amber-400/50 transition">
              <AvatarImage src={user?.profilePicture} alt={user?.username} />
              <AvatarFallback className="bg-zinc-800 text-sm font-bold text-amber-400">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="truncate">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-amber-400 transition truncate">
                  {user?.fullName || user?.username}
                </h3>
                {Boolean(user?.isBlueTag) && <BlueTagBadge size="xs" />}
              </div>
              <p className="text-xs text-zinc-400 truncate">
                @{user?.username}
              </p>
            </div>
          </Link>

          <Link
            to={`/profile/${user?._id}`}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition px-2 py-1"
          >
            View
          </Link>
        </div>
      )}

      {/* Suggested Users Card */}
      <div className="p-4 rounded-2xl bg-[#111726]/60 border border-white/[0.06] backdrop-blur-md shadow-sm">
        <SuggestedUsers />
      </div>

      {/* Footer info */}
      <div className="px-2">
        <Footer />
      </div>
    </div>
  );
}
