import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Image as ImageIcon,
  Video,
  Film,
  MapPin,
  Smile,
  X,
  Loader2,
  Tag,
  Sparkles,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { readFileAsDataURL, reduceVideoFile } from "@/lib/utils";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setPosts, setReels } from "@/redux/postSlice";

const FEELINGS_LIST = [
  { label: "Inspired", emoji: "💡" },
  { label: "Shipping", emoji: "🚀" },
  { label: "Caffeinated", emoji: "☕" },
  { label: "Excited", emoji: "✨" },
  { label: "Focused", emoji: "🎯" },
  { label: "Relaxed", emoji: "🌿" },
  { label: "Adventurous", emoji: "🏔️" },
  { label: "Grateful", emoji: "🙏" },
];

const SUGGESTED_TAGS = ["reels", "video", "tech", "design", "travel", "coding", "community"];

const QUICK_LOCATIONS = ["Remote / Home", "Tokyo, Japan", "San Francisco, CA", "Zurich, Switzerland", "Local Cafe ☕"];

export default function CreatePost({ open, setOpen, defaultPostType = "post" }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [mediaPreview, setMediaPreview] = useState("");
  const [mediaType, setMediaType] = useState(null); // 'image' | 'video'
  const [postType, setPostType] = useState(defaultPostType); // 'post' | 'reel'
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [originalSizeMb, setOriginalSizeMb] = useState(null);
  const [reducedSizeMb, setReducedSizeMb] = useState(null);

  const [showLocationInput, setShowLocationInput] = useState(false);
  const [location, setLocation] = useState("");
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [feeling, setFeeling] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);

  const { user } = useSelector((store) => store.auth);
  const { posts, reels } = useSelector((store) => store.post);
  const dispatch = useDispatch();

  const resetForm = () => {
    setCaption("");
    setFile(null);
    setMediaPreview("");
    setMediaType(null);
    setPostType(defaultPostType);
    setOriginalSizeMb(null);
    setReducedSizeMb(null);
    setLocation("");
    setFeeling("");
    setTags([]);
    setTagInput("");
    setShowLocationInput(false);
    setShowFeelingPicker(false);
    setShowTagInput(false);
  };

  const handleClose = () => {
    if (!loading && !compressing) {
      setOpen(false);
      resetForm();
    }
  };

  const fileChangeHandler = async (e, forcedType = null) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const isVideo = selected.type.startsWith("video/");
    const isImage = selected.type.startsWith("image/");

    if (!isVideo && !isImage) {
      toast.error("Please upload an image or video file");
      return;
    }

    if (isVideo) {
      // 100MB initial hard cap before compression
      if (selected.size > 100 * 1024 * 1024) {
        toast.error("Video is too large (max 100MB before compression)");
        return;
      }

      setMediaType("video");
      if (forcedType === "reel" || postType === "reel") {
        setPostType("reel");
      }
      setOriginalSizeMb((selected.size / (1024 * 1024)).toFixed(1));

      // Automatic video reduction / compression
      setCompressing(true);
      toast.info("Optimizing video to reduce size...");

      try {
        const reducedFile = await reduceVideoFile(selected, 720, 1_200_000);
        setFile(reducedFile);
        setReducedSizeMb((reducedFile.size / (1024 * 1024)).toFixed(1));
        const previewUrl = URL.createObjectURL(reducedFile);
        setMediaPreview(previewUrl);
        toast.success(`Video reduced to ${(reducedFile.size / (1024 * 1024)).toFixed(1)}MB!`);
      } catch (err) {
        console.warn("Video reduction fallback:", err);
        setFile(selected);
        setMediaPreview(URL.createObjectURL(selected));
      } finally {
        setCompressing(false);
      }
    } else {
      if (selected.size > 15 * 1024 * 1024) {
        toast.error("Image file is too large (max 15MB)");
        return;
      }
      setMediaType("image");
      setFile(selected);
      try {
        const dataUrl = await readFileAsDataURL(selected);
        setMediaPreview(dataUrl);
      } catch (err) {
        console.error(err);
        toast.error("Failed to read image file");
      }
    }
  };

  const handleRemoveMedia = () => {
    setFile(null);
    setMediaPreview("");
    setMediaType(null);
    setOriginalSizeMb(null);
    setReducedSizeMb(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddTag = (tagToAdd) => {
    const cleaned = tagToAdd.trim().replace(/^#/, "").toLowerCase();
    if (cleaned && !tags.includes(cleaned)) {
      if (tags.length >= 8) {
        toast.info("Maximum 8 tags per post");
        return;
      }
      setTags([...tags, cleaned]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleInsertEmoji = (emoji) => {
    setCaption((prev) => prev + emoji);
  };

  const createPostHandler = async (e) => {
    if (e) e.preventDefault();
    if (!user) {
      toast.error("Please login to create a post");
      return;
    }
    if (!caption.trim() && !file) {
      toast.error("Please enter a caption or upload photo/video to share");
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption.trim());
    formData.append("postType", mediaType === "video" ? (postType || "reel") : "post");

    if (file) {
      formData.append("media", file);
    }
    if (location.trim()) {
      formData.append("location", location.trim());
    }
    if (feeling.trim()) {
      formData.append("feeling", feeling.trim());
    }
    if (tags.length > 0) {
      formData.append("tags", JSON.stringify(tags));
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/post/addpost", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data?.success) {
        const newPost = res.data.post;
        if (newPost.postType === "reel" || (newPost.video && newPost.video.trim())) {
          dispatch(setReels([newPost, ...(reels || [])]));
        }
        dispatch(setPosts([newPost, ...(posts || [])]));

        toast.success(
          newPost.postType === "reel"
            ? "Reel published successfully!"
            : "Post created successfully!"
        );
        handleClose();
      }
    } catch (error) {
      console.error("Create post error:", error);
      toast.error(error.response?.data?.message || "Failed to publish post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        onInteractOutside={(e) => {
          if (loading || compressing) e.preventDefault();
          else handleClose();
        }}
        className="max-w-lg w-full p-0 gap-0 overflow-hidden bg-zinc-950/95 border border-zinc-800 text-white rounded-2xl shadow-2xl backdrop-blur-xl"
      >
        <DialogHeader className="px-6 py-4 border-b border-zinc-800/80 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FACE25]" />
            {postType === "reel" || mediaType === "video" ? "Create Reel / Video Post" : "Create Post"}
          </DialogTitle>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setPostType("post")}
              className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                postType === "post"
                  ? "bg-[#FACE25] text-zinc-950 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Feed Post
            </button>
            <button
              type="button"
              onClick={() => setPostType("reel")}
              className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 cursor-pointer ${
                postType === "reel"
                  ? "bg-[#FACE25] text-zinc-950 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Film className="w-3 h-3" />
              Reel
            </button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
          {/* Author info & feeling badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-zinc-700">
                <AvatarImage src={user?.profilePicture} alt={user?.username} />
                <AvatarFallback className="bg-zinc-800 text-[#FACE25] font-semibold">
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-sm text-zinc-100">
                    {user?.username || "You"}
                  </span>
                  {feeling && (
                    <span className="text-xs text-zinc-400">
                      is feeling <span className="text-zinc-200 font-medium">{feeling}</span>
                    </span>
                  )}
                </div>
                {location ? (
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#FACE25]" />
                    {location}
                  </p>
                ) : (
                  <p className="text-xs text-zinc-500">
                    {postType === "reel" ? "Reels · Public video" : "Public · Anyone on Net-ly"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Caption textarea */}
          <div className="relative">
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={
                postType === "reel"
                  ? "Add a reel description, audio note, or hashtags..."
                  : "What's happening? Share a project update, story, video, or photo..."
              }
              className="w-full resize-none border-0 bg-transparent text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0 p-0 text-base leading-relaxed min-h-[90px]"
              rows={3}
              maxLength={1500}
            />
            <div className="flex justify-end pt-1 text-[11px] text-zinc-500">
              {caption.length} / 1500
            </div>
          </div>

          {/* Video Compressing Indicator */}
          {compressing && (
            <div className="p-3 bg-zinc-900/90 rounded-xl border border-amber-500/30 flex items-center gap-3 text-xs text-amber-200 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-[#FACE25]" />
              <div className="flex-1">
                <p className="font-medium text-amber-300">Reducing video footprint...</p>
                <p className="text-[11px] text-zinc-400">
                  Downscaling bitrate and resolution for instantaneous playback.
                </p>
              </div>
            </div>
          )}

          {/* Media Preview (Image or Video) */}
          {mediaPreview && (
            <div className="relative w-full rounded-xl overflow-hidden border border-zinc-800 bg-black group flex flex-col items-center justify-center">
              {mediaType === "video" ? (
                <div className="relative w-full max-h-80 flex items-center justify-center bg-black">
                  <video
                    src={mediaPreview}
                    controls
                    playsInline
                    className="w-full max-h-80 object-contain rounded-xl"
                  />
                  {reducedSizeMb && (
                    <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-zinc-700 text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                      <Zap className="w-3 h-3 text-[#FACE25]" />
                      Reduced from {originalSizeMb}MB to {reducedSizeMb}MB
                    </div>
                  )}
                </div>
              ) : (
                <img
                  src={mediaPreview}
                  alt="Selected preview"
                  className="w-full max-h-80 object-cover object-center"
                />
              )}

              <button
                type="button"
                onClick={handleRemoveMedia}
                aria-label="Remove media"
                className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition shadow-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Active Tags Display */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-xs font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-amber-100 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Expandable Location Section */}
          {showLocationInput && (
            <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FACE25]" /> Add Location
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowLocationInput(false);
                    setLocation("");
                  }}
                  className="text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Tokyo, Japan or Remote"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#FACE25]"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {QUICK_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className="text-[11px] text-zinc-400 hover:text-zinc-200 bg-zinc-800/60 hover:bg-zinc-800 px-2 py-0.5 rounded transition"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Expandable Feeling Section */}
          {showFeelingPicker && (
            <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-[#FACE25]" /> How are you feeling?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowFeelingPicker(false);
                    setFeeling("");
                  }}
                  className="text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  Clear
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {FEELINGS_LIST.map((f) => (
                  <button
                    key={f.label}
                    type="button"
                    onClick={() => {
                      setFeeling(`${f.emoji} ${f.label}`);
                      setShowFeelingPicker(false);
                    }}
                    className={`flex items-center gap-1.5 p-2 rounded-lg text-xs transition ${
                      feeling.includes(f.label)
                        ? "bg-[#FACE25]/20 text-[#FACE25] font-semibold border border-[#FACE25]/40"
                        : "bg-zinc-800/70 hover:bg-zinc-800 text-zinc-200"
                    }`}
                  >
                    <span>{f.emoji}</span>
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Expandable Tag Input Section */}
          {showTagInput && (
            <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#FACE25]" /> Add Topic Tags
                </span>
                <button
                  type="button"
                  onClick={() => setShowTagInput(false)}
                  className="text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  Done
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type tag & press Enter (e.g. reels)"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#FACE25]"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleAddTag(tagInput)}
                  className="h-8 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 pt-1 items-center">
                <span className="text-[11px] text-zinc-500">Suggestions:</span>
                {SUGGESTED_TAGS.map((stag) => (
                  <button
                    key={stag}
                    type="button"
                    onClick={() => handleAddTag(stag)}
                    className="text-[11px] text-zinc-400 hover:text-amber-300 bg-zinc-800/60 hover:bg-zinc-800 px-2 py-0.5 rounded transition"
                  >
                    #{stag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Emoji Bar */}
          <div className="flex items-center gap-1 text-base overflow-x-auto py-1">
            {["❤️", "🔥", "🚀", "💡", "☕", "👏", "✨", "💯"].map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => handleInsertEmoji(em)}
                className="p-1 hover:bg-zinc-800 rounded transition text-sm cursor-pointer"
                title={`Add ${em}`}
              >
                {em}
              </button>
            ))}
          </div>

          {/* Hidden Media Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => fileChangeHandler(e)}
          />

          {/* Action Dock */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-1 flex-wrap">
              {/* Photo Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "image/*";
                    fileInputRef.current.click();
                  }
                }}
                className={`h-9 px-2.5 text-xs gap-1.5 ${
                  mediaType === "image"
                    ? "text-[#FACE25] bg-[#FACE25]/10"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Photo</span>
              </Button>

              {/* Video / Reel Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "video/*";
                    fileInputRef.current.click();
                  }
                }}
                className={`h-9 px-2.5 text-xs gap-1.5 ${
                  mediaType === "video"
                    ? "text-[#FACE25] bg-[#FACE25]/10"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Video className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Video (Reduce)</span>
              </Button>

              {/* Tag Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowTagInput((prev) => !prev)}
                className={`h-9 px-2.5 text-xs gap-1.5 ${
                  tags.length > 0 || showTagInput
                    ? "text-amber-400 bg-amber-500/10"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Tag className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Tag</span>
              </Button>

              {/* Feeling Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowFeelingPicker((prev) => !prev)}
                className={`h-9 px-2.5 text-xs gap-1.5 ${
                  feeling || showFeelingPicker
                    ? "text-sky-400 bg-sky-500/10"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Smile className="w-4 h-4 text-sky-400" />
                <span className="hidden sm:inline">Feeling</span>
              </Button>

              {/* Location Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowLocationInput((prev) => !prev)}
                className={`h-9 px-2.5 text-xs gap-1.5 ${
                  location || showLocationInput
                    ? "text-rose-400 bg-rose-500/10"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <MapPin className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Location</span>
              </Button>
            </div>

            <Button
              type="button"
              onClick={createPostHandler}
              disabled={loading || compressing || (!caption.trim() && !file)}
              className="bg-[#FACE25] hover:bg-[#d8c222] text-zinc-950 font-semibold px-5 h-9 text-xs rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Publishing...
                </>
              ) : compressing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Reducing...
                </>
              ) : (
                postType === "reel" ? "Publish Reel" : "Publish"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
