import { useState } from "react";
import InfoLayout from "./InfoLayout";
import {
  Shield,
  Lock,
  Eye,
  Trash2,
  FileCheck,
  CheckCircle2,
  Download,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function PrivacyPage() {
  const [dataEmail, setDataEmail] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  const handleDataRequest = (e) => {
    e.preventDefault();
    if (!dataEmail) {
      toast.error("Please enter your account email address.");
      return;
    }
    setRequestSent(true);
    toast.success(`Data export request registered for ${dataEmail}. A download archive will be prepared.`);
  };

  return (
    <InfoLayout
      title="Privacy Policy"
      subtitle="Last updated: October 2026. Your privacy and digital sovereignty are fundamental to how Net-ly is engineered."
      icon={Shield}
    >
      <div className="space-y-10 max-w-4xl">
        {/* Highlight Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm text-emerald-200 leading-relaxed space-y-2">
          <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Our Non-Negotiable Privacy Promise
          </h3>
          <p>
            Net-ly <strong>never sells your personal data, direct messages, or contacts to third-party data brokers</strong>. We collect only what is strictly necessary to run your social feed, deliver real-time messages, and keep our community secure.
          </p>
        </div>

        {/* Section 1 */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-amber-400 font-mono text-sm">01.</span> Information We Collect
          </h3>
          <div className="p-6 rounded-2xl bg-[#111726]/60 border border-white/[0.06] text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
            <p>
              <strong>Account Information:</strong> When you register, we collect your username, email address, and encrypted password hash. You may optionally add profile details such as a bio, location, categories, or website link.
            </p>
            <p>
              <strong>Content & Activity:</strong> We process the photos, captions, vertical reels, and comments you upload so other users can discover and view them.
            </p>
            <p>
              <strong>Direct Messages:</strong> Direct messages and reactions are transmitted through encrypted WebSocket sessions and stored securely for conversational history between you and your contact.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-amber-400 font-mono text-sm">02.</span> How We Protect Your Data
          </h3>
          <div className="p-6 rounded-2xl bg-[#111726]/60 border border-white/[0.06] text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
            <p>
              All traffic between your browser and our servers is strictly encrypted with modern TLS / SSL. Passwords are never stored in plain text and are salted and hashed using industry-standard bcrypt.
            </p>
            <p>
              We implement rate limiting, CSRF and SameSite cookie protections, and automated threat detection to prevent unauthorized account access.
            </p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-amber-400 font-mono text-sm">03.</span> Granular Privacy Controls
          </h3>
          <div className="p-6 rounded-2xl bg-[#111726]/60 border border-white/[0.06] text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
            <p>
              <strong>Private Accounts:</strong> You can switch your account from Public to Private at any time in Profile Settings. When private, only users you approve can view your posts, stories, and follower lists.
            </p>
            <p>
              <strong>Direct Message Controls:</strong> You can configure who can send you direct messages (Everyone, Followers Only, or restrict unwanted conversations).
            </p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-amber-400 font-mono text-sm">04.</span> Your Rights (GDPR, CCPA & Data Portability)
          </h3>
          <div className="p-6 rounded-2xl bg-[#111726]/60 border border-white/[0.06] text-xs sm:text-sm text-zinc-300 space-y-3 leading-relaxed">
            <p>
              You have the unconditional right to access, export, rectify, or permanently delete your Net-ly account and all associated posts, reels, and messages.
            </p>
          </div>
        </div>

        {/* Interactive Data Archive Request Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#111726]/80 border border-white/[0.08] backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Download Your Data Archive</h4>
              <p className="text-xs text-zinc-400">
                Request a portable JSON/ZIP copy of your profile, posts, reels, and activity history.
              </p>
            </div>
          </div>

          {!requestSent ? (
            <form onSubmit={handleDataRequest} className="flex flex-col sm:flex-row gap-3 pt-2">
              <Input
                type="email"
                required
                placeholder="Enter your registered account email..."
                value={dataEmail}
                onChange={(e) => setDataEmail(e.target.value)}
                className="bg-white/[0.04] border-white/[0.08] text-white text-xs h-11 rounded-xl flex-1"
              />
              <Button
                type="submit"
                className="bg-[#FACE25] hover:bg-[#eab308] text-zinc-950 font-bold text-xs h-11 rounded-xl px-5 cursor-pointer shadow-md"
              >
                Request Export
              </Button>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>
                Export request confirmed for <strong>{dataEmail}</strong>. You will receive an email download link once your archive is compiled.
              </span>
            </div>
          )}
        </div>
      </div>
    </InfoLayout>
  );
}
