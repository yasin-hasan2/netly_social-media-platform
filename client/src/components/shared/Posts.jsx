import React, { useState, useMemo } from "react";
import Post from "./Post";
import { useSelector, useDispatch } from "react-redux";
import {
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Tag,
  Smile,
  MapPin,
  X,
  Layers,
  FileText,
  Users,
  Film,
  Video,
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { axiosInstance } from "@/lib/axios";
import { setPosts } from "@/redux/postSlice";
import CreatePost from "./CreatePost";

export default function Posts() {
  const { posts } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'media' | 'thoughts' | 'following'
  const [activeTag, setActiveTag] = useState(null);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const res = await axiosInstance.get("/post/all", { withCredentials: true });
      if (res.data?.success && res.data.posts) {
        dispatch(setPosts(res.data.posts));
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTagClick = (tag) => {
    setActiveTag((prev) => (prev === tag ? null : tag));
  };

  // Filter posts based on active tab and active tag
  const filteredPosts = useMemo(() => {
    let list = Array.isArray(posts) ? [...posts] : [];

    // Filter by tab
    if (activeTab === "videos") {
      list = list.filter((p) => p.postType === "reel" || (p.video && p.video.trim() !== ""));
    } else if (activeTab === "media") {
      list = list.filter((p) => (p.image && p.image.trim() !== "") || (p.video && p.video.trim() !== ""));
    } else if (activeTab === "thoughts") {
      list = list.filter((p) => (!p.image || p.image.trim() === "") && (!p.video || p.video.trim() === ""));
    } else if (activeTab === "following") {
      const followingIds = (user?.following || []).map((f) => (f?._id || f).toString());
      list = list.filter((p) => {
        const authorId = (p.author?._id || p.author || "").toString();
        return followingIds.includes(authorId) || authorId === user?._id;
      });
    }

    // Filter by tag
    if (activeTag) {
      const cleaned = activeTag.toLowerCase();
      list = list.filter((p) =>
        Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase() === cleaned)
      );
    }

    return list;
  }, [posts, activeTab, activeTag, user]);

  // Extract popular tags from posts for quick exploration
  const popularTags = useMemo(() => {
    const counts = {};
    (posts || []).forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((t) => {
          const clean = t.trim().toLowerCase();
          if (clean) counts[clean] = (counts[clean] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }, [posts]);

  return (
    <div className="w-full mx-auto space-y-4">
      {/* Quick Composer Card at the top of feed */}
      <div className="bg-[#111726]/60 border border-white/[0.06] rounded-2xl p-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-white/10 flex-shrink-0">
            <AvatarImage src={user?.profilePicture} alt={user?.username} />
            <AvatarFallback className="bg-zinc-800 text-amber-400 font-semibold text-xs">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <button
            type="button"
            onClick={() => setCreatePostOpen(true)}
            className="flex-1 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.14] text-left px-4 py-2.5 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 transition cursor-pointer flex items-center justify-between"
          >
            <span>What's on your mind{user?.username ? `, ${user.username}` : ""}?</span>
            <Sparkles className="w-4 h-4 text-amber-400/80" />
          </button>
        </div>

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreatePostOpen(true)}
              className="h-8 px-2.5 text-xs text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 gap-1.5 cursor-pointer rounded-lg"
            >
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Photo</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreatePostOpen(true)}
              className="h-8 px-2.5 text-xs text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 gap-1.5 cursor-pointer rounded-lg"
            >
              <Video className="w-4 h-4 text-indigo-400" />
              <span>Video / Reel</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreatePostOpen(true)}
              className="h-8 px-2.5 text-xs text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 gap-1.5 cursor-pointer hidden sm:flex rounded-lg"
            >
              <Tag className="w-4 h-4 text-amber-400" />
              <span>Tag</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCreatePostOpen(true)}
              className="h-8 px-2.5 text-xs text-zinc-400 hover:text-sky-400 hover:bg-sky-500/10 gap-1.5 cursor-pointer hidden md:flex rounded-lg"
            >
              <Smile className="w-4 h-4 text-sky-400" />
              <span>Feeling</span>
            </Button>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => setCreatePostOpen(true)}
            className="h-8 px-4 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl cursor-pointer transition shadow-sm"
          >
            Post
          </Button>
        </div>
      </div>

      {/* Feed Filter Segmented Controls */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Interactive Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06] text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "all"
                ? "bg-white/[0.1] text-white shadow-sm font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("videos")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "videos"
                ? "bg-white/[0.1] text-white shadow-sm font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Videos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "media"
                ? "bg-white/[0.1] text-white shadow-sm font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Photos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("thoughts")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "thoughts"
                ? "bg-white/[0.1] text-white shadow-sm font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Thoughts</span>
          </button>

          {user && (
            <button
              type="button"
              onClick={() => setActiveTab("following")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "following"
                  ? "bg-white/[0.1] text-white shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Following</span>
            </button>
          )}
        </div>

        {/* Refresh Feed Button */}
        <Button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] border border-white/[0.06] rounded-xl transition gap-1.5 cursor-pointer"
          title="Refresh Feed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-400" : ""}`} />
          <span className="hidden sm:inline">{refreshing ? "Updating..." : "Refresh"}</span>
        </Button>
      </div>

      {/* Active Tag Filter Indicator */}
      {activeTag && (
        <div className="flex items-center justify-between px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200">
          <span className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#FACE25]" />
            Showing posts tagged <strong className="text-amber-100">#{activeTag}</strong>
          </span>
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className="text-amber-400 hover:text-amber-200 flex items-center gap-1 text-[11px] font-medium"
          >
            <X className="w-3.5 h-3.5" /> Clear tag
          </button>
        </div>
      )}

      {/* Popular Tags Quick Filters (when no tag selected) */}
      {!activeTag && popularTags.length > 0 && (
        <div className="flex items-center gap-2 px-1 text-xs text-zinc-400 overflow-x-auto pb-1">
          <span className="text-[11px] text-zinc-500 flex-shrink-0">Trending:</span>
          {popularTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-[#FACE25] transition flex-shrink-0 text-xs cursor-pointer border border-zinc-800/60"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Posts Stream */}
      {filteredPosts.length === 0 ? (
        <div className="w-full my-8 p-8 text-center rounded-2xl bg-zinc-950/60 border border-zinc-800/80 backdrop-blur-md flex flex-col items-center gap-3">
          <div className="p-3 bg-zinc-900 rounded-2xl text-[#FACE25]">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-100">No posts in this view</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              {activeTag
                ? `No posts found with tag #${activeTag}. Try clearing the filter.`
                : activeTab === "following"
                ? "No updates from people you follow yet. Explore and follow creators!"
                : "Be the first to share an update with the community!"}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-2">
            {activeTag && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTag(null)}
                className="text-xs border-zinc-700 text-zinc-300"
              >
                Clear Tag
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setCreatePostOpen(true)}
              className="text-xs font-semibold bg-[#FACE25] hover:bg-[#d8c222] text-zinc-950"
            >
              Create Post
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Post key={post._id} post={post} onTagClick={handleTagClick} />
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePost open={createPostOpen} setOpen={setCreatePostOpen} />
    </div>
  );
}
