import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { AtSign, Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Profile() {
  const params = useParams();
  const userId = params.id;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useGetUserProfile(userId);

  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false); // toggle for demo

  const { userProfile, user } = useSelector((store) => store.auth);

  const isLoggedInUserProfile = user?._id === userProfile?._id;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Determine displayed content based on active tab
  let displayedContent = [];
  switch (activeTab) {
    case "posts":
      displayedContent = userProfile?.posts || [];
      break;
    case "saved":
      displayedContent = userProfile?.bookmarks || [];
      break;
    case "reels":
      displayedContent = userProfile?.reels || [];
      break;
    case "tags":
      displayedContent = userProfile?.tags || [];
      break;
    default:
      displayedContent = [];
  }

  const displayedPost =
    activeTab === "posts" ? userProfile?.posts : userProfile?.bookmarks;

  // Dummy follow/unfollow handler
  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? "Unfollowed" : "Followed");
  };

  // Navigate to message page
  const handleMessage = () => {
    navigate(`/chat/${userProfile?._id}`);
  };

  // Convert to Masonry format
  // const masonryItems = displayedContent.map((item) => ({
  //   id: item._id,
  //   img: item.image,
  //   height: 300,
  //   url: `/post/${item._id}`,
  // }));

  return (
    <div className="flex justify-center mt-8 px-4 lg:px-0 ">
      <div className="flex flex-col gap-12 max-w-5xl w-full">
        {/* Profile Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          {/* Avatar */}
          <section className="flex justify-center">
            <Avatar className="h-36 w-36 border-4 border-[#FACE25] rounded-full">
              <AvatarImage
                src={userProfile?.profilePicture}
                alt="Profile Photo"
                className="object-cover h-36 w-36 rounded-full"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>

          {/* User Info */}
          <section>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-white">
                  {userProfile?.username}
                </h1>

                {/* Action Buttons */}
                {isLoggedInUserProfile ? (
                  <div className="flex gap-2 flex-wrap">
                    <Link to={`/account/edit`}>
                      <Button
                        variant="secondary"
                        className="h-9 hover:bg-gray-200 transition"
                      >
                        Edit Profile
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      className="h-9 hover:bg-gray-200"
                    >
                      View Archive
                    </Button>
                    <Button
                      variant="secondary"
                      className="h-9 hover:bg-gray-200"
                    >
                      Ad Tools
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleFollow}
                      className={`h-9 ${
                        isFollowing
                          ? "bg-gray-600 hover:bg-gray-500"
                          : "bg-[#FACE25] hover:bg-[#d5be6b]"
                      }`}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                    <Button
                      onClick={handleMessage}
                      className="h-9 bg-white/20 hover:bg-white/30"
                    >
                      Message
                    </Button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-gray-300">
                <p>
                  <span className="font-semibold text-white">
                    {userProfile?.posts.length}
                  </span>{" "}
                  posts
                </p>
                <p>
                  <span className="font-semibold text-white">
                    {userProfile?.followers.length}
                  </span>{" "}
                  followers
                </p>
                <p>
                  <span className="font-semibold text-white">
                    {userProfile?.following.length}
                  </span>{" "}
                  following
                </p>
              </div>

              {/* Bio & Info */}
              <div className="flex flex-col gap-2 text-gray-300">
                <span className="text-white font-semibold">
                  {userProfile?.bio || "Bio here ..."}
                </span>
                <Badge className="w-fit bg-white/10 text-white">
                  <AtSign /> {userProfile?.username}
                </Badge>
                <span className="flex items-center gap-2">
                  <FaEnvelope /> {userProfile?.email}
                </span>
                <span>
                  {userProfile?.gender === "male" ? "He/Him" : "She/Her"}
                </span>
                <span>{userProfile?.relationshipStatus}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Tabs */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-center gap-10 border-b border-gray-600 text-gray-300">
            {["posts", "saved", "reels", "tags"].map((tab) => (
              <span
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-3 cursor-pointer uppercase tracking-wider font-semibold transition-colors ${
                  activeTab === tab
                    ? "text-[#FACE25] border-b-2 border-[#FACE25]"
                    : "hover:text-white"
                }`}
              >
                {tab}
              </span>
            ))}
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {displayedPost?.map((post) => (
              <div
                key={post?._id}
                className="relative group overflow-hidden rounded-lg"
              >
                <img
                  src={post?.image}
                  alt="Post Image"
                  className="w-full aspect-square object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-4 text-white text-sm pointer-events-auto">
                    <button className="flex items-center gap-1 hover:text-[#FACE25]">
                      <Heart /> {post?.likes.length}
                    </button>
                    <button className="flex items-center gap-1 hover:text-[#FACE25]">
                      <MessageCircle /> {post?.comments.length}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
