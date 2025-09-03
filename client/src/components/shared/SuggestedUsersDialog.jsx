import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export default function SuggestedUsersDialog({ open, onOpenChange, users }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-black/90 backdrop-blur-lg text-white rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            Suggested Users
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto space-y-3 p-2">
          {users.map((user) => (
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
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
