import { useState } from "react";
import InfoLayout from "./InfoLayout";
import {
  HelpCircle,
  Search,
  ChevronDown,
  MessageSquare,
  KeyRound,
  ShieldCheck,
  Film,
  Lock,
  Send,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const FAQS = [
  {
    category: "account",
    question: "How do I reset my Net-ly password if I forgot it?",
    answer:
      "You can easily reset your password by heading to the Forgot Password page (link in the login card or footer). Enter your registered email, and Net-ly will send a secure 6-digit OTP code and direct reset link valid for 15 minutes.",
    link: "/forgot-password",
    linkLabel: "Go to Forgot Password",
  },
  {
    category: "bluetag",
    question: "How do I get the official Blue Tag verified badge?",
    answer:
      "The Blue Tag is an official verified seal granted by the Super Administrator or authorized Admins. It is awarded to authentic creators, public figures, and active community contributors. You can check requirements on the Verified Badge page.",
    link: "/verified",
    linkLabel: "Learn about Verified Badges",
  },
  {
    category: "reels",
    question: "How do Reels work and how do I scroll through them?",
    answer:
      "Reels on Net-ly are hosted exclusively on the dedicated Reels page (/reels). They feature continuous vertical snap-scroll—simply scroll using your trackpad, mouse wheel, touch swipe, or keyboard Arrow Up / Down keys.",
    link: "/reels",
    linkLabel: "Watch Reels Now",
  },
  {
    category: "privacy",
    question: "How can I make my account private?",
    answer:
      "Navigate to Account Settings by clicking your profile and selecting 'Edit Profile'. Under Privacy Settings, switch your account from Public to Private. Only followers you approve will be able to see your posts and stories.",
    link: "/account/edit",
    linkLabel: "Edit Profile Privacy",
  },
  {
    category: "messaging",
    question: "Are direct messages real-time?",
    answer:
      "Yes! Net-ly direct messages utilize WebSocket connections for instant live messaging, live typing indicators ('typing...'), and online/offline status indicators. You can also send emoji reactions and quote replies.",
    link: "/chat",
    linkLabel: "Open Messages",
  },
  {
    category: "security",
    question: "What should I do if I suspect unauthorized access?",
    answer:
      "Immediately reset your password using the password reset tool. This invalidates existing sessions. You can also reach out to our trust and safety team using the support form below.",
  },
];

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState(null);

  // Dynamic ticket state
  const [ticket, setTicket] = useState({
    name: "",
    email: "",
    category: "general",
    message: "",
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const filteredFaqs = FAQS.filter((faq) => {
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    if (!ticket.email || !ticket.message.trim()) {
      toast.error("Please fill in your email and support message.");
      return;
    }

    const generatedId = `NET-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(generatedId);
    setTicketSubmitted(true);
    toast.success(`Support ticket ${generatedId} created! Our team will respond shortly.`);
  };

  return (
    <InfoLayout
      title="Help & Support Center"
      subtitle="Find quick answers to common questions, platform guidelines, or reach out to our support team."
      icon={HelpCircle}
    >
      <div className="space-y-12">
        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions (e.g. password, reels, blue tag, privacy)..."
            className="w-full bg-[#111726]/80 border-white/[0.1] text-white pl-12 pr-4 h-12 rounded-2xl text-sm focus-visible:ring-1 focus-visible:ring-amber-400 shadow-xl"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { id: "all", label: "All Questions" },
            { id: "account", label: "Account & Password" },
            { id: "bluetag", label: "Blue Tag Verification" },
            { id: "reels", label: "Reels & Video" },
            { id: "privacy", label: "Privacy & Safety" },
            { id: "messaging", label: "Direct Messaging" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-[#FACE25] text-zinc-950 shadow-md"
                  : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3 max-w-3xl mx-auto">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.question}
                className="bg-[#111726]/60 border border-white/[0.06] rounded-2xl overflow-hidden transition backdrop-blur-md"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                >
                  <span className="font-semibold text-sm sm:text-base text-zinc-100">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform ${
                      isOpen ? "rotate-180 text-amber-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-white/[0.04] text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-3">
                    <p>{faq.answer}</p>
                    {faq.link && (
                      <Link
                        to={faq.link}
                        className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        <span>{faq.linkLabel}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 text-zinc-500 text-sm">
              No matching help topics found. You can submit a support ticket below.
            </div>
          )}
        </div>

        {/* Dynamic Support Ticket Section */}
        <div className="max-w-2xl mx-auto bg-[#111726]/70 border border-white/[0.08] rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Need Personalized Help?</h3>
              <p className="text-xs text-zinc-400">
                Submit a support request to our engineering and safety team.
              </p>
            </div>
          </div>

          {!ticketSubmitted ? (
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Your Name</label>
                  <Input
                    type="text"
                    value={ticket.name}
                    onChange={(e) => setTicket({ ...ticket, name: e.target.value })}
                    placeholder="John Doe"
                    className="bg-white/[0.04] border-white/[0.08] text-white text-xs h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    value={ticket.email}
                    onChange={(e) => setTicket({ ...ticket, email: e.target.value })}
                    placeholder="you@example.com"
                    className="bg-white/[0.04] border-white/[0.08] text-white text-xs h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Issue Category</label>
                <select
                  value={ticket.category}
                  onChange={(e) => setTicket({ ...ticket, category: e.target.value })}
                  className="w-full bg-[#161d2f] border border-white/[0.08] text-white text-xs h-10 rounded-xl px-3 focus:outline-none focus:border-amber-400"
                >
                  <option value="general">General Support / Inquiries</option>
                  <option value="account">Account Access & Password</option>
                  <option value="bluetag">Verification & Blue Tag</option>
                  <option value="bug">Report a Bug / Platform Issue</option>
                  <option value="safety">Trust & Safety / Report User</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">How can we help? *</label>
                <Textarea
                  required
                  rows={4}
                  value={ticket.message}
                  onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
                  placeholder="Describe your issue or question in detail..."
                  className="bg-white/[0.04] border-white/[0.08] text-white text-xs rounded-xl"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#FACE25] hover:bg-[#eab308] text-zinc-950 font-bold rounded-xl h-11 text-xs cursor-pointer shadow-lg shadow-amber-500/10"
              >
                <Send className="w-3.5 h-3.5 mr-2" />
                Submit Support Ticket
              </Button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Ticket Submitted Successfully</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Ticket reference: <span className="font-mono text-amber-400 font-bold">{ticketId}</span>
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  We sent an acknowledgment to <strong>{ticket.email}</strong>. Our team typically replies within 24 hours.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTicketSubmitted(false);
                  setTicket({ name: "", email: "", category: "general", message: "" });
                }}
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
