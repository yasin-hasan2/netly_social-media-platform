import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatTimeAgo } from "@/lib/utils";
import { Link } from "react-router-dom";
import BlueTagBadge from "./BlueTagBadge";

const Comment = ({ comment }) => {
  const author = comment?.author || comment?.user;
  const username = author?.username || "User";
  const profilePicture = author?.profilePicture || "";
  const timeString = formatTimeAgo(comment?.createdAt);

  return (
    <div className="flex items-start gap-3 py-2 text-zinc-200">
      <Link to={author?._id ? `/profile/${author._id}` : "#"}>
        <Avatar className="w-8 h-8 border border-zinc-800 flex-shrink-0">
          <AvatarImage src={profilePicture} alt={username} />
          <AvatarFallback className="bg-zinc-800 text-[#FACE25] font-semibold text-xs">
            {username[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Link
            to={author?._id ? `/profile/${author._id}` : "#"}
            className="font-semibold text-xs text-zinc-100 hover:text-[#FACE25] transition"
          >
            {username}
          </Link>
          {Boolean(author?.isBlueTag) && (
            <BlueTagBadge size="xs" />
          )}
          {timeString && (
            <span className="text-[11px] text-zinc-500">{timeString}</span>
          )}
        </div>
        <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed break-words">
          {comment?.text}
        </p>
      </div>
    </div>
  );
};

export default Comment;
