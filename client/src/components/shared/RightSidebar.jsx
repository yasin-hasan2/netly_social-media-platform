import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSelector } from "react-redux";
import SuggestedUsers from "./SuggestedUsers";

export default function RightSidebar() {
  const { user } = useSelector((store) => store.auth);

  return (
    <div className="hidden lg:block w-80 ml-8 mt-10">
      {/* Glassy user card */}
      <div className="flex items-center gap-4 p-4 rounded-2xl backdrop-blur-lg bg-white/10 shadow-lg mb-6">
        <Link to={`/profile/${user?._id}`}>
          <Avatar className="w-12 h-12">
            <AvatarImage src={user?.profilePicture} alt="Profile" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-col">
          <h1 className="font-semibold text-sm text-white hover:text-[#FACE25] transition">
            <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
          </h1>
          <span className="text-gray-300 text-xs">
            {user?.bio || "Bio here..."}
          </span>
        </div>
      </div>

      {/* Suggested Users */}
      <div className="p-4 rounded-2xl backdrop-blur-lg bg-white/10 shadow-lg">
        <h2 className="text-gray-300 font-semibold mb-3">Suggested Users</h2>
        <SuggestedUsers />
      </div>
    </div>
  );
}
