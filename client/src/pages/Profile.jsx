import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { AtSign, Heart, MessageCircle } from "lucide-react";

import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

export default function Profile() {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  // console.log("userId from params", userId);

  const [activeTab, setActiveTab] = useState("posts");

  const { userProfile, user } = useSelector((store) => store.auth);
  console.log("userProfile", userProfile);

  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const isFollowing = false;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const displayedPost =
    activeTab === "posts" ? userProfile?.posts : userProfile?.bookmarks;

  return (
    <div className="flex max-w-5xl justify-center mx-auto pl-10 mt-5">
      <div className="flex flex-col gap-28 p-8">
        <div className="grid grid-cols-2">
          <section className="flex items-center justify-center">
            <Avatar className={"h-32 w-32 border-amber-400 border-2"}>
              <AvatarImage
                src={userProfile?.profilePicture}
                alt="profilePhoto"
                className={"  object-cover h-32 w-32 "}
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <span> {userProfile?.username} </span>
                {isLoggedInUserProfile ? (
                  <div className="space-x-2">
                    <Link to={`/account/edit`}>
                      <Button
                        variant={"secondary"}
                        className={"hover:bg-gray-200 h-8"}
                      >
                        Edit Profile
                      </Button>
                    </Link>
                    <Button
                      variant={"secondary"}
                      className={"hover:bg-gray-200 h-8"}
                    >
                      View archive
                    </Button>
                    <Button
                      variant={"secondary"}
                      className={"hover:bg-gray-200 h-8"}
                    >
                      Ad tools
                    </Button>
                  </div>
                ) : isFollowing ? (
                  <div>
                    <Button variant={"secondary"} className={" h-8"}>
                      UnFollow
                    </Button>
                    <Button variant={"secondary"} className={" h-8"}>
                      Message
                    </Button>
                  </div>
                ) : (
                  <Button className={"bg-[#FBCF28] hover:bg-[#d5be6b] h-8"}>
                    Follow
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <p>
                  {" "}
                  <span className="font-semibold">
                    {userProfile?.posts.length}
                  </span>{" "}
                  posts
                </p>
                <p>
                  {" "}
                  <span className="font-semibold">
                    {userProfile?.followers.length}
                  </span>{" "}
                  followers
                </p>
                <p>
                  {" "}
                  <span className="font-semibold">
                    {userProfile?.following.length}
                  </span>{" "}
                  following
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">
                  {" "}
                  {userProfile?.bio || "bio here ..."}{" "}
                </span>
                <Badge className={"w-fit"} variant={"secondary"}>
                  <AtSign /> {userProfile?.username}{" "}
                </Badge>
                <span className="flex items-center gap-2">
                  {" "}
                  <FaEnvelope /> {userProfile?.email}{" "}
                </span>
                <span>
                  {" "}
                  {userProfile?.gender === "male" ? "He/Him" : "She/Her"}{" "}
                </span>

                {userProfile?.gender === "male" ? (
                  <span className="flex items-center gap-2">
                    {" "}
                    {userProfile?.gender}{" "}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {" "}
                    {userProfile?.gender}{" "}
                  </span>
                )}
                <span>{userProfile?.relationshipStatus} </span>
              </div>
            </div>
          </section>
        </div>
        <div className="border-t border-t-gray-200">
          <div className="flex items-center justify-center gap-10 text-sm">
            <span
              onClick={() => handleTabChange("posts")}
              className={`py-3 cursor-pointer ${
                activeTab === "posts" ? "font-bold" : ""
              }`}
            >
              POSTS
            </span>
            <span
              onClick={() => handleTabChange("saved")}
              className={`py-3 cursor-pointer ${
                activeTab === "saved" ? "font-bold" : ""
              }`}
            >
              SAVED
            </span>
            <span className="py-3 cursor-pointer">REELS</span>
            <span className="py-3 cursor-pointer">TAGS</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {displayedPost?.map((post) => {
              return (
                <div key={post?._id} className="relative group cursor-pointer">
                  <img
                    src={post?.image}
                    alt="postImage"
                    className="rounded-sm my-2 w-full aspect-square object-cover"
                  />
                  <div className=" absolute inset-0 flex items-center justify-center bg-transparent bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center text-white space-x-4">
                      <button
                        className={
                          "flex items-center gap-2 hover:text-gray-300"
                        }
                      >
                        {" "}
                        <Heart /> <span> {post?.likes.length} </span>{" "}
                      </button>
                      <button
                        className={
                          "flex items-center gap-2 hover:text-gray-300"
                        }
                      >
                        {" "}
                        <MessageCircle /> <span>
                          {" "}
                          {post?.comments.length}{" "}
                        </span>{" "}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
