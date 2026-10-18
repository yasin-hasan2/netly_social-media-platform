import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import useFollowHandler from "@/hooks/useFollowHandler";
import { axiosInstance } from "@/lib/axios";
import { setSelectedUser } from "@/redux/chatSlice";
import { setSelectedPost } from "@/redux/postSlice";
import { setAuthUser, setUserProfile } from "@/redux/authSlice";
import CommentDialog from "@/components/shared/CommentDialog";
import BlueTagBadge from "@/components/shared/BlueTagBadge";
import {
  Heart,
  MessageCircle,
  UserCheck,
  UserPlus,
  Sparkles,
  Film,
  Lock,
  Unlock,
  Globe,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  User,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Edit3,
  ExternalLink,
} from "lucide-react";
import {
  FaInstagram,
  FaTwitter,
  FaGithub,
  FaLinkedin,
  FaYoutube,
  FaFacebook,
} from "react-icons/fa";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Profile() {
  const params = useParams();
  const userId = params.id;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useGetUserProfile(userId);

  const [activeTab, setActiveTab] = useState("posts");
  const [listModalOpen, setListModalOpen] = useState(false);
  const [listModalType, setListModalType] = useState("followers"); // 'followers' | 'following'
  const [listUsers, setListUsers] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [togglingPrivacy, setTogglingPrivacy] = useState(false);

  const { userProfile, user } = useSelector((store) => store.auth);

  // Real follow/unfollow handler hook for this profile
  const { following: isFollowing, followHandler, loading: followLoading } =
    useFollowHandler(userId);

  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const isPrivateAccount = userProfile?.profilePrivacy === "private";
  // Content is visible if: viewer is owner, or account is public, or viewer follows them
  const canViewContent = isLoggedInUserProfile || !isPrivateAccount || isFollowing;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Follow or unfollow toggle
  const handleFollowClick = async () => {
    await followHandler();
  };

  // Quick toggle lock/unlock profile for account owner
  const handleTogglePrivacy = async () => {
    try {
      setTogglingPrivacy(true);
      const res = await axiosInstance.post(
        "/user/profile/toggle-privacy",
        {},
        { withCredentials: true }
      );
      if (res.data?.success) {
        const nextPrivacy = res.data.profilePrivacy;
        const updated = { ...userProfile, profilePrivacy: nextPrivacy };
        dispatch(setUserProfile(updated));
        if (isLoggedInUserProfile) {
          dispatch(setAuthUser({ ...user, profilePrivacy: nextPrivacy }));
        }
        toast.success(
          nextPrivacy === "private"
            ? "🔒 Profile locked! Only your followers can view your posts."
            : "🌐 Profile unlocked! Your posts are now public."
        );
      }
    } catch (err) {
      console.error("Privacy toggle error:", err);
      toast.error(err.response?.data?.message || "Failed to toggle privacy");
    } finally {
      setTogglingPrivacy(false);
    }
  };

  // Message button handler: ensure follow status then navigate to chat
  const handleMessage = async () => {
    if (!user) {
      toast.error("Please login to message users");
      navigate("/login");
      return;
    }

    if (!isFollowing) {
      toast.info(`Connecting with @${userProfile?.username} to open your chat inbox...`);
      const res = await followHandler();
      if (!res?.success) return;
    }

    dispatch(
      setSelectedUser({
        _id: userProfile?._id,
        username: userProfile?.username,
        fullName: userProfile?.fullName,
        profilePicture: userProfile?.profilePicture,
        bio: userProfile?.bio,
        isFollowing: true,
      })
    );
    navigate(`/chat/${userProfile?._id}`);
  };

  // Open followers or following modal
  const openFollowList = async (type) => {
    // If account is private and viewer is not owner and not following, hide follower details
    if (isPrivateAccount && !isLoggedInUserProfile && !isFollowing) {
      toast.info("This account is private. Follow to view their community.");
      return;
    }

    setListModalType(type);
    setListModalOpen(true);
    setLoadingList(true);
    try {
      const res = await axiosInstance.get(`/user/${userId}/${type}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setListUsers(res.data[type] || []);
      }
    } catch (err) {
      console.error(`Error loading ${type}:`, err);
      const fallbackList =
        type === "followers"
          ? userProfile?.followers || []
          : userProfile?.following || [];
      setListUsers(
        fallbackList.map((item) =>
          typeof item === "string" ? { _id: item, username: "User" } : item
        )
      );
    } finally {
      setLoadingList(false);
    }
  };

  const displayedPost =
    activeTab === "posts"
      ? userProfile?.posts
      : activeTab === "reels"
      ? (userProfile?.posts || []).filter((p) => p.postType === "reel" || (p.video && p.video.trim()))
      : userProfile?.bookmarks;

  const followersCount = userProfile?.followers?.length || 0;
  const followingCount = userProfile?.following?.length || 0;
  const postsCount = userProfile?.posts?.length || 0;

  // Social links extraction
  const socialLinks = userProfile?.contactInfo?.socialLinks || {};
  const contactInfo = userProfile?.contactInfo || {};
  const website = userProfile?.websiteLink || contactInfo?.websiteLink || "";

  return (
    <div className="flex justify-center mt-6 md:mt-8 px-3 sm:px-6 lg:px-0">
      <div className="flex flex-col gap-8 md:gap-12 max-w-4xl w-full">
        {/* Profile Header Card */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
            {/* Avatar with Mode / Privacy Status Ring */}
            <div className="relative flex-shrink-0">
              <div
                className={`p-1 rounded-full ${
                  userProfile?.profileType === "creator"
                    ? "bg-gradient-to-tr from-[#FACE25] via-amber-400 to-rose-500 shadow-lg shadow-amber-500/10"
                    : userProfile?.profileType === "business"
                    ? "bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 shadow-lg shadow-blue-500/10"
                    : isPrivateAccount
                    ? "bg-zinc-700"
                    : "bg-zinc-800"
                }`}
              >
                <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-zinc-950 rounded-full shadow-2xl">
                  <AvatarImage
                    src={userProfile?.profilePicture}
                    alt={userProfile?.username}
                    className="object-cover h-full w-full"
                  />
                  <AvatarFallback className="bg-zinc-900 text-[#FACE25] font-bold text-2xl">
                    {userProfile?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Mode or Lock Badge on Avatar */}
              {isPrivateAccount && (
                <div
                  className="absolute bottom-1 right-1 p-2 rounded-full bg-zinc-900 border-2 border-zinc-950 text-amber-400 shadow-md"
                  title="Private Account (Locked)"
                >
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
              {!isPrivateAccount && userProfile?.profileType === "creator" && (
                <div
                  className="absolute bottom-1 right-1 p-2 rounded-full bg-[#FACE25] border-2 border-zinc-950 text-zinc-950 shadow-md"
                  title="Creator Profile"
                >
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
              {!isPrivateAccount && userProfile?.profileType === "business" && (
                <div
                  className="absolute bottom-1 right-1 p-2 rounded-full bg-blue-500 border-2 border-zinc-950 text-white shadow-md"
                  title="Business Profile"
                >
                  <Briefcase className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
            </div>

            {/* Profile Information & Actions */}
            <div className="flex-1 w-full text-center md:text-left space-y-4">
              {/* Username, Mode Badges & Action Buttons */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                      {userProfile?.username}
                    </h1>
                    {Boolean(userProfile?.isBlueTag) && (
                      <BlueTagBadge size="md" tooltipText="Verified Account with Blue Tag" />
                    )}
                  </div>

                  {/* Privacy Badge */}
                  {isPrivateAccount ? (
                    <Badge className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold px-2.5 py-0.5 gap-1.5 shadow-sm">
                      <Lock className="w-3 h-3 text-[#FACE25]" /> Private
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-2.5 py-0.5 gap-1.5 shadow-sm">
                      <Globe className="w-3 h-3" /> Public
                    </Badge>
                  )}

                  {/* Mode Badge (Creator / Business) */}
                  {userProfile?.profileType === "creator" && (
                    <Badge className="bg-[#FACE25]/15 border border-[#FACE25]/40 text-[#FACE25] text-xs font-semibold px-2.5 py-0.5 gap-1.5">
                      <Sparkles className="w-3 h-3" /> Creator
                    </Badge>
                  )}
                  {userProfile?.profileType === "business" && (
                    <Badge className="bg-blue-500/15 border border-blue-500/40 text-blue-300 text-xs font-semibold px-2.5 py-0.5 gap-1.5">
                      <Briefcase className="w-3 h-3" /> Business
                    </Badge>
                  )}
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                  {isLoggedInUserProfile ? (
                    <>
                      <Link to="/account/edit">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold h-9 px-4 rounded-xl border border-zinc-700 transition gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#FACE25]" />
                          Edit Profile
                        </Button>
                      </Link>

                      {/* Quick Lock / Unlock Toggle Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={togglingPrivacy}
                        onClick={handleTogglePrivacy}
                        className={`h-9 px-3.5 rounded-xl text-xs font-semibold transition gap-1.5 cursor-pointer ${
                          isPrivateAccount
                            ? "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300"
                            : "border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                        }`}
                        title={isPrivateAccount ? "Make Profile Public" : "Lock Profile (Private)"}
                      >
                        {isPrivateAccount ? (
                          <>
                            <Unlock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Unlock</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-[#FACE25]" />
                            <span>Lock Profile</span>
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleFollowClick}
                        disabled={followLoading}
                        className={`h-9 px-5 font-bold transition-all rounded-xl cursor-pointer ${
                          isFollowing
                            ? "bg-zinc-800 hover:bg-rose-950/80 text-zinc-200 hover:text-rose-400 border border-zinc-700"
                            : "bg-[#FACE25] text-zinc-950 hover:bg-[#d8c222] shadow-md"
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserCheck className="w-4 h-4 mr-1.5" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-1.5" />
                            Follow
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleMessage}
                        className="h-9 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl border border-zinc-700 transition cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 mr-1.5 text-[#FACE25]" />
                        Message
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats Counters */}
              <div className="flex items-center justify-center md:justify-start gap-7 text-xs text-zinc-300 pt-1">
                <p>
                  <strong className="text-base font-bold text-white mr-1">
                    {postsCount}
                  </strong>{" "}
                  posts
                </p>

                <p
                  onClick={() => openFollowList("followers")}
                  className="cursor-pointer hover:text-white transition group"
                >
                  <strong className="text-base font-bold text-white group-hover:text-[#FACE25] mr-1">
                    {followersCount}
                  </strong>{" "}
                  <span className="group-hover:underline">followers</span>
                </p>

                <p
                  onClick={() => openFollowList("following")}
                  className="cursor-pointer hover:text-white transition group"
                >
                  <strong className="text-base font-bold text-white group-hover:text-[#FACE25] mr-1">
                    {followingCount}
                  </strong>{" "}
                  <span className="group-hover:underline">following</span>
                </p>
              </div>

              {/* Full Name & Category */}
              <div className="space-y-1">
                {userProfile?.fullName && (
                  <h3 className="font-bold text-sm md:text-base text-zinc-100">
                    {userProfile.fullName}
                  </h3>
                )}

                {userProfile?.category && (
                  <p className="text-xs font-medium text-[#FACE25]">
                    {userProfile.category}
                  </p>
                )}
              </div>

              {/* Bio with newline preservation */}
              {userProfile?.bio ? (
                <p className="text-xs md:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap max-w-xl">
                  {userProfile.bio}
                </p>
              ) : (
                <p className="text-xs text-zinc-500 italic">No bio added yet.</p>
              )}

              {/* Location, Website & Contact Meta */}
              <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap text-xs text-zinc-400 pt-1">
                {userProfile?.location && (
                  <span className="flex items-center gap-1 text-zinc-300">
                    <MapPin className="w-3.5 h-3.5 text-[#FACE25]" />
                    {userProfile.location}
                  </span>
                )}

                {website && (
                  <a
                    href={website.startsWith("http") ? website : `https://${website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#FACE25] hover:underline font-medium"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{website.replace(/^https?:\/\//, "")}</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                )}
              </div>

              {/* Social Links Row */}
              {(socialLinks.instagram ||
                socialLinks.twitter ||
                socialLinks.github ||
                socialLinks.linkedin ||
                socialLinks.youtube ||
                contactInfo.email ||
                contactInfo.phone) && (
                <div className="flex items-center justify-center md:justify-start gap-2 pt-1 flex-wrap">
                  {socialLinks.instagram && (
                    <a
                      href={
                        socialLinks.instagram.startsWith("http")
                          ? socialLinks.instagram
                          : `https://instagram.com/${socialLinks.instagram.replace("@", "")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-rose-400 border border-zinc-800 transition"
                      title="Instagram"
                    >
                      <FaInstagram className="w-4 h-4" />
                    </a>
                  )}

                  {socialLinks.twitter && (
                    <a
                      href={
                        socialLinks.twitter.startsWith("http")
                          ? socialLinks.twitter
                          : `https://twitter.com/${socialLinks.twitter.replace("@", "")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-sky-400 border border-zinc-800 transition"
                      title="Twitter / X"
                    >
                      <FaTwitter className="w-4 h-4" />
                    </a>
                  )}

                  {socialLinks.github && (
                    <a
                      href={
                        socialLinks.github.startsWith("http")
                          ? socialLinks.github
                          : `https://github.com/${socialLinks.github.replace("@", "")}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition"
                      title="GitHub"
                    >
                      <FaGithub className="w-4 h-4" />
                    </a>
                  )}

                  {socialLinks.linkedin && (
                    <a
                      href={
                        socialLinks.linkedin.startsWith("http")
                          ? socialLinks.linkedin
                          : `https://linkedin.com/in/${socialLinks.linkedin}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-blue-400 border border-zinc-800 transition"
                      title="LinkedIn"
                    >
                      <FaLinkedin className="w-4 h-4" />
                    </a>
                  )}

                  {socialLinks.youtube && (
                    <a
                      href={
                        socialLinks.youtube.startsWith("http")
                          ? socialLinks.youtube
                          : `https://youtube.com/${socialLinks.youtube}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-red-500 border border-zinc-800 transition"
                      title="YouTube"
                    >
                      <FaYoutube className="w-4 h-4" />
                    </a>
                  )}

                  {contactInfo.email && (
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-zinc-800 transition"
                      title={`Email: ${contactInfo.email}`}
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}

                  {contactInfo.phone && (
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 transition"
                      title={`Call: ${contactInfo.phone}`}
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section: Either Instagram-Style Private Lock Screen OR Media Tabs */}
        {!canViewContent ? (
          /* INSTAGRAM-STYLE LOCKED PROFILE GATE */
          <div className="w-full my-4 py-16 px-6 bg-zinc-950/80 border border-zinc-800/80 rounded-3xl text-center flex flex-col items-center justify-center backdrop-blur-md shadow-2xl">
            {/* Glowing Lock Ring */}
            <div className="relative mb-5">
              <div className="w-24 h-24 rounded-full border-2 border-amber-400/40 bg-zinc-900/90 flex items-center justify-center text-[#FACE25] shadow-2xl shadow-amber-500/10">
                <Lock className="w-10 h-10 stroke-[1.8]" />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-zinc-950 border border-zinc-800 text-amber-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>

            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight mb-2">
              This Account is Private
            </h2>

            <p className="text-zinc-400 text-xs md:text-sm max-w-md mx-auto leading-relaxed mb-6">
              Follow <strong>@{userProfile?.username}</strong> to see all their photos, videos, reels, and thoughts.
            </p>

            <Button
              type="button"
              disabled={followLoading}
              onClick={handleFollowClick}
              className="bg-[#FACE25] hover:bg-[#d8c222] text-zinc-950 font-bold px-8 h-11 text-xs rounded-xl shadow-lg transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Follow to View Content
            </Button>
          </div>
        ) : (
          /* CONTENT GRIDS (Owner, Public, or Approved Followers) */
          <div className="flex flex-col gap-4">
            {/* Subtle banner if viewer is following a private account */}
            {isPrivateAccount && !isLoggedInUserProfile && (
              <div className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FACE25]" />
                  <span>You're following this private account. You can see their photos and reels.</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 font-bold">
                  Exclusive
                </span>
              </div>
            )}

            {/* Tabs */}
            <div className="flex justify-center gap-10 border-b border-zinc-800 text-zinc-400">
              {["posts", "reels", ...(isLoggedInUserProfile ? ["saved"] : [])].map(
                (tab) => (
                  <span
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`py-3 cursor-pointer uppercase tracking-wider text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      activeTab === tab
                        ? "text-[#FACE25] border-b-2 border-[#FACE25]"
                        : "hover:text-white"
                    }`}
                  >
                    {tab === "reels" && <Film className="w-4 h-4" />}
                    {tab}
                  </span>
                )
              )}
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {!displayedPost || displayedPost.length === 0 ? (
                <div className="col-span-full py-16 text-center text-zinc-500 text-xs">
                  No {activeTab} yet.
                </div>
              ) : (
                displayedPost.map((post) => (
                  <div
                    key={post?._id}
                    onClick={() => {
                      dispatch(setSelectedPost(post));
                      setPostDialogOpen(true);
                    }}
                    className="relative group overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800/80 cursor-pointer aspect-square"
                  >
                    {post?.video ? (
                      <div className="relative w-full h-full bg-black">
                        <video
                          src={post.video}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-[#FACE25]">
                          <Film className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ) : post?.image ? (
                      <img
                        src={post.image}
                        alt="Post"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full p-4 flex flex-col justify-between bg-zinc-900/90 text-left">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#FACE25] font-semibold">
                          <Sparkles className="w-3 h-3" />
                          <span>Thought</span>
                        </div>
                        <p className="text-xs text-zinc-200 line-clamp-4 leading-relaxed italic">
                          "{post?.caption}"
                        </p>
                        <div className="text-[10px] text-zinc-500">
                          {post?.tags?.length ? `#${post.tags[0]}` : "Note"}
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex items-center gap-5 text-white text-sm pointer-events-none font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Heart className="w-4 h-4 fill-white text-white" />
                          {(post?.likes || []).length}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MessageCircle className="w-4 h-4 fill-white text-white" />
                          {(post?.comments || []).length}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Post Comments & Details Modal */}
      <CommentDialog open={postDialogOpen} setOpen={setPostDialogOpen} />

      {/* Followers / Following List Modal */}
      <Dialog open={listModalOpen} onOpenChange={setListModalOpen}>
        <DialogContent className="max-w-md bg-zinc-950 border border-zinc-800 text-white rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="capitalize text-center text-base font-bold text-white">
              {listModalType}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[380px] overflow-y-auto space-y-2.5 mt-4 pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
            {loadingList ? (
              <div className="py-8 text-center text-zinc-500 text-xs">Loading {listModalType}...</div>
            ) : listUsers.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                No {listModalType} yet.
              </div>
            ) : (
              listUsers.map((item) => (
                <FollowListItem
                  key={item._id}
                  item={item}
                  currentUser={user}
                  onClose={() => setListModalOpen(false)}
                />
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-component for each user item in the followers / following modal
function FollowListItem({ item, currentUser, onClose }) {
  const navigate = useNavigate();
  const { following, followHandler, loading } = useFollowHandler(item._id);
  const isMe = currentUser?._id === item._id;

  return (
    <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-zinc-900 transition">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => {
          onClose();
          navigate(`/profile/${item._id}`);
        }}
      >
        <Avatar className="w-10 h-10 border border-zinc-800">
          <AvatarImage src={item.profilePicture} />
          <AvatarFallback className="bg-zinc-800 text-[#FACE25] font-bold text-xs">
            {item.username?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold text-xs text-white hover:underline">{item.username}</p>
          {item.fullName && (
            <p className="text-[11px] text-zinc-400">{item.fullName}</p>
          )}
        </div>
      </div>

      {!isMe && (
        <Button
          size="sm"
          disabled={loading}
          onClick={followHandler}
          className={`h-7 px-3 text-xs font-semibold rounded-xl cursor-pointer ${
            following
              ? "bg-zinc-800 hover:bg-rose-950/80 text-zinc-300 hover:text-rose-400 border border-zinc-700"
              : "bg-[#FACE25] text-zinc-950 hover:bg-[#d8c222]"
          }`}
        >
          {following ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
}
