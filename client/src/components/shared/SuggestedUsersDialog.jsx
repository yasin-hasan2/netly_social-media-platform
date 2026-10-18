import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useSelector } from "react-redux";
import useFollowHandler from "@/hooks/useFollowHandler";
import BlueTagBadge from "./BlueTagBadge";

export default function SuggestedUsersDialog({ open, onOpenChange, users }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-zinc-900 border border-white/20 text-white rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold">
            Suggested Creators
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto space-y-3 mt-4 pr-1 scrollbar-thin scrollbar-thumb-white/20">
          {(!users || users.length === 0) ? (
            <div className="text-center text-gray-400 py-6 text-sm">
              No suggestions available right now.
            </div>
          ) : (
            users.map((user) => (
              <SuggestedUserRow key={user._id} user={user} onDone={() => onOpenChange(false)} />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SuggestedUserRow({ user, onDone }) {
  const { user: currentUser } = useSelector((store) => store.auth);
  const { following, followHandler, loading } = useFollowHandler(user._id);
  const isMe = currentUser?._id === user._id;

  return (
    <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition">
      <div className="flex items-center gap-3">
        <Link to={`/profile/${user?._id}`} onClick={onDone}>
          <Avatar className="h-10 w-10 border border-white/20">
            <AvatarImage src={user?.profilePicture} alt={user?.username} />
            <AvatarFallback>{user?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <h1 className="font-semibold text-sm hover:underline flex items-center gap-1.5">
            <Link to={`/profile/${user?._id}`} onClick={onDone}>
              {user?.username}
            </Link>
            {Boolean(user?.isBlueTag) && <BlueTagBadge size="xs" />}
          </h1>
          <span className="text-gray-400 text-xs line-clamp-1 max-w-[200px]">
            {user?.bio || user?.fullName || "Net-ly Creator"}
          </span>
        </div>
      </div>

      {!isMe && (
        <button
          disabled={loading}
          onClick={followHandler}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
            following
              ? "text-gray-400 hover:text-white bg-white/10 hover:bg-white/15"
              : "text-black bg-[#FACE25] hover:bg-[#d5be6b]"
          }`}
        >
          {loading ? "..." : following ? "Following" : "Follow"}
        </button>
      )}
    </div>
  );
}
