import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedPost } from "@/redux/postSlice";
import {
  Search,
  Users,
  FileText,
  Hash,
  Sparkles,
  TrendingUp,
  Heart,
  MessageCircle,
  Film,
  Crown,
  Shield,
  CheckCircle2,
  X,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CommentDialog from "@/components/shared/CommentDialog";
import useFollowHandler from "@/hooks/useFollowHandler";
import BlueTagBadge from "@/components/shared/BlueTagBadge";

// User Card component with follow action
function UserResultCard({ targetUser }) {
  const { user: currentUser } = useSelector((store) => store.auth);
  const isSelf = currentUser?._id === targetUser._id;
  const {
    following: isFollowing,
    followHandler,
    loading: followLoading,
  } = useFollowHandler(targetUser._id);

  const isSuper =
    targetUser.role === "super_admin" ||
    ["yasinalhasan@gmail.com", "yaseenalhassan2@gmail.com"].includes(
      (targetUser.email || "").toLowerCase()
    );

  return (
    <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-zinc-700 transition">
      <Link
        to={`/profile/${targetUser._id}`}
        className="flex items-center gap-3 min-w-0 flex-1 group"
      >
        <Avatar className="h-12 w-12 border border-zinc-700 flex-shrink-0 group-hover:border-[#FACE25] transition">
          <AvatarImage src={targetUser.profilePicture} alt={targetUser.username} />
          <AvatarFallback className="bg-zinc-800 text-[#FACE25] font-bold text-sm">
            {targetUser.username?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="truncate">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-white group-hover:text-[#FACE25] transition truncate">
              @{targetUser.username}
            </span>
            {Boolean(targetUser.isBlueTag) && (
              <BlueTagBadge size="xs" />
            )}
            {isSuper ? (
              <Crown className="w-3.5 h-3.5 text-[#FACE25] flex-shrink-0" />
            ) : targetUser.role === "admin" ? (
              <Shield className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            ) : null}
          </div>

          {targetUser.fullName && (
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              {targetUser.fullName}
            </p>
          )}

          <p className="text-[11px] text-zinc-500 mt-1">
            <span>{targetUser.followersCount || 0} followers</span>
          </p>

          {targetUser.bio && (
            <p className="text-xs text-zinc-300 line-clamp-1 mt-1 font-normal">
              {targetUser.bio}
            </p>
          )}
        </div>
      </Link>

      {!isSelf && currentUser && (
        <Button
          size="sm"
          onClick={followHandler}
          disabled={followLoading}
          className={`h-8 px-3 text-xs font-semibold rounded-xl flex-shrink-0 transition ${
            isFollowing
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              : "bg-[#FACE25] hover:bg-[#d8c222] text-zinc-950 font-bold"
          }`}
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initialQuery = searchParams.get("q") || "";
  const initialType = searchParams.get("type") || "all";

  const [query, setQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState(initialType);
  const [loading, setLoading] = useState(false);

  const [results, setResults] = useState({
    users: [],
    posts: [],
    hashtags: [],
    total: 0,
  });

  const [commentDialogOpen, setCommentDialogOpen] = useState(false);

  // Sync state from URL params
  useEffect(() => {
    const qParam = searchParams.get("q") || "";
    const typeParam = searchParams.get("type") || "all";
    setQuery(qParam);
    setActiveType(typeParam);
    fetchResults(qParam, typeParam);
  }, [searchParams]);

  const fetchResults = async (q, type) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/search?q=${encodeURIComponent(q)}&type=${type}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setResults({
          users: res.data.users || [],
          posts: res.data.posts || [],
          hashtags: res.data.hashtags || [],
          total: res.data.total || 0,
        });
      }
    } catch (err) {
      console.error("Search fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query.trim(), type: activeType });
  };

  const handleTypeChange = (newType) => {
    setActiveType(newType);
    setSearchParams({ q: query.trim(), type: newType });
  };

  const handleHashtagSelect = (tag) => {
    const clean = tag.replace(/^#/, "");
    setQuery(`#${clean}`);
    setSearchParams({ q: `#${clean}`, type: "hashtags" });
  };

  const handlePostClick = (post) => {
    dispatch(setSelectedPost(post));
    setCommentDialogOpen(true);
  };

  const isHashtagSearch = query.startsWith("#");

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Search Banner */}
      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-5 shadow-sm backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#FACE25]/15 text-[#FACE25]">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Global Search & Explore
              </h1>
              <p className="text-xs text-zinc-400">
                Discover creators, trending thoughts, media, and hashtags across Net-ly
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5 pointer-events-none" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users by @username, posts by keyword, or #hashtags..."
            className="w-full pl-10 pr-24 py-2.5 h-11 bg-zinc-900 border-zinc-800 text-sm text-white placeholder-zinc-500 rounded-xl focus:ring-1 focus:ring-[#FACE25]"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSearchParams({ q: "", type: activeType });
                }}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <Button
              type="submit"
              size="sm"
              className="h-8 px-3 bg-[#FACE25] hover:bg-[#d8c222] text-zinc-950 font-bold text-xs rounded-lg"
            >
              Search
            </Button>
          </div>
        </form>

        {/* Filter Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800/80 overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => handleTypeChange("all")}
            className={`px-4 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              activeType === "all"
                ? "bg-zinc-800 text-[#FACE25] font-bold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Results</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange("users")}
            className={`px-4 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              activeType === "users"
                ? "bg-zinc-800 text-[#FACE25] font-bold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>People ({results.users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange("posts")}
            className={`px-4 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              activeType === "posts"
                ? "bg-zinc-800 text-[#FACE25] font-bold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Posts ({results.posts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange("hashtags")}
            className={`px-4 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
              activeType === "hashtags"
                ? "bg-zinc-800 text-[#FACE25] font-bold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Hashtags ({results.hashtags.length})</span>
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#FACE25]" />
          <span className="text-xs">Searching platform...</span>
        </div>
      )}

      {/* Main Results View */}
      {!loading && (
        <div className="space-y-8">
          {/* 1. HASHTAGS SECTION */}
          {(activeType === "all" || activeType === "hashtags") &&
            results.hashtags.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Hash className="w-4 h-4 text-[#FACE25]" />
                    <span>{query ? "Matching Hashtags" : "Trending Hashtags"}</span>
                  </h2>
                  <span className="text-xs text-zinc-500">
                    {results.hashtags.length} topics
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {results.hashtags.map((ht) => (
                    <div
                      key={ht.tag}
                      onClick={() => handleHashtagSelect(ht.tag)}
                      className="bg-zinc-950/70 border border-zinc-800/80 hover:border-[#FACE25]/60 rounded-2xl p-3.5 cursor-pointer transition group flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#FACE25] flex-shrink-0 overflow-hidden group-hover:scale-105 transition">
                        {ht.sampleMedia ? (
                          <img
                            src={ht.sampleMedia}
                            alt={ht.tag}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Hash className="w-5 h-5 text-[#FACE25]" />
                        )}
                      </div>

                      <div className="truncate">
                        <p className="font-bold text-xs text-white group-hover:text-[#FACE25] transition truncate">
                          #{ht.tag}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {ht.count} {ht.count === 1 ? "post" : "posts"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* 2. USERS SECTION */}
          {(activeType === "all" || activeType === "users") &&
            results.users.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#FACE25]" />
                    <span>{query ? "Matching People" : "Suggested Creators"}</span>
                  </h2>
                  <span className="text-xs text-zinc-500">
                    {results.users.length} accounts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {results.users.map((targetUser) => (
                    <UserResultCard key={targetUser._id} targetUser={targetUser} />
                  ))}
                </div>
              </div>
            )}

          {/* 3. POSTS SECTION */}
          {(activeType === "all" || activeType === "posts") &&
            results.posts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#FACE25]" />
                    <span>Matching Posts & Media</span>
                  </h2>
                  <span className="text-xs text-zinc-500">
                    {results.posts.length} posts
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {results.posts.map((post) => (
                    <div
                      key={post._id}
                      onClick={() => handlePostClick(post)}
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 cursor-pointer shadow-sm hover:border-[#FACE25]/50 transition"
                    >
                      {/* Media Image or Video preview */}
                      {post.image ? (
                        <img
                          src={post.image}
                          alt="Post preview"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : post.video ? (
                        <div className="w-full h-full relative bg-black">
                          <video
                            src={post.video}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                          <div className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-[#FACE25]">
                            <Film className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full p-4 flex flex-col justify-between bg-zinc-950/80 border border-zinc-800 text-zinc-300">
                          <p className="text-xs line-clamp-4 leading-relaxed italic">
                            "{post.caption || "Text post"}"
                          </p>
                          <span className="text-[10px] text-zinc-500">
                            @{post.author?.username}
                          </span>
                        </div>
                      )}

                      {/* Hover Overlay with Stats */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                        <div className="flex items-center gap-1 font-bold text-xs">
                          <Heart className="w-4 h-4 fill-white" />
                          <span>{post.likesCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 font-bold text-xs">
                          <MessageCircle className="w-4 h-4 fill-white" />
                          <span>{post.commentsCount || 0}</span>
                        </div>
                      </div>

                      {/* Author badge tag on bottom */}
                      <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-between text-[10px] text-zinc-300 pointer-events-none">
                        <span className="truncate font-semibold text-white">
                          @{post.author?.username}
                        </span>
                        {post.postType === "reel" && (
                          <span className="text-[#FACE25] font-bold">Reel</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* 4. ZERO RESULTS STATE */}
          {results.total === 0 && (
            <div className="py-16 text-center space-y-3 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-8 backdrop-blur-md">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#FACE25]">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">
                No matching results found
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                We couldn't find any users, posts, or hashtags matching "
                <strong className="text-zinc-200">{query}</strong>". Try a different keyword or explore trending hashtags above.
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setSearchParams({ q: "", type: "all" });
                  }}
                  className="border-zinc-700 text-xs text-zinc-300"
                >
                  Clear Search
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Post Comment & Details Dialog */}
      <CommentDialog open={commentDialogOpen} setOpen={setCommentDialogOpen} />
    </div>
  );
}
