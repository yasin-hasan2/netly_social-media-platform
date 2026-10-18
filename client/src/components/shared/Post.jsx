import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Bookmark,
  MessageCircle,
  MoreHorizontal,
  Send,
  MapPin,
  Edit3,
  Trash2,
  Flag,
  Copy,
  Check,
  Tag,
  Loader2,
  Smile,
  Repeat,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "../ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/axios";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Link, useNavigate } from "react-router-dom";
import useFollowHandler from "@/hooks/useFollowHandler";
import { formatTimeAgo } from "@/lib/utils";
import { setSelectedUser } from "@/redux/chatSlice";
import BlueTagBadge from "./BlueTagBadge";

const QUICK_EMOJIS = ["❤️", "🔥", "👏", "😂", "🚀", "✨", "💯"];

const Post = ({ post, onTagClick }) => {
  const [text, setText] = useState("");
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReasons, setReportReasons] = useState([]);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  // Edit fields
  const [editCaption, setEditCaption] = useState(post?.caption || "");
  const [editLocation, setEditLocation] = useState(post?.location || "");
  const [editFeeling, setEditFeeling] = useState(post?.feeling || "");
  const [editTagsInput, setEditTagsInput] = useState((post?.tags || []).join(", "));
  const [editLoading, setEditLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const { user, userProfile } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [liked, setLiked] = useState((post?.likes || []).includes(user?._id));
  const [postLike, setPostLike] = useState((post?.likes || []).length);
  const [comment, setComment] = useState(post?.comments || []);
  const [sharesCount, setSharesCount] = useState(post?.sharesCount || 0);
  const [repostsCount, setRepostsCount] = useState((post?.reposts || []).length);
  const [isReposted, setIsReposted] = useState((post?.reposts || []).includes(user?._id));
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authorId = post?.author?._id || (typeof post?.author === "string" ? post?.author : null);
  const isAuthor = user?._id && (user._id === authorId || user._id === post?.author?._id);

  const { following: isFollowing, followHandler: handleFollowAuthor, loading: followLoading } =
    useFollowHandler(authorId);

  const isBookmarked = Array.isArray(userProfile?.bookmarks) &&
    userProfile.bookmarks.some((b) => (b?._id || b) === post?._id);

  // Repost post toggle handler
  const repostHandler = async () => {
    if (!user) {
      toast.error("Please login to repost");
      return;
    }
    try {
      const res = await axiosInstance.post(`/post/${post._id}/repost`, {}, { withCredentials: true });
      if (res.data?.success) {
        setIsReposted(res.data.isReposted);
        setRepostsCount(res.data.repostsCount);
        toast.success(res.data.message);
        if (res.data.post) {
          const updatedPosts = (posts || []).map((p) =>
            p._id === post._id ? { ...p, reposts: res.data.post.reposts } : p
          );
          dispatch(setPosts(updatedPosts));
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to repost");
    }
  };

  // Like or dislike toggle
  const likeOrDislikeHandler = async () => {
    if (!user) {
      toast.error("Please login to like posts");
      return;
    }
    try {
      const action = liked ? "dislike" : "like";
      const res = await axiosInstance.get(`/post/${post._id}/${action}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setPostLike(liked ? Math.max(0, postLike - 1) : postLike + 1);
        setLiked(!liked);
        const updatedPostData = (posts || []).map((p) =>
          p._id === post._id
            ? {
                ...p,
                likes: liked
                  ? (p.likes || []).filter((id) => id !== user._id)
                  : [...(p.likes || []), user._id],
              }
            : p
        );
        dispatch(setPosts(updatedPostData));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update like status");
    }
  };

  // Double tap to like with animated heart pop
  const handleMediaDoubleTap = () => {
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
    if (!liked) {
      likeOrDislikeHandler();
    }
  };

  // Add inline comment
  const commentHandler = async (e) => {
    if (e) e.preventDefault();
    if (!user) {
      toast.error("Please login to comment");
      return;
    }
    if (!text.trim()) return;

    try {
      setCommentSubmitting(true);
      const res = await axiosInstance.post(
        `/post/${post._id}/comment`,
        { text: text.trim() },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data?.success) {
        const newComment = res.data.comment;
        const updatedCommentData = [...(comment || []), newComment];
        setComment(updatedCommentData);
        const updatedPostData = (posts || []).map((p) =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p
        );
        dispatch(setPosts(updatedPostData));
        setText("");
        toast.success("Comment added!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to post comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Delete post
  const deletePostHandler = async () => {
    try {
      const res = await axiosInstance.delete(`/post/delete/${post._id}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        const updatedPostData = (posts || []).filter((p) => p._id !== post._id);
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message || "Post deleted");
        setDeleteDialogOpen(false);
        setOptionsOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete post");
    }
  };

  // Edit post handler
  const handleSaveEdit = async () => {
    try {
      setEditLoading(true);
      const parsedTags = editTagsInput
        .split(",")
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const res = await axiosInstance.post(
        `/post/${post._id}/edit`,
        {
          caption: editCaption.trim(),
          location: editLocation.trim(),
          feeling: editFeeling.trim(),
          tags: parsedTags,
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        const updatedPost = res.data.post;
        const updatedPostData = (posts || []).map((p) =>
          p._id === post._id ? { ...p, ...updatedPost } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success("Post updated successfully!");
        setEditDialogOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update post");
    } finally {
      setEditLoading(false);
    }
  };

  // Share / Copy Link handler
  const handleShareClick = async () => {
    try {
      const shareUrl = `${window.location.origin}/profile/${authorId || ""}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);

      // Record share on server
      try {
        const res = await axiosInstance.post(`/post/${post._id}/share`, {}, { withCredentials: true });
        if (res.data?.success) {
          setSharesCount((prev) => prev + 1);
        }
      } catch {
        // ignore share count error
      }

      toast.success("Post link copied to clipboard!");
    } catch {
      toast.info("Link copied!");
    }
  };

  // Direct message share
  const handleShareToChat = () => {
    if (authorId && authorId !== user?._id) {
      dispatch(
        setSelectedUser({
          _id: post.author?._id,
          username: post.author?.username,
          profilePicture: post.author?.profilePicture,
        })
      );
      navigate(`/chat/${authorId}`);
    } else {
      handleShareClick();
    }
  };

  // Bookmark post
  const bookmarkHandler = async () => {
    if (!user) {
      toast.error("Please login to save posts");
      return;
    }
    try {
      const res = await axiosInstance.get(`/post/${post._id}/bookmark`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update bookmark");
    }
  };

  // Report post
  const reportPostHandler = async () => {
    if (reportReasons.length === 0) {
      toast.error("Please select at least one reason");
      return;
    }
    try {
      const res = await axiosInstance.post(
        `/post/${post._id}/report`,
        { reasons: reportReasons },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(res.data.message || "Thank you. Post reported for review.");
        setReportDialogOpen(false);
        setReportReasons([]);
        setOptionsOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to report post");
    }
  };

  const toggleReportReason = (reason) => {
    if (reportReasons.includes(reason)) {
      setReportReasons(reportReasons.filter((r) => r !== reason));
    } else {
      setReportReasons([...reportReasons, reason]);
    }
  };

  const reportOptions = [
    "Spam or misleading",
    "Harassment or hate speech",
    "Inappropriate content",
    "Violence or harmful behavior",
    "Intellectual property violation",
  ];

  const timeString = formatTimeAgo(post.createdAt);

  return (
    <article className="w-full mx-auto mb-5 bg-[#111726]/60 border border-white/[0.06] rounded-2xl overflow-hidden backdrop-blur-md shadow-sm hover:border-white/[0.12] transition-all duration-200">
      {/* Post Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={`/profile/${post?.author?._id || ""}`}
            className="flex-shrink-0 group"
          >
            <Avatar className="h-10 w-10 border border-white/10 transition group-hover:scale-105">
              <AvatarImage src={post.author?.profilePicture} alt={post.author?.username} />
              <AvatarFallback className="bg-zinc-800 text-amber-400 font-semibold text-xs">
                {post.author?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap leading-tight">
              <div className="flex items-center gap-1.5 min-w-0">
                <Link
                  to={`/profile/${post?.author?._id || ""}`}
                  className="font-semibold text-sm text-zinc-100 hover:text-amber-400 transition truncate"
                >
                  {post.author?.username}
                </Link>
                {Boolean(post.author?.isBlueTag) && (
                  <BlueTagBadge size="xs" />
                )}
              </div>

              {/* Follow Button for non-authors */}
              {!isAuthor && user && authorId && (
                <button
                  type="button"
                  onClick={handleFollowAuthor}
                  disabled={followLoading}
                  className={`text-xs font-semibold hover:underline transition ${
                    isFollowing ? "text-zinc-500" : "text-amber-400"
                  }`}
                >
                  · {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>

            {/* Clean unboxed metadata with typographic separators */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5 flex-wrap">
              {timeString && <span>{timeString}</span>}
              {post.isEdited && <span className="text-zinc-500">(edited)</span>}
              {post.location && (
                <>
                  <span aria-hidden="true" className="text-zinc-600">·</span>
                  <span className="flex items-center gap-0.5 text-zinc-400 truncate max-w-[180px]">
                    <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    {post.location}
                  </span>
                </>
              )}
              {post.feeling && (
                <>
                  <span aria-hidden="true" className="text-zinc-600">·</span>
                  <span className="text-zinc-300 font-medium truncate">
                    feeling {post.feeling}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Options Menu Trigger */}
        <button
          type="button"
          onClick={() => setOptionsOpen(true)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] transition cursor-pointer"
          aria-label="Post options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Caption (if text exists) */}
      {post.caption && (
        <div className="px-5 py-2">
          <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
            {post.caption.length > 200 && !showFullCaption
              ? post.caption.slice(0, 200) + "..."
              : post.caption}
            {post.caption.length > 200 && (
              <button
                type="button"
                onClick={() => setShowFullCaption((prev) => !prev)}
                className="ml-2 text-xs font-semibold text-amber-400 hover:underline"
              >
                {showFullCaption ? "See less" : "See more"}
              </button>
            )}
          </p>
        </div>
      )}

      {/* Post Video or Image with Double-Tap Like */}
      {post.video ? (
        <div
          className="relative w-full overflow-hidden bg-black select-none flex items-center justify-center border-y border-zinc-800/50"
          style={{ minHeight: "280px", maxHeight: "580px" }}
          onDoubleClick={handleMediaDoubleTap}
        >
          <video
            src={post.video}
            loop
            muted={isVideoMuted}
            autoPlay
            playsInline
            controls
            className="w-full h-auto max-h-[580px] object-contain"
          />

          {/* Mute/Unmute quick floating toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsVideoMuted((prev) => !prev);
            }}
            className="absolute bottom-3 right-3 p-2 bg-black/70 hover:bg-black text-white rounded-full transition z-10 cursor-pointer shadow-md"
            title={isVideoMuted ? "Unmute" : "Mute"}
          >
            {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Animated Heart Burst on Double Tap */}
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 animate-in zoom-in-50 fade-in duration-200">
              <FaHeart className="w-24 h-24 text-rose-500 drop-shadow-2xl animate-pulse" />
            </div>
          )}
        </div>
      ) : post.image ? (
        <div
          className="relative w-full overflow-hidden bg-black select-none cursor-pointer flex items-center justify-center border-y border-zinc-800/50"
          style={{ maxHeight: "580px" }}
          onDoubleClick={handleMediaDoubleTap}
        >
          <img
            src={post.image}
            alt="Post media"
            loading="lazy"
            className="w-full h-auto max-h-[580px] object-contain transition-transform duration-300"
          />

          {/* Animated Heart Burst on Double Tap */}
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 animate-in zoom-in-50 fade-in duration-200">
              <FaHeart className="w-24 h-24 text-rose-500 drop-shadow-2xl animate-pulse" />
            </div>
          )}
        </div>
      ) : null}

      {/* Topic Tags (Clean Typography) */}
      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <div className="px-5 pt-3 pb-1 flex flex-wrap gap-2 text-xs">
          {post.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick && onTagClick(tag)}
              className="text-amber-400 hover:text-amber-300 font-medium transition cursor-pointer"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Actions Toolbar */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between text-zinc-300">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            type="button"
            onClick={likeOrDislikeHandler}
            className="flex items-center gap-1.5 hover:text-zinc-100 transition group cursor-pointer"
            title={liked ? "Unlike" : "Like"}
          >
            {liked ? (
              <FaHeart className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
            ) : (
              <FaRegHeart className="w-5 h-5 text-zinc-300 hover:text-rose-400 group-hover:scale-110 transition-transform" />
            )}
            <span className={`text-xs font-semibold ${liked ? "text-rose-400" : "text-zinc-400"}`}>
              {postLike}
            </span>
          </button>

          {/* Comment Trigger */}
          <button
            type="button"
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpenCommentDialog(true);
            }}
            className="flex items-center gap-1.5 hover:text-zinc-100 transition group cursor-pointer text-zinc-300"
            title="Comments"
          >
            <MessageCircle className="w-5 h-5 text-zinc-300 group-hover:text-sky-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-zinc-400">
              {comment.length}
            </span>
          </button>

          {/* Repost Button */}
          <button
            type="button"
            onClick={repostHandler}
            className={`flex items-center gap-1.5 transition group cursor-pointer ${
              isReposted ? "text-emerald-400" : "text-zinc-300 hover:text-zinc-100"
            }`}
            title={isReposted ? "Undo Repost" : "Repost to feed"}
          >
            <Repeat
              className={`w-5 h-5 group-hover:scale-110 transition-transform ${
                isReposted ? "text-emerald-400" : "group-hover:text-emerald-400"
              }`}
            />
            {repostsCount > 0 && (
              <span className={`text-xs font-semibold ${isReposted ? "text-emerald-400" : "text-zinc-400"}`}>
                {repostsCount}
              </span>
            )}
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShareClick}
            className="flex items-center gap-1.5 hover:text-zinc-100 transition group cursor-pointer text-zinc-300"
            title="Share or copy post link"
          >
            {copiedLink ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <Send className="w-5 h-5 text-zinc-300 group-hover:text-amber-400 group-hover:scale-110 transition-transform" />
            )}
            {sharesCount > 0 && (
              <span className="text-xs font-semibold text-zinc-400">
                {sharesCount}
              </span>
            )}
          </button>
        </div>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={bookmarkHandler}
          className="hover:text-zinc-100 transition group cursor-pointer"
          title={isBookmarked ? "Saved" : "Save post"}
        >
          <Bookmark
            className={`w-5 h-5 transition-transform group-hover:scale-110 ${
              isBookmarked
                ? "text-amber-400 fill-amber-400"
                : "text-zinc-400 hover:text-zinc-100"
            }`}
          />
        </button>
      </div>

      {/* Compact Comments Preview */}
      {comment.length > 0 && (
        <div className="px-5 py-2 space-y-1.5 border-t border-white/[0.04]">
          {comment.length > 2 && (
            <button
              type="button"
              onClick={() => {
                dispatch(setSelectedPost(post));
                setOpenCommentDialog(true);
              }}
              className="text-xs text-zinc-400 hover:text-zinc-200 font-medium transition block pb-1 cursor-pointer"
            >
              View all {comment.length} comments
            </button>
          )}

          {comment.slice(-2).map((c) => {
            const commenterName =
              c.author?.username || c.user?.username || "user";
            return (
              <div key={c._id} className="text-xs leading-relaxed flex items-start gap-1.5">
                <span className="font-semibold text-zinc-200 inline-flex items-center gap-1">
                  <span>{commenterName}</span>
                  {Boolean(c.author?.isBlueTag) && <BlueTagBadge size="xs" />}
                  <span>:</span>
                </span>
                <span className="text-zinc-400 flex-1 truncate">{c.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Inline Quick Comment Form */}
      <form
        onSubmit={commentHandler}
        className="px-5 py-3 border-t border-white/[0.04] flex flex-col gap-2 bg-white/[0.02]"
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400/60 transition"
          />

          {text.trim() && (
            <Button
              type="submit"
              size="sm"
              disabled={commentSubmitting}
              className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold h-8 px-3 text-xs rounded-xl transition shadow-sm"
            >
              {commentSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Post"}
            </Button>
          )}
        </div>

        {/* Quick Emoji Reaction Row */}
        <div className="flex items-center gap-1 text-xs text-zinc-400 pt-0.5">
          <Smile className="w-3.5 h-3.5 text-zinc-500 mr-1 flex-shrink-0" />
          {QUICK_EMOJIS.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => setText((prev) => prev + em)}
              className="p-1 hover:bg-zinc-800 rounded transition text-xs cursor-pointer"
              title={`Add ${em}`}
            >
              {em}
            </button>
          ))}
        </div>
      </form>

      {/* Post Details & Full Comments Dialog */}
      <CommentDialog open={openCommentDialog} setOpen={setOpenCommentDialog} />

      {/* Options Menu Dialog */}
      <Dialog open={optionsOpen} onOpenChange={setOptionsOpen}>
        <DialogContent className="max-w-xs p-4 bg-zinc-950 border border-zinc-800 text-white rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-sm font-semibold text-zinc-300">
              Post Options
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-1.5 mt-2">
            {isAuthor && (
              <button
                type="button"
                onClick={() => {
                  setOptionsOpen(false);
                  setEditDialogOpen(true);
                }}
                className="flex items-center gap-2.5 p-2.5 text-xs text-zinc-200 hover:bg-zinc-800 rounded-xl transition cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-[#FACE25]" />
                Edit Post
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                handleShareClick();
                setOptionsOpen(false);
              }}
              className="flex items-center gap-2.5 p-2.5 text-xs text-zinc-200 hover:bg-zinc-800 rounded-xl transition cursor-pointer"
            >
              <Copy className="w-4 h-4 text-sky-400" />
              Copy Post Link
            </button>

            <button
              type="button"
              onClick={() => {
                setOptionsOpen(false);
                handleShareToChat();
              }}
              className="flex items-center gap-2.5 p-2.5 text-xs text-zinc-200 hover:bg-zinc-800 rounded-xl transition cursor-pointer"
            >
              <Send className="w-4 h-4 text-amber-400" />
              Share to Chat
            </button>

            {isAuthor ? (
              <button
                type="button"
                onClick={() => {
                  setOptionsOpen(false);
                  setDeleteDialogOpen(true);
                }}
                className="flex items-center gap-2.5 p-2.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                Delete Post
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOptionsOpen(false);
                  setReportDialogOpen(true);
                }}
                className="flex items-center gap-2.5 p-2.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
              >
                <Flag className="w-4 h-4 text-rose-400" />
                Report Post
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Post Modal */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md bg-zinc-950 border border-zinc-800 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#FACE25]" /> Edit Post
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Caption</label>
              <textarea
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#FACE25]"
                placeholder="Update caption..."
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Location</label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="e.g. Zurich, Switzerland"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#FACE25]"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Feeling / Mood</label>
              <input
                type="text"
                value={editFeeling}
                onChange={(e) => setEditFeeling(e.target.value)}
                placeholder="e.g. 🚀 Shipping or ☕ Focused"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#FACE25]"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={editTagsInput}
                onChange={(e) => setEditTagsInput(e.target.value)}
                placeholder="e.g. design, coding, nature"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#FACE25]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditDialogOpen(false)}
                className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={editLoading}
                onClick={handleSaveEdit}
                className="bg-[#FACE25] hover:bg-[#d8c222] text-zinc-950 font-semibold"
              >
                {editLoading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm p-6 bg-zinc-950 border border-zinc-800 text-white rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-rose-500 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete Post
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-zinc-300 mt-2">
            Are you sure you want to permanently delete this post? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={deletePostHandler}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report & Hide Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="max-w-sm bg-zinc-950 border border-zinc-800 text-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-400" /> Report Post
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-zinc-400 mt-1">
            Why are you reporting this post? Select all that apply:
          </p>

          <div className="flex flex-col gap-2 my-4">
            {reportOptions.map((reason) => (
              <label
                key={reason}
                className="flex items-center gap-2.5 text-xs text-zinc-300 cursor-pointer p-1.5 rounded-lg hover:bg-zinc-900 transition"
              >
                <input
                  type="checkbox"
                  checked={reportReasons.includes(reason)}
                  onChange={() => toggleReportReason(reason)}
                  className="rounded border-zinc-700 text-[#FACE25] focus:ring-0"
                />
                {reason}
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReportDialogOpen(false)}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={reportPostHandler}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium"
            >
              Submit Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
};

export default Post;
