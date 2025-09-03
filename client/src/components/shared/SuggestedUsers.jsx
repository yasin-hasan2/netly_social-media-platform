import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSelector } from "react-redux";
import { useState } from "react";
import SuggestedUsersDialog from "./SuggestedUsersDialog";

const SuggestedUsers = () => {
  const { suggestedUsers } = useSelector((store) => store.auth);
  const [open, setOpen] = useState(false);

  return (
    <div className="my-10">
      {/* Header with See All button */}
      <div className="flex items-center justify-between text-sm">
        <h1 className="font-semibold text-gray-600">Suggested for you</h1>
        <span
          onClick={() => setOpen(true)}
          className="font-medium cursor-pointer text-[#3BADF8] hover:underline"
        >
          See All
        </span>
      </div>

      {/* Show only first 5 users here */}
      {suggestedUsers.slice(0, 2).map((user) => {
        return (
          <div
            key={user._id}
            className="flex items-center justify-between my-5"
          >
            <div className="flex items-center gap-2">
              <Link to={`/profile/${user?._id}`}>
                <Avatar>
                  <AvatarImage src={user?.profilePicture} alt="post_image" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <h1 className="font-semibold text-sm">
                  <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
                </h1>

                <span className="text-gray-600 text-sm">
                  {user?.bio && user?.bio.split(" ").length > 4 ? (
                    <>
                      {user.bio.split(" ").slice(0, 4).join(" ")}...{" "}
                      <Link
                        to={`/profile/${user._id}`}
                        className="text-[#3BADF8] hover:underline ml-1 text-[6px] font-sans"
                      >
                        See more
                      </Link>
                    </>
                  ) : (
                    user?.bio || "Bio here..."
                  )}
                </span>
              </div>
            </div>
            <span className="text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]">
              Follow
            </span>
          </div>
        );
      })}

      {/* Dialog Component */}
      <SuggestedUsersDialog
        open={open}
        onOpenChange={setOpen}
        users={suggestedUsers}
      />
    </div>
  );
};

export default SuggestedUsers;
