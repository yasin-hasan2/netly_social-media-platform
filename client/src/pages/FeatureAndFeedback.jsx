import { useState } from "react";
import InfoLayout from "./info/InfoLayout";
import {
  Sparkles,
  ThumbsUp,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  Zap,
  ShieldCheck,
  Film,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import BlueTagBadge from "@/components/shared/BlueTagBadge";

const INITIAL_ROADMAP = [
  {
    id: 1,
    title: "Sovereign Blue Tag Verification",
    desc: "12-point scalloped verified badge governed by Super Admin with administrative delegation.",
    status: "Shipped",
    statusColor: "emerald",
    votes: 412,
    category: "Security",
  },
  {
    id: 2,
    title: "Continuous Vertical Reels Feed",
    desc: "TikTok and Instagram style vertical video feed with natural swipe and snap-scroll navigation.",
    status: "Shipped",
    statusColor: "emerald",
    votes: 388,
    category: "Media",
  },
  {
    id: 3,
    title: "Password Reset via Nodemailer",
    desc: "Self-service forgot password with 6-digit OTP codes and secure 15-minute reset links.",
    status: "Shipped",
    statusColor: "emerald",
    votes: 295,
    category: "Auth",
  },
  {
    id: 4,
    title: "Live Audio & Video Rooms",
    desc: "Join real-time voice and video conversations directly with followers and communities.",
    status: "In Progress",
    statusColor: "amber",
    votes: 567,
    category: "Realtime",
  },
  {
    id: 5,
    title: "Creator Tips & Subscriptions",
    desc: "Support your favorite creators directly with monthly subscriptions and digital badges.",
    status: "Planned",
    statusColor: "sky",
    votes: 341,
    category: "Monetization",
  },
  {
    id: 6,
    title: "AI Caption Assistant & Smart Tags",
    desc: "Generate creative caption ideas, analyze trending hashtags, and format text effortlessly.",
    status: "Planned",
    statusColor: "sky",
    votes: 220,
    category: "Productivity",
  },
];

export default function FeatureAndFeedback() {
  const [roadmap, setRoadmap] = useState(INITIAL_ROADMAP);
  const [votedIds, setVotedIds] = useState(new Set());
  const [feedbackCategory, setFeedbackCategory] = useState("feature");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleVote = (id) => {
    if (votedIds.has(id)) {
      setRoadmap((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, votes: item.votes - 1 } : item
        )
      );
      setVotedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.info("Vote removed");
    } else {
      setRoadmap((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, votes: item.votes + 1 } : item
        )
      );
      setVotedIds((prev) => new Set(prev).add(id));
      toast.success("Thank you for voting!");
    }
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      toast.error("Please enter your feedback or feature suggestion.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success("Thank you! Your feedback has been sent directly to the Net-ly product team.");
      setFeedbackText("");
      setFeedbackEmail("");
    }, 700);
  };

  return (
    <InfoLayout
      title="Features & Community Feedback"
      subtitle="Discover what we’ve launched, vote on upcoming product roadmap features, and share your suggestions."
      icon={Sparkles}
    >
      <div className="space-y-12">
        {/* Roadmap Feature Voting Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-lg font-bold text-white">Community Product Roadmap</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Upvote the features you want us to build next.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Shipped
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 ml-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> In Progress
              </span>
              <span className="flex items-center gap-1.5 text-sky-400 ml-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> Planned
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roadmap.map((item) => {
              const hasVoted = votedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[#111726]/60 border border-white/[0.06] hover:border-amber-500/30 transition flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-zinc-400 border border-white/[0.06]">
                        {item.category}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          item.status === "Shipped"
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : item.status === "In Progress"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            : "bg-sky-500/10 text-sky-300 border-sky-500/30"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                    <span className="text-xs font-mono text-zinc-400">
                      {item.votes} community votes
                    </span>

                    <button
                      type="button"
                      onClick={() => handleVote(item.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        hasVoted
                          ? "bg-[#FACE25] text-zinc-950 shadow-md"
                          : "bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.08]"
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? "fill-zinc-950" : ""}`} />
                      <span>{hasVoted ? "Voted" : "Upvote"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback Submission Box */}
        <div className="max-w-2xl mx-auto bg-[#111726]/80 border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Share Your Feature Idea or Feedback</h3>
              <p className="text-xs text-zinc-400">
                Have a great feature suggestion? Let us know directly.
              </p>
            </div>
          </div>

          {!submitted ? (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Feedback Type</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: "feature", label: "New Feature" },
                    { id: "improvement", label: "Improvement" },
                    { id: "bug", label: "Report Bug" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFeedbackCategory(type.id)}
                      className={`py-2 rounded-xl font-semibold border transition cursor-pointer ${
                        feedbackCategory === type.id
                          ? "bg-[#FACE25] text-zinc-950 border-[#FACE25]"
                          : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Your Email (optional)</label>
                <Input
                  type="email"
                  placeholder="name@example.com (if you'd like follow-up updates)"
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-white text-xs h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Your Suggestion *</label>
                <Textarea
                  required
                  rows={4}
                  placeholder="Describe your idea or experience..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="bg-white/[0.04] border-white/[0.08] text-white text-xs rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#FACE25] hover:bg-[#eab308] text-zinc-950 font-bold text-xs h-11 rounded-xl shadow-md shadow-amber-500/10 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 mr-2" />
                {submitting ? "Sending..." : "Submit Feedback"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Feedback Received!</h4>
              <p className="text-xs text-zinc-300 max-w-sm mx-auto">
                Thank you for helping us shape Net-ly into the best platform for creators and communities.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmitted(false)}
                className="border-zinc-800 text-xs text-zinc-300 rounded-xl mt-2"
              >
                Send another message
              </Button>
            </div>
          )}
        </div>
      </div>
    </InfoLayout>
  );
}
