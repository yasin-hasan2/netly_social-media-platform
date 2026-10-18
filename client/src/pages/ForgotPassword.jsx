import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  KeyRound,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [devCode, setDevCode] = useState(null);
  const [devToken, setDevToken] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post(
        "/user/forgot-password",
        { email: email.trim().toLowerCase() },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setSubmitted(true);
        setPreviewUrl(res.data.previewUrl || null);
        setDevCode(res.data.devResetCode || null);
        setDevToken(res.data.devResetToken || null);
        toast.success(res.data.message || "Reset instructions sent to your email!");
      } else {
        toast.error(res.data?.message || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(
        error.response?.data?.message ||
          "Could not send reset email. Please verify your email and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#090D16] text-zinc-100 antialiased overflow-hidden">
      {/* Ambient background glows */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 15%, rgba(245, 158, 11, 0.09), transparent 50%), radial-gradient(circle at 80% 80%, rgba(56, 189, 248, 0.05), transparent 50%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-[#111726]/85 border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 items-center justify-center text-zinc-950 font-black text-2xl shadow-lg shadow-amber-500/20 mb-2">
              <KeyRound className="w-6 h-6 text-zinc-950" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">
              {submitted ? "Check Your Email" : "Forgot Password?"}
            </h1>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              {submitted
                ? `We sent reset instructions and a 6-digit verification code to ${email}`
                : "No worries! Enter your account's email and we will send you a reset link and verification code."}
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span>Email address</span>
                  <span className="text-[11px] text-zinc-500">Registered account email</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-500 pl-10 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-amber-400 focus-visible:border-amber-400 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FACE25] hover:bg-[#eab308] text-zinc-950 font-bold rounded-xl h-11 text-sm shadow-md shadow-amber-500/10 transition-all cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending email via Nodemailer...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Send Password Reset Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to login</span>
                  </Link>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              {/* Sent Confirmation Badge */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs text-zinc-200">
                  Password reset email has been dispatched via <strong>Nodemailer</strong>.
                </p>
                <p className="text-[11px] text-zinc-400">
                  Please check your spam or inbox folder. The link and code expire in 15 minutes.
                </p>
              </div>

              {/* Dev Mode Helper (shows preview link if Ethereal or test code was generated) */}
              {(previewUrl || devCode) && (
                <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-xs space-y-2">
                  <div className="flex items-center justify-between text-sky-300 font-semibold text-[11px] uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Development Preview
                    </span>
                    <span className="text-[10px] text-sky-400/80">Ethereal / Test Email</span>
                  </div>

                  {devCode && (
                    <div className="flex items-center justify-between bg-zinc-950/80 px-3 py-2 rounded-lg border border-sky-500/20">
                      <span className="text-zinc-400 text-xs">Generated 6-Digit Code:</span>
                      <span className="font-mono text-base font-bold text-amber-400 tracking-wider">
                        {devCode}
                      </span>
                    </div>
                  )}

                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-lg text-xs font-medium transition"
                    >
                      <span>View Email in Ethereal Mail</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2.5">
                <Button
                  onClick={() =>
                    navigate(
                      `/reset-password?email=${encodeURIComponent(email)}${
                        devCode ? `&code=${devCode}` : ""
                      }${devToken ? `&token=${devToken}` : ""}`
                    )
                  }
                  className="w-full bg-[#FACE25] hover:bg-[#eab308] text-zinc-950 font-bold rounded-xl h-11 text-sm shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  Enter Verification Code / Reset Password
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setSubmitted(false)}
                  className="w-full text-xs text-zinc-400 hover:text-white rounded-xl h-9"
                >
                  Didn't receive it? Try a different email
                </Button>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to login</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
