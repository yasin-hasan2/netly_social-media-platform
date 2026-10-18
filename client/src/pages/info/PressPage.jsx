import { useState } from "react";
import InfoLayout from "./InfoLayout";
import {
  Newspaper,
  Download,
  Copy,
  Check,
  Mail,
  ExternalLink,
  Calendar,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const BRAND_COLORS = [
  { name: "Net-ly Primary Gold", hex: "#FACE25", rgb: "rgb(250, 206, 37)" },
  { name: "Verified Blue", hex: "#1D9BF0", rgb: "rgb(29, 155, 240)" },
  { name: "Void Dark", hex: "#090D16", rgb: "rgb(9, 13, 22)" },
  { name: "Card Slate", hex: "#111726", rgb: "rgb(17, 23, 38)" },
];

const PRESS_RELEASES = [
  {
    date: "October 2026",
    title: "Net-ly Introduces Sovereign Blue Tag Verification and Creator Authority Suite",
    summary:
      "Empowering verified creators, artists, and public figures with cryptographic trust seals and administrative delegation controls.",
    tag: "Product Announcement",
  },
  {
    date: "September 2026",
    title: "Continuous Vertical Reels Feed Rolled Out Globally",
    summary:
      "A distraction-free vertical video feed that delivers instant gesture-based navigation and high-framerate short-form video.",
    tag: "Feature Release",
  },
  {
    date: "August 2025",
    title: "Net-ly Reaches 10,000 Active Community Creators",
    summary:
      "Early adopters embrace real-time messaging, stories, and privacy-first social networking.",
    tag: "Milestone",
  },
];

export default function PressPage() {
  const [copiedHex, setCopiedHex] = useState(null);

  const handleCopyHex = async (hex) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      toast.success(`Copied ${hex} to clipboard!`);
      setTimeout(() => setCopiedHex(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <InfoLayout
      title="Press & Media Kit"
      subtitle="Official news, brand assets, press releases, and media contact resources for journalists and creators."
      icon={Newspaper}
    >
      <div className="space-y-12">
        {/* Brand Overview & Logo Download */}
        <div className="p-8 rounded-3xl bg-[#111726]/60 border border-white/[0.08] backdrop-blur-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-zinc-950 font-black text-3xl shadow-xl shadow-amber-500/20">
                N
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">Net-ly Brand Mark</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Official high-resolution icon badge and vector assets
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toast.info("Brand asset package downloaded")}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/[0.1] flex items-center gap-2 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Vector Kit (.SVG / .PNG)</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl">
            When referencing Net-ly in editorial content or publications, please use the official logo mark and preserve our standard clear space around the badge. Do not skew, invert, or alter the brand gradient colors.
          </p>
        </div>

        {/* Official Brand Palette */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Official Brand Color Palette</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Click any color swatch to copy its HEX value.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {BRAND_COLORS.map((col) => (
              <div
                key={col.hex}
                onClick={() => handleCopyHex(col.hex)}
                className="p-4 rounded-2xl bg-[#111726]/40 border border-white/[0.06] hover:border-white/[0.15] cursor-pointer transition space-y-3 group"
              >
                <div
                  className="w-full h-16 rounded-xl shadow-inner border border-white/10 flex items-end justify-end p-2 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: col.hex }}
                >
                  {copiedHex === col.hex ? (
                    <Check className="w-4 h-4 text-zinc-950" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-zinc-950/70 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{col.name}</h4>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1 font-mono">
                    <span>{col.hex}</span>
                    <span className="text-[10px] text-zinc-500">{col.rgb}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Press Releases */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Press Releases & Announcements</h3>

          <div className="space-y-3">
            {PRESS_RELEASES.map((pr) => (
              <div
                key={pr.title}
                className="p-6 rounded-2xl bg-[#111726]/60 border border-white/[0.06] hover:border-amber-500/30 transition space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-semibold border border-amber-500/20">
                    {pr.tag}
                  </span>
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {pr.date}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white hover:text-amber-300 transition">
                  {pr.title}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{pr.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Press Inquiries Contact Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#111726] to-sky-500/15 border border-white/[0.08] text-center space-y-3">
          <h3 className="text-xl font-bold text-white">Media & Press Inquiries</h3>
          <p className="text-xs text-zinc-300 max-w-md mx-auto">
            Journalists, podcasters, and media analysts can reach out directly to our communications team.
          </p>
          <div className="pt-2">
            <a
              href="mailto:press@netly.app"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-bold text-white transition"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>press@netly.app</span>
            </a>
          </div>
        </div>
      </div>
    </InfoLayout>
  );
}
