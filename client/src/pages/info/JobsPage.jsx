import { useState } from "react";
import InfoLayout from "./InfoLayout";
import {
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Coffee,
  Laptop,
  Heart,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const OPEN_POSITIONS = [
  {
    id: "eng-fullstack",
    title: "Senior Full-Stack Engineer (React & Node.js)",
    team: "Core Platform",
    type: "Full-Time",
    location: "Remote (Global)",
    salary: "$130k - $170k · Equity",
    desc: "Architect scalable feeds, real-time WebSockets, and high-performance video reels delivery.",
  },
  {
    id: "eng-infra",
    title: "Site Reliability & Cloud Infrastructure Lead",
    team: "Infrastructure",
    type: "Full-Time",
    location: "Remote (US / EU / Asia)",
    salary: "$140k - $180k · Equity",
    desc: "Oversee distributed database clusters, media caching CDN, and 99.99% uptime systems.",
  },
  {
    id: "des-product",
    title: "Senior Product Designer (Mobile & Web)",
    team: "Product Design",
    type: "Full-Time",
    location: "Remote",
    salary: "$120k - $150k · Equity",
    desc: "Craft micro-interactions, dark aesthetic design tokens, and fluid reel gestures.",
  },
  {
    id: "ops-safety",
    title: "Community Trust & Safety Specialist",
    team: "Operations",
    type: "Full-Time",
    location: "Remote",
    salary: "$75k - $95k · Equity",
    desc: "Protect the community from spam, review verification requests, and enforce safety policies.",
  },
];

export default function JobsPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [application, setApplication] = useState({
    fullName: "",
    email: "",
    linkedin: "",
    portfolio: "",
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleApplyClick = (role) => {
    setSelectedRole(role);
    setApplyModalOpen(true);
  };

  const handleSubmitApplication = (e) => {
    e.preventDefault();
    if (!application.fullName || !application.email) {
      toast.error("Please enter your name and email.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setApplyModalOpen(false);
      toast.success(
        `Application submitted for ${selectedRole?.title}! Our recruiting team will follow up via email.`
      );
      setApplication({ fullName: "", email: "", linkedin: "", portfolio: "", note: "" });
    }, 900);
  };

  return (
    <InfoLayout
      title="Careers at Net-ly"
      subtitle="Help build the most authentic, creator-empowered social platform on the internet. We are remote-first, ambitious, and deeply collaborative."
      icon={Briefcase}
    >
      <div className="space-y-12">
        {/* Perks & Culture Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#111726]/60 border border-white/[0.06] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">100% Remote-First</h4>
            <p className="text-xs text-zinc-400">
              Work from wherever you are happiest and most productive in the world.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111726]/60 border border-white/[0.06] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Competitive Equity</h4>
            <p className="text-xs text-zinc-400">
              Every team member is an owner. Generous stock grants for all roles.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111726]/60 border border-white/[0.06] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Comprehensive Health</h4>
            <p className="text-xs text-zinc-400">
              Medical, dental, vision, mental health coverage, and annual fitness stipends.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#111726]/60 border border-white/[0.06] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-white">Flexible Time Off</h4>
            <p className="text-xs text-zinc-400">
              Unlimited PTO, paid parental leave, and company-wide recharge weeks.
            </p>
          </div>
        </div>

        {/* Open Positions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Open Opportunities</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Join our small, high-leverage team making a global impact.
              </p>
            </div>
            <span className="text-xs px-3 py-1 bg-amber-500/15 text-amber-300 font-bold rounded-full border border-amber-500/30">
              {OPEN_POSITIONS.length} Active Openings
            </span>
          </div>

          <div className="space-y-3">
            {OPEN_POSITIONS.map((role) => (
              <div
                key={role.id}
                className="p-6 rounded-2xl bg-[#111726]/60 border border-white/[0.06] hover:border-amber-500/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-bold text-white hover:text-amber-300 transition">
                      {role.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 text-[10px] font-semibold">
                      {role.team}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                    {role.desc}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-zinc-400 pt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      {role.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      {role.type}
                    </span>
                    <span className="text-emerald-400 font-semibold">{role.salary}</span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Button
                    type="button"
                    onClick={() => handleApplyClick(role)}
                    className="bg-[#FACE25] hover:bg-[#eab308] text-zinc-950 font-bold text-xs px-5 h-10 rounded-xl cursor-pointer shadow-md shadow-amber-500/10"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Modal */}
        <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
          <DialogContent className="max-w-lg bg-[#111726] border border-white/[0.1] text-white rounded-3xl p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-400" />
                Apply for {selectedRole?.title}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmitApplication} className="space-y-4 mt-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Full Name *</label>
                <Input
                  required
                  type="text"
                  placeholder="Jane Doe"
                  value={application.fullName}
                  onChange={(e) => setApplication({ ...application, fullName: e.target.value })}
                  className="bg-white/[0.04] border-white/[0.08] text-white text-xs h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Email Address *</label>
                <Input
                  required
                  type="email"
                  placeholder="jane@example.com"
                  value={application.email}
                  onChange={(e) => setApplication({ ...application, email: e.target.value })}
                  className="bg-white/[0.04] border-white/[0.08] text-white text-xs h-10 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">LinkedIn Profile</label>
                  <Input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={application.linkedin}
                    onChange={(e) => setApplication({ ...application, linkedin: e.target.value })}
                    className="bg-white/[0.04] border-white/[0.08] text-white text-xs h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">GitHub / Portfolio</label>
                  <Input
                    type="url"
                    placeholder="https://github.com/..."
                    value={application.portfolio}
                    onChange={(e) => setApplication({ ...application, portfolio: e.target.value })}
                    className="bg-white/[0.04] border-white/[0.08] text-white text-xs h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Why do you want to join Net-ly?
                </label>
                <Textarea
                  rows={3}
                  placeholder="Tell us about yourself and what drives you..."
                  value={application.note}
                  onChange={(e) => setApplication({ ...application, note: e.target.value })}
                  className="bg-white/[0.04] border-white/[0.08] text-white text-xs rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setApplyModalOpen(false)}
                  className="border-zinc-700 text-zinc-300 text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#FACE25] hover:bg-[#eab308] text-zinc-950 font-bold text-xs rounded-xl px-5"
                >
                  {submitting ? "Submitting..." : "Send Application"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </InfoLayout>
  );
}
