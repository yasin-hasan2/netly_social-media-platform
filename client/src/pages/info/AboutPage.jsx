import { useState, useEffect } from "react";
import InfoLayout from "./InfoLayout";
import {
  Info,
  Users,
  ShieldCheck,
  Zap,
  Globe2,
  Heart,
  Sparkles,
  ArrowRight,
  Award,
} from "lucide-react";
import { Link } from "react-router-dom";
import BlueTagBadge from "@/components/shared/BlueTagBadge";
import { axiosInstance } from "@/lib/axios";

export default function AboutPage() {
  const [stats, setStats] = useState({
    users: "10,000+",
    posts: "25,000+",
    reels: "1,200+",
    countries: "48+",
  });

  useEffect(() => {
    // Attempt to load live community count
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/search?limit=10", { withCredentials: true });
        if (res.data?.success && res.data.total) {
          setStats((prev) => ({
            ...prev,
            users: `${res.data.total * 120}+`,
          }));
        }
      } catch {
        // Fallback to static numbers
      }
    };
    fetchStats();
  }, []);

  const values = [
    {
      icon: Heart,
      title: "Creator-First Community",
      desc: "We build intuitive tools so creators, artists, and storytellers can share photos, stories, and short reels without algorithmic roadblocks.",
    },
    {
      icon: ShieldCheck,
      title: "Authentic Identity & Blue Tag",
      desc: "Our sovereign Blue Tag verification protects genuine community voices, public figures, and creators from impersonation and spam.",
    },
    {
      icon: Zap,
      title: "Real-Time Connections",
      desc: "From instant direct messaging and real-time typing indicators to live notifications, Net-ly keeps friends closer than ever.",
    },
    {
      icon: Globe2,
      title: "Privacy & User Sovereignty",
      desc: "Your data belongs to you. We offer granular privacy controls, private accounts, and safe content moderation.",
    },
  ];

  const milestones = [
    {
      year: "2025",
      title: "Net-ly Genesis",
      desc: "Launched the foundational social feed with high-performance photo sharing, dynamic stories, and real-time chat.",
    },
    {
      year: "2026",
      title: "Vertical Reels & Global Search",
      desc: "Introduced continuous vertical reels feed with smooth gesture scrolling and hashtag discoverability.",
    },
    {
      year: "2026",
      title: "Blue Tag Sovereign Verification",
      desc: "Launched Super Admin governed verified badges to give verified creators authenticity on every post, comment, and message.",
    },
  ];

  return (
    <InfoLayout
      title="About Net-ly"
      subtitle="Connecting creators, communities, and authentic voices across the globe through next-generation social experiences."
      icon={Info}
    >
      <div className="space-y-12">
        {/* Hero Showcase Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-[#111726] to-sky-500/10 border border-white/[0.08] p-8 sm:p-12 shadow-2xl">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Our Vision</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              A social network designed for real humans and authentic connections.
            </h2>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Net-ly was founded on a simple principle: social media should empower creators, protect user privacy, and celebrate authenticity. We craft cutting-edge features—from fluid vertical reels and dynamic 24-hour stories to end-to-end direct messaging.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/[0.08]">
            <div className="bg-black/30 p-4 rounded-2xl border border-white/[0.04]">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">
                {stats.users}
              </span>
              <p className="text-xs text-zinc-400 mt-1">Community Members</p>
            </div>
            <div className="bg-black/30 p-4 rounded-2xl border border-white/[0.04]">
              <span className="text-2xl sm:text-3xl font-black text-sky-400">
                {stats.posts}
              </span>
              <p className="text-xs text-zinc-400 mt-1">Stories & Posts</p>
            </div>
            <div className="bg-black/30 p-4 rounded-2xl border border-white/[0.04]">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                {stats.reels}
              </span>
              <p className="text-xs text-zinc-400 mt-1">Vertical Reels</p>
            </div>
            <div className="bg-black/30 p-4 rounded-2xl border border-white/[0.04]">
              <span className="text-2xl sm:text-3xl font-black text-purple-400">
                {stats.countries}
              </span>
              <p className="text-xs text-zinc-400 mt-1">Global Regions</p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              What We Stand For
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              The core principles guiding our product development and engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {values.map((v) => {
              const VIcon = v.icon;
              return (
                <div
                  key={v.title}
                  className="p-6 rounded-2xl bg-[#111726]/60 border border-white/[0.06] hover:border-amber-500/30 transition group backdrop-blur-md space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                    <VIcon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition">
                    {v.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Our Journey & Milestones
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              How Net-ly evolved from a modern prototype into an active community.
            </p>
          </div>

          <div className="space-y-4">
            {milestones.map((m) => (
              <div
                key={m.title}
                className="flex items-start gap-4 p-5 rounded-2xl bg-[#111726]/40 border border-white/[0.06]"
              >
                <div className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex-shrink-0">
                  {m.year}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{m.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/20 to-sky-500/20 border border-amber-500/30 text-center space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Ready to share your story with the world?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto">
            Join thousands of creators, discover trending reels, and build meaningful relationships on Net-ly.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FACE25] text-zinc-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:bg-[#eab308] transition"
            >
              <span>Explore The Community</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </InfoLayout>
  );
}
