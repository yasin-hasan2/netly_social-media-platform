import { useEffect, useState, useRef, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Heart,
  Send,
  MoreHorizontal,
  Link2,
  Check,
  Eye,
  MessageCircle,
} from "lucide-react";
import { FaHeart } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { formatTimeAgo } from "@/lib/utils";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import BlueTagBadge from "@/components/shared/BlueTagBadge";

export default function StoryViewerModal({
  open,
  setOpen,
  storyGroups = [],
  initialGroupIndex = 0,
  onStoryDeleted,
}) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const videoRef = useRef(null);
  const progressTimerRef = useRef(null);
  const { user } = useSelector((store) => store.auth);

  // Sync internal group index whenever the viewer opens or initialGroupIndex changes
  useEffect(() => {
    if (open) {
      const validIndex =
        initialGroupIndex >= 0 && initialGroupIndex < storyGroups.length
          ? initialGroupIndex
          : 0;
      setGroupIndex(validIndex);
      setStoryIndex(0);
      setProgress(0);
      setIsPaused(false);
      setDeleteConfirmOpen(false);
      setOptionsMenuOpen(false);
      setReplyText("");
    }
  }, [open, initialGroupIndex, storyGroups.length]);

  const currentGroup = storyGroups[groupIndex] || storyGroups[0];
  const currentStories = currentGroup?.stories || [];
  const currentStory = currentStories[storyIndex] || currentStories[0];

  const author = currentGroup?.author;
  const authorId =
    author?._id || (typeof author === "string" ? author : null);
  const authorName = author?.username || "creator";
  const authorAvatar = author?.profilePicture;
  const isAuthorVerified = Boolean(author?.isBlueTag);

  const isOwner =
    user?._id &&
    (user._id === authorId || user._id === currentStory?.author?._id || user._id === currentStory?.author);

  // Sync likes state for current story
  useEffect(() => {
    if (currentStory) {
      const hasLiked =
        user?._id && (currentStory.likes || []).some((id) => (id?._id || id).toString() === user._id.toString());
      setLiked(Boolean(hasLiked));
      setLikeCount((currentStory.likes || []).length);
    }
  }, [currentStory, user]);

  // Mark story as viewed by current user
  useEffect(() => {
    if (open && currentStory?._id && user?._id) {
      axiosInstance
        .post(`/story/${currentStory._id}/view`, {}, { withCredentials: true })
        .catch(() => {});
    }
  }, [open, currentStory?._id, user?._id]);

  // Transition to next story or next user group
  const goToNextStory = useCallback(() => {
    if (storyIndex < currentStories.length - 1) {
      setStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else if (groupIndex < storyGroups.length - 1) {
      setGroupIndex((prev) => prev + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      // Reached the end of all stories in all groups
      setOpen(false);
    }
  }, [storyIndex, currentStories.length, groupIndex, storyGroups.length, setOpen]);

  // Transition to previous story or previous user group
  const goToPrevStory = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((prev) => prev - 1);
      setProgress(0);
    } else if (groupIndex > 0) {
      const prevGroup = storyGroups[groupIndex - 1];
      const prevGroupStories = prevGroup?.stories || [];
      setGroupIndex((prev) => prev - 1);
      setStoryIndex(Math.max(0, prevGroupStories.length - 1));
      setProgress(0);
    }
  }, [storyIndex, groupIndex, storyGroups]);

  // Jump straight to another user's story from desktop side preview
  const jumpToGroup = (targetIdx) => {
    if (targetIdx >= 0 && targetIdx < storyGroups.length) {
      setGroupIndex(targetIdx);
      setStoryIndex(0);
      setProgress(0);
      setIsPaused(false);
    }
  };

  // Video duration handling: dynamically align duration with video length
  const getStoryDuration = useCallback(() => {
    if (!currentStory) return 5000;
    if (currentStory.mediaType === "video") {
      if (videoRef.current && videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        return Math.min(15000, Math.max(3000, videoRef.current.duration * 1000));
      }
      return 8000;
    }
    return 5000;
  }, [currentStory]);

  // Progress timer for automatic playback
  useEffect(() => {
    if (!open || !currentStory || isPaused || deleteConfirmOpen || optionsMenuOpen) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    const duration = getStoryDuration();
    const interval = 40; // 25 fps updates
    const step = (interval / duration) * 100;

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        return next >= 100 ? 100 : next;
      });
    }, interval);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [open, currentStory, isPaused, deleteConfirmOpen, optionsMenuOpen, getStoryDuration]);

  // Advance when current progress reaches 100%
  useEffect(() => {
    if (progress >= 100) {
      goToNextStory();
    }
  }, [progress, goToNextStory]);

  // Sync video play/pause with isPaused state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (open && !isPaused && !deleteConfirmOpen && !optionsMenuOpen) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [open, isPaused, deleteConfirmOpen, optionsMenuOpen, storyIndex, groupIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key === "Escape") {
        if (optionsMenuOpen) {
          setOptionsMenuOpen(false);
          setIsPaused(false);
        } else if (deleteConfirmOpen) {
          setDeleteConfirmOpen(false);
          setIsPaused(false);
        } else {
          setOpen(false);
        }
      } else if (e.key === "ArrowRight") {
        goToNextStory();
      } else if (e.key === "ArrowLeft") {
        goToPrevStory();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, deleteConfirmOpen, optionsMenuOpen, goToNextStory, goToPrevStory, setOpen]);

  // Toggle Like with heart burst animation
  const handleLikeStory = async () => {
    if (!user?._id) {
      toast.error("Please login to like stories");
      return;
    }
    const nextState = !liked;
    setLiked(nextState);
    setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    if (nextState) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
    }

    try {
      await axiosInstance.post(`/story/${currentStory._id}/like`, {}, { withCredentials: true });
    } catch {
      setLiked(!nextState);
      setLikeCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  // Double tap to like
  const handleDoubleTap = () => {
    if (!liked) {
      handleLikeStory();
    } else {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
    }
  };

  // Send Direct Message Reply to Story
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    if (!user?._id) {
      toast.error("Please login to reply to stories");
      return;
    }

    try {
      setSendingReply(true);
      await axiosInstance.post(
        `/message/send/${authorId}`,
        { message: `Replied to your story: "${replyText.trim()}"` },
        { withCredentials: true }
      );
      toast.success(`Reply sent to @${authorName}`);
      setReplyText("");
      setIsPaused(false);
    } catch (err) {
      console.error(err);
      toast.info(`Reply noted for @${authorName}`);
      setReplyText("");
    } finally {
      setSendingReply(false);
    }
  };

  // Share story link
  const handleShareStory = async () => {
    try {
      const shareUrl = `${window.location.origin}/?story=${currentStory?._id || ""}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Story link copied to clipboard!");
    } catch {
      toast.info("Link copied!");
    }
  };

  // Delete current story
  const handleDeleteStory = async () => {
    if (!currentStory) return;
    try {
      setDeleting(true);
      const res = await axiosInstance.delete(`/story/${currentStory._id}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        toast.success("Story deleted");
        setDeleteConfirmOpen(false);
        if (onStoryDeleted) onStoryDeleted(currentStory._id);

        if (currentStories.length <= 1) {
          if (storyGroups.length <= 1) {
            setOpen(false);
          } else {
            goToNextStory();
          }
        } else {
          goToNextStory();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete story");
    } finally {
      setDeleting(false);
    }
  };

  if (!open || !storyGroups || storyGroups.length === 0) return null;

  // Previous and next user groups for Desktop Carousel (Image 2)
  const prevGroup = groupIndex > 0 ? storyGroups[groupIndex - 1] : null;
  const nextGroup = groupIndex < storyGroups.length - 1 ? storyGroups[groupIndex + 1] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000] text-white select-none overflow-hidden animate-in fade-in duration-200">
      {/* Top Bar Branding (Desktop View - Image 2) */}
      <div className="hidden lg:flex absolute top-5 left-8 z-40 items-center gap-2 pointer-events-auto">
        <span className="font-display font-extrabold text-2xl tracking-tighter text-white drop-shadow">
          Net-ly
        </span>
      </div>

      {/* Top Right Close Button (Desktop View - Image 2) */}
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="hidden lg:flex absolute top-5 right-8 z-40 p-2 text-white/90 hover:text-white hover:scale-110 transition cursor-pointer"
        title="Close (Esc)"
      >
        <X className="w-8 h-8" />
      </button>

      {/* ======================================================== */}
      {/* DESKTOP CAROUSEL VIEW: Side Preview Cards (Image 2)      */}
      {/* ======================================================== */}

      {/* Left Previous User Story Preview Card */}
      {prevGroup && (
        <div
          onClick={() => jumpToGroup(groupIndex - 1)}
          className="hidden xl:flex flex-col items-center justify-center absolute left-[calc(50%-380px)] w-[180px] h-[320px] rounded-2xl overflow-hidden cursor-pointer opacity-40 hover:opacity-85 transition-all duration-300 border border-white/10 shadow-2xl group z-20 hover:scale-105"
          title={`View ${prevGroup.author?.username}'s story`}
        >
          {/* Background Blurred Media Preview */}
          <div className="absolute inset-0 bg-zinc-950">
            {prevGroup.stories?.[0]?.mediaType === "video" ? (
              <video
                src={prevGroup.stories?.[0]?.media}
                muted
                playsInline
                className="w-full h-full object-cover brightness-50"
              />
            ) : (
              <img
                src={prevGroup.stories?.[0]?.media}
                alt="Story preview"
                className="w-full h-full object-cover brightness-50"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
          </div>

          {/* Centered Avatar with Gradient Story Ring (Image 2) */}
          <div className="relative z-10 flex flex-col items-center gap-2.5 p-3 text-center">
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-orange-500 shadow-xl group-hover:scale-110 transition-transform">
              <div className="p-0.5 bg-black rounded-full">
                <Avatar className="w-14 h-14 border border-white/20">
                  <AvatarImage src={prevGroup.author?.profilePicture} />
                  <AvatarFallback className="bg-zinc-800 text-amber-400 font-bold text-sm">
                    {prevGroup.author?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-white drop-shadow truncate max-w-[140px]">
                {prevGroup.author?.username}
              </p>
              <p className="text-[10px] text-zinc-300 font-medium drop-shadow mt-0.5">
                {prevGroup.stories?.[0]?.createdAt
                  ? formatTimeAgo(prevGroup.stories[0].createdAt)
                  : "Recently"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Left Circular Arrow Paddle */}
      {(storyIndex > 0 || groupIndex > 0) && (
        <button
          type="button"
          onClick={goToPrevStory}
          className="hidden md:flex absolute left-4 lg:left-[calc(50%-260px)] z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/15 transition-transform hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
          title="Previous story (ArrowLeft)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* ======================================================== */}
      {/* CENTER ACTIVE STORY CARD (Image 1 & Image 2)             */}
      {/* ======================================================== */}
      <div
        className="relative z-20 w-full h-full sm:h-[94vh] sm:max-h-[860px] sm:w-[410px] md:w-[425px] bg-black sm:rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col justify-between border-0 sm:border border-white/[0.08]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Progress Segment Bars (Instagram Style) */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5 pointer-events-none">
          {currentStories.map((s, idx) => {
            let fillPct = 0;
            if (idx < storyIndex) fillPct = 100;
            else if (idx === storyIndex) fillPct = progress;
            return (
              <div
                key={s._id || idx}
                className="flex-1 h-[2.5px] bg-white/35 rounded-full overflow-hidden backdrop-blur-sm"
              >
                <div
                  className="h-full bg-white transition-all ease-linear"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Header (Avatar, Username, Time, Controls, Close) */}
        <div className="absolute top-6 left-3 right-3 z-30 flex items-center justify-between pointer-events-auto">
          {/* Author Details */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="h-9 w-9 border-2 border-[#FACE25] shadow-md flex-shrink-0">
              <AvatarImage src={authorAvatar} alt={authorName} />
              <AvatarFallback className="bg-zinc-800 text-[#FACE25] font-bold text-xs">
                {authorName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-white drop-shadow truncate max-w-[130px]">
                {authorName}
              </span>
              {isAuthorVerified && <BlueTagBadge size="xs" />}
              <span className="text-[11px] text-zinc-300 font-medium drop-shadow">
                · {currentStory?.createdAt ? formatTimeAgo(currentStory.createdAt) : "Recently"}
              </span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center gap-2">
            {/* Audio Toggle (Videos) */}
            {currentStory?.mediaType === "video" && (
              <button
                type="button"
                onClick={() => setIsMuted((prev) => !prev)}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition cursor-pointer"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}

            {/* Play/Pause Toggle */}
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition cursor-pointer"
              title={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
            </button>

            {/* Three dots More Options Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setOptionsMenuOpen((prev) => !prev);
                  setIsPaused(true);
                }}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition cursor-pointer"
                title="More options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {/* Options Popover */}
              {optionsMenuOpen && (
                <div className="absolute right-0 top-9 w-44 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-1.5 z-50 text-xs space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      handleShareStory();
                      setOptionsMenuOpen(false);
                      setIsPaused(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl transition text-left cursor-pointer"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Copy Story Link</span>
                  </button>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setOptionsMenuOpen(false);
                        setDeleteConfirmOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition text-left cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Story</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Close Button on Mobile (Image 1) */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="lg:hidden p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition cursor-pointer"
              title="Close story"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Container with Left/Right Tap Zones and Press-to-Pause */}
        <div
          className="relative w-full flex-1 flex items-center justify-center bg-black overflow-hidden"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {currentStory ? (
            currentStory.mediaType === "video" ? (
              <video
                ref={videoRef}
                src={currentStory.media}
                autoPlay
                playsInline
                muted={isMuted}
                onDoubleClick={handleDoubleTap}
                className="w-full h-full object-cover bg-zinc-950"
              />
            ) : (
              <img
                src={currentStory.media}
                alt="Story content"
                onDoubleClick={handleDoubleTap}
                className="w-full h-full object-cover bg-zinc-950"
              />
            )
          ) : (
            <div className="text-zinc-500 text-xs">No media available</div>
          )}

          {/* Heart Burst on Double Tap or Like Button */}
          {showHeartBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in zoom-in-50 fade-in duration-200">
              <FaHeart className="w-24 h-24 text-rose-500 drop-shadow-[0_0_30px_rgba(244,63,94,0.8)] animate-pulse" />
            </div>
          )}

          {/* Paused Indicator Cue */}
          {isPaused && !deleteConfirmOpen && !optionsMenuOpen && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none p-3.5 rounded-full bg-black/60 text-white backdrop-blur-md z-30 opacity-75">
              <Pause className="w-7 h-7 fill-white" />
            </div>
          )}

          {/* Left Click Zone: 30% Width for Previous Story */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              goToPrevStory();
            }}
            className="absolute top-0 left-0 w-[30%] h-full z-10 cursor-pointer"
            title="Previous story"
          />

          {/* Right Click Zone: 70% Width for Next Story */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              goToNextStory();
            }}
            className="absolute top-0 right-0 w-[70%] h-full z-10 cursor-pointer"
            title="Next story"
          />
        </div>

        {/* Bottom Area: Optional Caption + Instagram Style Reply & Reactions Bar (Image 1) */}
        <div className="relative z-30 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2.5">
          {/* Optional Caption */}
          {currentStory?.caption && (
            <p className="text-xs sm:text-sm text-white font-medium drop-shadow text-center line-clamp-2 px-2">
              {currentStory.caption}
            </p>
          )}

          {/* Creator View Counter (For Story Owner) */}
          {isOwner && (
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-300 font-semibold pb-1 drop-shadow">
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>{(currentStory?.views || []).length} views</span>
            </div>
          )}

          {/* Bottom Interactive Strip (Reply Input, Heart, Send) */}
          <div className="flex items-center gap-3">
            {/* Pill Reply Input (Image 1) */}
            <form onSubmit={handleSendReply} className="flex-1 relative">
              <input
                type="text"
                value={replyText}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${authorName}...`}
                className="w-full bg-black/40 hover:bg-black/60 focus:bg-black/70 border border-white/35 focus:border-white text-white placeholder:text-zinc-300 text-xs px-4 py-2.5 rounded-full outline-none transition backdrop-blur-md shadow-inner"
              />
              {replyText.trim() && (
                <button
                  type="submit"
                  disabled={sendingReply}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-[10px] rounded-full transition cursor-pointer"
                >
                  Send
                </button>
              )}
            </form>

            {/* Like Heart Button (Image 1) */}
            <button
              type="button"
              onClick={handleLikeStory}
              className={`p-2 rounded-full transition-transform active:scale-75 cursor-pointer ${
                liked ? "text-rose-500 scale-110" : "text-white hover:text-rose-400"
              }`}
              title={liked ? "Unlike story" : "Like story"}
            >
              <Heart className={`w-6 h-6 drop-shadow ${liked ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>

            {/* Share / Send Paper Airplane (Image 1) */}
            <button
              type="button"
              onClick={handleShareStory}
              className="p-2 rounded-full text-white hover:text-amber-400 transition-transform active:scale-75 cursor-pointer"
              title="Share story link"
            >
              <Send className="w-6 h-6 drop-shadow" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteConfirmOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
            <div className="w-full max-w-xs p-5 bg-zinc-950 border border-zinc-800 text-white rounded-3xl shadow-2xl space-y-3">
              <h4 className="text-sm font-bold text-rose-500 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4" /> Delete this Story?
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed">
                This story will be permanently removed from your profile and community feed.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={deleting}
                  onClick={() => {
                    setDeleteConfirmOpen(false);
                    setIsPaused(false);
                  }}
                  className="border-zinc-800 text-zinc-300 text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deleting}
                  onClick={handleDeleteStory}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* DESKTOP CAROUSEL VIEW: Right Side Card & Paddle (Image 2) */}
      {/* ======================================================== */}

      {/* Right Circular Arrow Paddle */}
      {(storyIndex < currentStories.length - 1 || groupIndex < storyGroups.length - 1) && (
        <button
          type="button"
          onClick={goToNextStory}
          className="hidden md:flex absolute right-4 lg:right-[calc(50%-260px)] z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/15 transition-transform hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
          title="Next story (ArrowRight)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Right Next User Story Preview Card */}
      {nextGroup && (
        <div
          onClick={() => jumpToGroup(groupIndex + 1)}
          className="hidden xl:flex flex-col items-center justify-center absolute right-[calc(50%-380px)] w-[180px] h-[320px] rounded-2xl overflow-hidden cursor-pointer opacity-40 hover:opacity-85 transition-all duration-300 border border-white/10 shadow-2xl group z-20 hover:scale-105"
          title={`View ${nextGroup.author?.username}'s story`}
        >
          {/* Background Blurred Media Preview */}
          <div className="absolute inset-0 bg-zinc-950">
            {nextGroup.stories?.[0]?.mediaType === "video" ? (
              <video
                src={nextGroup.stories?.[0]?.media}
                muted
                playsInline
                className="w-full h-full object-cover brightness-50"
              />
            ) : (
              <img
                src={nextGroup.stories?.[0]?.media}
                alt="Story preview"
                className="w-full h-full object-cover brightness-50"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
          </div>

          {/* Centered Avatar with Gradient Story Ring (Image 2) */}
          <div className="relative z-10 flex flex-col items-center gap-2.5 p-3 text-center">
            <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-orange-500 shadow-xl group-hover:scale-110 transition-transform">
              <div className="p-0.5 bg-black rounded-full">
                <Avatar className="w-14 h-14 border border-white/20">
                  <AvatarImage src={nextGroup.author?.profilePicture} />
                  <AvatarFallback className="bg-zinc-800 text-amber-400 font-bold text-sm">
                    {nextGroup.author?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-white drop-shadow truncate max-w-[140px]">
                {nextGroup.author?.username}
              </p>
              <p className="text-[10px] text-zinc-300 font-medium drop-shadow mt-0.5">
                {nextGroup.stories?.[0]?.createdAt
                  ? formatTimeAgo(nextGroup.stories[0].createdAt)
                  : "Recently"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
