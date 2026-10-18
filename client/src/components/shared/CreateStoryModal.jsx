import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Image as ImageIcon,
  Video,
  X,
  Loader2,
  Sparkles,
  Clock,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { readFileAsDataURL, reduceVideoFile } from "@/lib/utils";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { useSelector } from "react-redux";

export default function CreateStoryModal({ open, setOpen, onStoryCreated }) {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [mediaType, setMediaType] = useState("image"); // 'image' | 'video'
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const { user } = useSelector((store) => store.auth);

  const resetForm = () => {
    setFile(null);
    setMediaPreview("");
    setMediaType("image");
    setCaption("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    if (!loading && !compressing) {
      setOpen(false);
      resetForm();
    }
  };

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const isVideo = selected.type.startsWith("video/");
    const isImage = selected.type.startsWith("image/");

    if (!isVideo && !isImage) {
      toast.error("Please choose a photo or short video");
      return;
    }

    if (isVideo) {
      setMediaType("video");
      setCompressing(true);
      toast.info("Optimizing story video...");
      try {
        const reduced = await reduceVideoFile(selected, 720, 1_000_000);
        setFile(reduced);
        setMediaPreview(URL.createObjectURL(reduced));
        toast.success("Story video optimized!");
      } catch {
        setFile(selected);
        setMediaPreview(URL.createObjectURL(selected));
      } finally {
        setCompressing(false);
      }
    } else {
      setMediaType("image");
      setFile(selected);
      try {
        const dataUrl = await readFileAsDataURL(selected);
        setMediaPreview(dataUrl);
      } catch {
        toast.error("Failed to read image");
      }
    }
  };

  const handlePublishStory = async () => {
    if (!user) {
      toast.error("Please login to share a story");
      return;
    }
    if (!file) {
      toast.error("Please select a photo or video for your story");
      return;
    }

    const formData = new FormData();
    formData.append("media", file);
    if (caption.trim()) {
      formData.append("caption", caption.trim());
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post("/story/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Story shared! Active for 24 hours.");
        if (onStoryCreated) onStoryCreated(res.data.story);
        handleClose();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to publish story");
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
        className="max-w-md w-full p-0 overflow-hidden bg-zinc-950/95 border border-zinc-800 text-white rounded-3xl shadow-2xl backdrop-blur-xl"
      >
        <DialogHeader className="px-6 py-4 border-b border-zinc-800/80 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FACE25]" /> Add to Your Story
          </DialogTitle>
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
            <Clock className="w-3 h-3 text-[#FACE25]" />
            <span>24 Hours</span>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Creator Header */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-[#FACE25]">
              <AvatarImage src={user?.profilePicture} alt={user?.username} />
              <AvatarFallback className="bg-zinc-800 text-[#FACE25] font-semibold">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-white">{user?.username || "You"}</p>
              <p className="text-xs text-zinc-400">Visible to all your followers & community</p>
            </div>
          </div>

          {/* Media preview or upload dropzone */}
          {mediaPreview ? (
            <div className="relative w-full aspect-[9/16] max-h-[380px] rounded-2xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
              {mediaType === "video" ? (
                <video
                  src={mediaPreview}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Story preview"
                  className="w-full h-full object-cover"
                />
              )}

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setMediaPreview("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-3 right-3 p-1.5 bg-black/75 hover:bg-black text-white rounded-full transition shadow-md cursor-pointer"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-56 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-[#FACE25]/60 bg-zinc-900/50 hover:bg-zinc-900/80 transition flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
            >
              <div className="p-3 bg-zinc-800/80 group-hover:bg-[#FACE25]/20 rounded-full transition text-[#FACE25] mb-2">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-zinc-200">
                Click to upload a photo or short video
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Optimized 9:16 vertical stories with 24-hr countdown
              </p>
            </div>
          )}

          {/* Compressing Banner */}
          {compressing && (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-200">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FACE25]" />
              <span>Optimizing story media...</span>
            </div>
          )}

          {/* Optional Caption */}
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add an optional story caption..."
            maxLength={120}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FACE25] transition"
          />

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-zinc-800/80">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "image/*";
                    fileInputRef.current.click();
                  }
                }}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 p-2 rounded-lg hover:bg-zinc-900 transition cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>Photo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "video/*";
                    fileInputRef.current.click();
                  }
                }}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 p-2 rounded-lg hover:bg-zinc-900 transition cursor-pointer"
              >
                <Video className="w-4 h-4 text-indigo-400" />
                <span>Video</span>
              </button>
            </div>

            <Button
              type="button"
              disabled={loading || compressing || !file}
              onClick={handlePublishStory}
              className="bg-[#FACE25] hover:bg-[#d8c222] text-zinc-950 font-semibold px-5 h-9 text-xs rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Sharing...
                </>
              ) : (
                "Share Story"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
