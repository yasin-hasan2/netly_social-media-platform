import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Film, Play, Sparkles, ChevronRight } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function ReelsShelf() {
  const [reels, setReels] = useState([]);

  useEffect(() => {
    const loadReels = async () => {
      try {
        const res = await axiosInstance.get("/post/reels", { withCredentials: true });
        if (res.data?.success) {
          setReels((res.data.reels || []).slice(0, 6));
        }
      } catch (err) {
        console.warn("Could not load reels shelf:", err);
      }
    };
    loadReels();
  }, []);

  if (reels.length === 0) return null;

  return (
    <div className="w-full mx-auto mb-4 bg-[#111726]/60 border border-white/[0.06] rounded-2xl p-4 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            Trending Reels
          </h3>
        </div>
        <Link
          to="/reels"
          className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-0.5 transition"
        >
          <span>Watch all</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        {reels.map((reel) => (
          <Link
            key={reel._id}
            to="/reels"
            className="flex-shrink-0 relative w-28 h-44 rounded-xl overflow-hidden bg-black border border-white/[0.08] group hover:border-amber-400/50 transition-all shadow-md"
          >
            <video
              src={reel.video}
              muted
              playsInline
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-2">
              <div className="self-end p-1 rounded-full bg-black/60 text-white">
                <Play className="w-3 h-3 fill-white" />
              </div>

              <div className="flex items-center gap-1.5 min-w-0">
                <Avatar className="w-5 h-5 border border-white/20 flex-shrink-0">
                  <AvatarImage src={reel.author?.profilePicture} />
                  <AvatarFallback className="text-[9px] bg-zinc-800 text-amber-400">
                    {reel.author?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] font-medium text-white truncate drop-shadow">
                  {reel.author?.username || "creator"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
