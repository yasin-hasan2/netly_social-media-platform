import { useState } from "react";
import InfoLayout from "./InfoLayout";
import {
  ShieldCheck,
  CheckCircle2,
  Crown,
  Sparkles,
  ArrowRight,
  UserCheck,
  Send,
  HelpCircle,
  FileCheck,
} from "lucide-react";
import BlueTagBadge from "@/components/shared/BlueTagBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSelector } from "react-redux";

export default function VerifiedPage() {
  const { user } = useSelector((store) => store.auth);

  const [form, setForm] = useState({
    username: user?.username || "",
    category: "creator",
    link: "",
    reason: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.username || !form.link) {
      toast.error("Please provide your username and a proof link.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success(
        "Verification request submitted! Our Super Admin and verification team will review your account."
      );
    }, 800);
  };

  return (
    <InfoLayout
      title="Net-ly Verified Blue Tag"
      subtitle="The official verified seal of authenticity for creators, public figures, and genuine community contributors."
      icon={ShieldCheck}
    >
      <div className="space-y-12">
        {/* Verification Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-950/40 via-[#111726] to-blue-950/30 border border-sky-500/30 p-8 sm:p-12 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-3xl bg-sky-500/20 border border-sky-500/40 text-sky-400 shadow-xl shadow-sky-500/20">
                <BlueTagBadge size="xl" showTooltip={false} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    The Official Blue Tag
                  </h3>
                  <BlueTagBadge size="md" />
                </div>
                <p className="text-xs sm:text-sm text-sky-300 font-medium mt-1">
                  12-point scalloped verified badge · Cryptographically authentic
                </p>
              </div>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-zinc-950/80 border border-sky-500/30 text-xs text-sky-200">
              <span className="font-bold text-white block">Governed Authority</span>
              <span className="text-[11px] text-zinc-400">Awarded by Super Admin</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl">
            The Blue Tag is an exclusive badge displayed alongside account names across feed posts, comments, short reels, search results, and direct messaging headers. It proves that an account is the verified, authentic presence of the creator or organization it represents.
          </p>
        </div>

        {/* Requirements & Criteria */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-[#111726]/60 border border-white/[0.06] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">1. Authenticity</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your account must represent a real person, registered business, creator, or entity with authentic activity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111726]/60 border border-white/[0.06] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">2. Complete Profile</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your account must be public, have a valid profile picture, a bio description, and at least one public post or reel.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111726]/60 border border-white/[0.06] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">3. Notability</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your account must represent a notable creator, developer, community leader, or prominent cultural voice.
            </p>
          </div>
        </div>

        {/* Verification Request Form */}
        <div className="max-w-2xl mx-auto bg-[#111726]/80 border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Request Blue Tag Verification</h3>
              <p className="text-xs text-zinc-400">
                Submit your profile and credentials for Super Admin review.
              </p>
            </div>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">
                    Net-ly Username *
                  </label>
                  <Input
                    required
                    type="text"
                    placeholder="@username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="bg-white/[0.04] border-white/[0.08] text-white text-xs h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#161d2f] border border-white/[0.08] text-white text-xs h-10 rounded-xl px-3 focus:outline-none focus:border-sky-400"
                  >
                    <option value="creator">Digital Creator / Influencer</option>
                    <option value="artist">Musician / Artist</option>
                    <option value="developer">Software Engineer / Tech Builder</option>
                    <option value="business">Brand / Organization</option>
                    <option value="public_figure">Public Figure / Journalist</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Proof of Notability or Identity Link *
                </label>
                <Input
                  required
                  type="url"
                  placeholder="https://yourwebsite.com or news link or social portfolio"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="bg-white/[0.04] border-white/[0.08] text-white text-xs h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Why should your account be verified?
                </label>
                <Textarea
                  rows={3}
                  placeholder="Briefly explain your presence and audience..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="bg-white/[0.04] border-white/[0.08] text-white text-xs rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold rounded-xl h-11 text-xs cursor-pointer shadow-lg shadow-sky-500/20"
              >
                <Send className="w-3.5 h-3.5 mr-2" />
                {submitting ? "Submitting Application..." : "Submit Verification Application"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
                <BlueTagBadge size="md" showTooltip={false} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Application Received</h4>
                <p className="text-xs text-zinc-300 mt-1">
                  Your application for <strong>@{form.username}</strong> is under review by platform administrators.
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  You will receive a notification when your request is processed.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmitted(false)}
                className="border-zinc-800 text-xs text-zinc-300 rounded-xl"
              >
                Submit another request
              </Button>
            </div>
          )}
        </div>
      </div>
    </InfoLayout>
  );
}
