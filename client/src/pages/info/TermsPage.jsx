import InfoLayout from "./InfoLayout";
import { FileText, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";

export default function TermsPage() {
  return (
    <InfoLayout
      title="Terms of Service"
      subtitle="Last updated: October 2026. Please read these terms carefully before accessing or using the Net-ly social network."
      icon={FileText}
    >
      <div className="space-y-8 max-w-4xl text-xs sm:text-sm text-zinc-300 leading-relaxed">
        {/* Intro */}
        <div className="p-6 rounded-2xl bg-[#111726]/60 border border-white/[0.06] space-y-3">
          <h3 className="text-base font-bold text-white">1. Agreement to Terms</h3>
          <p>
            By creating an account, accessing, or browsing Net-ly (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use our services.
          </p>
        </div>

        {/* Community Guidelines */}
        <div className="p-6 rounded-2xl bg-[#111726]/60 border border-white/[0.06] space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            2. Community Guidelines & Acceptable Use
          </h3>
          <p>
            Net-ly is a safe, creative, and respectful social ecosystem. You agree NOT to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
            <li>Harass, intimidate, stalk, or defame any individual or group.</li>
            <li>Post illegal content, copyright infringements, or unauthorized intimate media.</li>
            <li>Deploy automated scrapers, spam bots, or attempt unauthorized penetration tests.</li>
            <li>Impersonate public figures, brands, or verified Blue Tag creators.</li>
          </ul>
        </div>

        {/* Content Ownership */}
        <div className="p-6 rounded-2xl bg-[#111726]/60 border border-white/[0.06] space-y-3">
          <h3 className="text-base font-bold text-white">3. Your Content & Intellectual Property</h3>
          <p>
            <strong>You own all content you create and post.</strong> You retain complete intellectual property rights to the photos, captions, videos, and comments you publish on Net-ly. By posting content, you grant Net-ly a non-exclusive, royalty-free license solely to display, format, and deliver your content across the platform.
          </p>
        </div>

        {/* Blue Tag & Verification */}
        <div className="p-6 rounded-2xl bg-[#111726]/60 border border-white/[0.06] space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            4. Blue Tag Verification & Governance
          </h3>
          <p>
            The Blue Tag verified badge is awarded exclusively by the Super Administrator or authorized platform managers. Verification does not constitute an endorsement by Net-ly. Verified status may be revoked at any time if an account violates community guidelines or impersonates others.
          </p>
        </div>

        {/* Account Termination */}
        <div className="p-6 rounded-2xl bg-[#111726]/60 border border-white/[0.06] space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            5. Suspension & Account Termination
          </h3>
          <p>
            Net-ly reserves the right to suspend or permanently terminate accounts that engage in egregious abuse, security tampering, spamming, or repeated policy violations. You may also delete your account at any time.
          </p>
        </div>
      </div>
    </InfoLayout>
  );
}
