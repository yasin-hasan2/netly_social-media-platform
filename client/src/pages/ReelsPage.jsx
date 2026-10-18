import { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { axiosInstance } from "@/lib/axios";
import { setReels, setSelectedPost, setPosts } from "@/redux/postSlice";
import {
  Heart,
  MessageCircle,
  Repeat,
  Send,
  Volume2,
  VolumeX,
  Play,
  ChevronDown,
  ChevronUp,
  PlusSquare,
  Sparkles,
  MapPin,
  Check,
  Trash2,
} from "lucide-react";
import { FaHeart } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { formatNumber } from "@/lib/utils";
import CommentDialog from "@/components/shared/CommentDialog";
import CreatePost from "@/components/shared/CreatePost";
import useFollowHandler from "@/hooks/useFollowHandler";
import BlueTagBadge from "@/components/shared/BlueTagBadge";

function ReelItem({
  reel,
  isActive,
  isGlobalMuted,
  toggleGlobalMuted,
  onOpenComments,
  onRequestDelete,
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState((reel?.likes || []).includes(reel?.currentUserId));
  const [likeCount, setLikeCount] = useState((reel?.likes || []).length);
  const [reposted, setReposted] = useState((reel?.reposts || []).includes(reel?.currentUserId));
  const [repostCount, setRepostCount] = useState((reel?.reposts || []).length);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showFullCaption, setShowFullCaption] = useState(false);

  const authorId = reel?.author?._id || (typeof reel?.author === "string" ? reel?.author : null);
  const isAuthor =
    reel?.currentUserId &&
    (reel.currentUserId === authorId || reel.currentUserId === reel?.author?._id);

  const { following: isFollowing, followHandler: handleFollowAuthor, loading: followLoading } =
    useFollowHandler(authorId);

  // Manage playback based on whether this reel item is currently in active view
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay with audio was blocked; retry muted
            video.muted = true;
            video
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => setIsPlaying(false));
          });
      }
    } else {
      video.pause();
      setIsPlaying(false);
      setProgress(0);
    }
  }, [isActive]);

  // Sync mute property
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isGlobalMuted;
    }
  }, [isGlobalMuted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    setProgress(pct);
  };

  const handleLike = async () => {
    if (!reel.currentUserId) {
      toast.error("Please login to like reels");
      return;
    }
    const nextState = !liked;
    setLiked(nextState);
    setLikeCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const action = nextState ? "like" : "dislike";
      await axiosInstance.get(`/post/${reel._id}/${action}`, { withCredentials: true });
    } catch {
      setLiked(!nextState);
      setLikeCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
      toast.error("Failed to update like");
    }
  };

  const handleDoubleTap = () => {
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
    if (!liked) handleLike();
  };

  const handleRepost = async () => {
    if (!reel.currentUserId) {
      toast.error("Please login to repost");
      return;
    }
    const nextState = !reposted;
    setReposted(nextState);
    setRepostCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await axiosInstance.post(`/post/${reel._id}/repost`, {}, { withCredentials: true });
      if (res.data?.success) {
        toast.success(res.data.message);
      }
    } catch {
      setReposted(!nextState);
      setRepostCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
      toast.error("Failed to repost reel");
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/reels`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      try {
        await axiosInstance.post(`/post/${reel._id}/share`, {}, { withCredentials: true });
      } catch {
        // quiet
      }
      toast.success("Reel link copied to clipboard!");
    } catch {
      toast.info("Link copied!");
    }
  };

  return (
    <div className="relative w-full h-full max-h-[82vh] sm:max-h-[86vh] bg-black rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center select-none group border border-zinc-800">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={reel.video}
        loop
        playsInline
        muted={isGlobalMuted}
        onClick={togglePlay}
        onDoubleClick={handleDoubleTap}
        onTimeUpdate={handleTimeUpdate}
        className="w-full h-full object-cover cursor-pointer bg-zinc-950"
      />

      {/* Heart Burst on Double Tap */}
      {showHeartBurst && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in zoom-in-50 fade-in duration-200">
          <FaHeart className="w-24 h-24 text-rose-500 drop-shadow-2xl animate-pulse" />
        </div>
      )}

      {/* Play/Pause Center Overlay Cue */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-auto cursor-pointer z-20"
        >
          <div className="p-4 rounded-full bg-black/60 text-white backdrop-blur-md shadow-2xl transition-transform hover:scale-110">
            <Play className="w-10 h-10 fill-white translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 pointer-events-auto">
          <Sparkles className="w-3.5 h-3.5 text-[#FACE25]" />
          <span className="text-xs font-semibold text-white tracking-wide">Reels</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Delete Option for Author */}
          {isAuthor && (
            <button
              type="button"
              onClick={() => onRequestDelete(reel)}
              className="p-2.5 rounded-full bg-black/50 hover:bg-rose-950/80 backdrop-blur-md text-zinc-300 hover:text-rose-400 border border-white/10 transition cursor-pointer"
              title="Delete this reel"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Global Mute Toggle */}
          <button
            type="button"
            onClick={toggleGlobalMuted}
            className="p-2.5 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md text-white border border-white/10 transition cursor-pointer"
            title={isGlobalMuted ? "Unmute audio" : "Mute audio"}
          >
            {isGlobalMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Bottom Info Gradient Scrim & Author Metadata */}
      <div className="absolute bottom-0 left-0 right-16 p-4 sm:p-5 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20 pointer-events-auto">
        <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5">
          <Link to={`/profile/${authorId || ""}`} className="flex-shrink-0 group">
            <Avatar className="w-10 h-10 border-2 border-[#FACE25]">
              <AvatarImage src={reel.author?.profilePicture} />
              <AvatarFallback className="bg-zinc-800 text-[#FACE25] font-semibold text-xs">
                {reel.author?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 min-w-0">
                <Link
                  to={`/profile/${authorId || ""}`}
                  className="text-sm font-bold text-white hover:text-[#FACE25] transition truncate"
                >
                  {reel.author?.username || "creator"}
                </Link>
                {Boolean(reel.author?.isBlueTag) && <BlueTagBadge size="xs" />}
              </div>

              {!isAuthor && reel.currentUserId && authorId && (
                <button
                  type="button"
                  onClick={handleFollowAuthor}
                  disabled={followLoading}
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                    isFollowing
                      ? "border-zinc-600 text-zinc-300 hover:border-red-500 hover:text-red-400"
                      : "border-[#FACE25] text-zinc-950 bg-[#FACE25] hover:bg-[#d8c222]"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>

            {reel.location && (
              <p className="text-[11px] text-zinc-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#FACE25]" />
                {reel.location}
              </p>
            )}
          </div>
        </div>

        {/* Caption */}
        {reel.caption && (
          <div className="mb-2">
            <p
              className={`text-xs sm:text-sm text-zinc-100 leading-relaxed font-normal drop-shadow ${
                showFullCaption ? "" : "line-clamp-2"
              }`}
            >
              {reel.caption}
            </p>
            {reel.caption.length > 90 && (
              <button
                type="button"
                onClick={() => setShowFullCaption(!showFullCaption)}
                className="text-[11px] font-semibold text-zinc-400 hover:text-white transition mt-0.5"
              >
                {showFullCaption ? "less" : "...more"}
              </button>
            )}
          </div>
        )}

        {/* Tags */}
        {reel.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 text-xs text-[#FACE25] font-medium">
            {reel.tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Right Side Action Strip */}
      <div className="absolute right-3 bottom-6 flex flex-col items-center gap-4 sm:gap-5 z-20 pointer-events-auto">
        {/* Like */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={handleLike}
            className={`p-3 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-md border border-white/10 transition-transform active:scale-90 cursor-pointer ${
              liked ? "text-rose-500" : "text-white hover:text-rose-400"
            }`}
            title={liked ? "Unlike" : "Like"}
          >
            <Heart className={`w-6 h-6 ${liked ? "fill-rose-500 text-rose-500" : ""}`} />
          </button>
          <span className="text-[11px] font-semibold text-white drop-shadow">
            {formatNumber(likeCount)}
          </span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenComments(reel)}
            className="p-3 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-md border border-white/10 text-white hover:text-sky-400 transition-transform active:scale-90 cursor-pointer"
            title="Comments"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          <span className="text-[11px] font-semibold text-white drop-shadow">
            {formatNumber((reel.comments || []).length)}
          </span>
        </div>

        {/* Repost */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={handleRepost}
            className={`p-3 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-md border border-white/10 transition-transform active:scale-90 cursor-pointer ${
              reposted ? "text-emerald-400" : "text-white hover:text-emerald-400"
            }`}
            title={reposted ? "Undo Repost" : "Repost Reel"}
          >
            <Repeat className="w-6 h-6" />
          </button>
          <span
            className={`text-[11px] font-semibold drop-shadow ${
              reposted ? "text-emerald-400" : "text-white"
            }`}
          >
            {formatNumber(repostCount)}
          </span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={handleShare}
            className="p-3 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-md border border-white/10 text-white hover:text-[#FACE25] transition-transform active:scale-90 cursor-pointer"
            title="Share Reel"
          >
            {copiedLink ? (
              <Check className="w-6 h-6 text-emerald-400" />
            ) : (
              <Send className="w-6 h-6" />
            )}
          </button>
          <span className="text-[11px] font-semibold text-white drop-shadow">
            {formatNumber(reel.sharesCount || 0)}
          </span>
        </div>

        {/* Delete button on side strip for authors */}
        {isAuthor && (
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => onRequestDelete(reel)}
              className="p-3 rounded-full bg-black/45 hover:bg-rose-950/80 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-rose-400 transition-transform active:scale-90 cursor-pointer"
              title="Delete Reel"
            >
              <Trash2 className="w-5 h-5 text-rose-400" />
            </button>
            <span className="text-[10px] font-semibold text-rose-400 drop-shadow">Delete</span>
          </div>
        )}
      </div>

      {/* Video Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15 z-30 overflow-hidden">
        <div
          className="h-full bg-[#FACE25] transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(250,206,37,0.7)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function ReelsPage() {
  const dispatch = useDispatch();
  const { reels, posts } = useSelector((store) => store.post);
  const { user } = useSelector((store) => store.auth);

  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isGlobalMuted, setIsGlobalMuted] = useState(true);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [createReelOpen, setCreateReelOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Delete modal state
  const [reelToDelete, setReelToDelete] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/post/reels", { withCredentials: true });
        if (res.data?.success) {
          dispatch(setReels(res.data.reels || []));
        }
      } catch (err) {
        console.error("Failed to load reels:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, [dispatch]);

  const activeReels = (reels || []).filter((r) => r.video && r.video.trim());

  // Scroll to a specific reel by index with smooth snapping
  const scrollToReel = useCallback((index) => {
    const el = document.getElementById(`reel-item-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleNext = useCallback(() => {
    if (activeIndex < activeReels.length - 1) {
      scrollToReel(activeIndex + 1);
    }
  }, [activeIndex, activeReels.length, scrollToReel]);

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      scrollToReel(activeIndex - 1);
    }
  }, [activeIndex, scrollToReel]);

  // IntersectionObserver to detect which reel is in view as the user scrolls like a feed
  useEffect(() => {
    const container = containerRef.current;
    if (!container || activeReels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    const items = container.querySelectorAll(".reel-snap-item");
    items.forEach((item) => observer.observe(item));

    return () => {
      items.forEach((item) => observer.unobserve(item));
    };
  }, [activeReels.length]);

  // Keyboard navigation (ArrowDown / ArrowUp)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (deleteModalOpen || commentDialogOpen || createReelOpen) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, deleteModalOpen, commentDialogOpen, createReelOpen]);

  const handleOpenComments = (reel) => {
    dispatch(setSelectedPost(reel));
    setCommentDialogOpen(true);
  };

  const handleRequestDelete = (reel) => {
    setReelToDelete(reel);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reelToDelete) return;
    try {
      setDeleting(true);
      const res = await axiosInstance.delete(`/post/delete/${reelToDelete._id}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        toast.success(res.data.message || "Reel deleted successfully");
        const updatedReels = (reels || []).filter((r) => r._id !== reelToDelete._id);
        const updatedPosts = (posts || []).filter((p) => p._id !== reelToDelete._id);
        dispatch(setReels(updatedReels));
        dispatch(setPosts(updatedPosts));

        if (activeIndex >= updatedReels.length && updatedReels.length > 0) {
          setActiveIndex(updatedReels.length - 1);
        }
        setDeleteModalOpen(false);
        setReelToDelete(null);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete reel");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-62px)] flex justify-center items-center overflow-hidden bg-[#090D16]">
      {/* Background ambient lighting */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 20%, rgba(250, 206, 37, 0.08), transparent 50%), radial-gradient(circle at 80% 80%, rgba(56, 189, 248, 0.05), transparent 50%)",
        }}
      />

      {loading && activeReels.length === 0 ? (
        <div className="w-full max-w-[420px] h-[82vh] flex flex-col items-center justify-center bg-zinc-950/80 rounded-3xl border border-zinc-800 text-zinc-400 gap-3 shadow-2xl">
          <div className="w-9 h-9 border-2 border-[#FACE25] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading Reels...</p>
        </div>
      ) : activeReels.length === 0 ? (
        <div className="w-full max-w-[420px] h-[82vh] flex flex-col items-center justify-center bg-zinc-950/80 rounded-3xl border border-zinc-800 p-8 text-center gap-4 shadow-2xl">
          <div className="p-4 bg-zinc-900 rounded-2xl text-[#FACE25] shadow-inner">
            <Sparkles className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-white">No Reels Yet</h3>
          <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
            Be the first creator to share a vertical video reel on Net-ly! Scroll through your community's videos directly in this feed.
          </p>
          <button
            type="button"
            onClick={() => setCreateReelOpen(true)}
            className="mt-3 bg-[#FACE25] hover:bg-[#d8c222] text-zinc-950 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/10 transition-transform hover:scale-105"
          >
            <PlusSquare className="w-4 h-4" />
            Create First Reel
          </button>
        </div>
      ) : (
        <div className="relative w-full h-full flex justify-center items-center">
          {/* Continuous Vertical Feed Scroll Container */}
          <div
            ref={containerRef}
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth flex flex-col items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-2"
          >
            {activeReels.map((reel, idx) => (
              <div
                key={reel._id}
                id={`reel-item-${idx}`}
                data-index={idx}
                className="reel-snap-item w-full max-w-[420px] sm:max-w-[430px] h-[calc(100vh-76px)] sm:h-[calc(100vh-80px)] flex items-center justify-center p-2 snap-start snap-always flex-shrink-0"
              >
                <ReelItem
                  reel={{
                    ...reel,
                    currentUserId: user?._id,
                  }}
                  isActive={idx === activeIndex}
                  isGlobalMuted={isGlobalMuted}
                  toggleGlobalMuted={() => setIsGlobalMuted((prev) => !prev)}
                  onOpenComments={handleOpenComments}
                  onRequestDelete={handleRequestDelete}
                />
              </div>
            ))}
          </div>

          {/* Floating Navigation Controls for Desktop */}
          <div className="hidden xl:flex flex-col gap-3 absolute right-[calc(50%-290px)] top-1/2 -translate-y-1/2 z-30">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className="p-3 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white border border-zinc-700/60 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xl cursor-pointer hover:scale-110 active:scale-95"
              title="Previous Reel (Arrow Up)"
            >
              <ChevronUp className="w-5 h-5" />
            </button>

            <div className="px-2 py-1 bg-zinc-900/80 backdrop-blur-md rounded-full border border-zinc-800 text-center font-mono text-[10px] text-zinc-400">
              {activeIndex + 1}/{activeReels.length}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={activeIndex === activeReels.length - 1}
              className="p-3 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white border border-zinc-700/60 disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-xl cursor-pointer hover:scale-110 active:scale-95"
              title="Next Reel (Arrow Down)"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Reel Create Action Button */}
          <button
            type="button"
            onClick={() => setCreateReelOpen(true)}
            className="absolute top-4 right-4 sm:right-6 bg-[#FACE25] hover:bg-[#d8c222] text-zinc-950 font-bold px-3.5 py-2 rounded-2xl shadow-xl transition-all hover:scale-105 cursor-pointer z-30 flex items-center gap-2 text-xs"
            title="Post a Reel"
          >
            <PlusSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Create Reel</span>
          </button>
        </div>
      )}

      {/* Delete Reel Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-sm p-6 bg-zinc-950 border border-zinc-800 text-white rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-rose-500 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete Reel
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
            Are you sure you want to permanently delete this reel? It will be removed from the reels feed and your profile. This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2.5 mt-5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deleting}
              onClick={() => {
                setDeleteModalOpen(false);
                setReelToDelete(null);
              }}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
            >
              {deleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comment Dialog */}
      <CommentDialog open={commentDialogOpen} setOpen={setCommentDialogOpen} />

      {/* Create Reel Modal */}
      <CreatePost
        open={createReelOpen}
        setOpen={setCreateReelOpen}
        defaultPostType="reel"
      />
    </div>
  );
}
