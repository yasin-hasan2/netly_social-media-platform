import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import {
  Lock,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryToken = searchParams.get("token") || "";
  const queryEmail = searchParams.get("email") || "";
  const queryCode = searchParams.get("code") || "";

  const [email, setEmail] = useState(queryEmail);
  const [token, setToken] = useState(queryToken);
  const [code, setCode] = useState(queryCode);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [verifyingToken, setVerifyingToken] = useState(Boolean(queryToken));
  const [tokenValid, setTokenValid] = useState(true);
  const [tokenError, setTokenError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Method mode: 'token' if token provided, else 'code'
  const [resetMode, setResetMode] = useState(queryToken ? "token" : "code");

  // Verify token on mount if provided in URL
  useEffect(() => {
    if (!queryToken) return;

    const verify = async () => {
      try {
        setVerifyingToken(true);
        const res = await axiosInstance.get(
          `/user/verify-reset-token?token=${encodeURIComponent(queryToken)}`,
          { withCredentials: true }
        );
        if (res.data?.success) {
          setTokenValid(true);
          if (res.data.email) setEmail(res.data.email);
        } else {
          setTokenValid(false);
          setTokenError(res.data?.message || "Invalid or expired reset link.");
        }
      } catch (err) {
        setTokenValid(false);
        setTokenError(
          err.response?.data?.message ||
            "This password reset link is invalid or has expired. Please request a new one."
        );
      } finally {
        setVerifyingToken(false);
      }
    };

    verify();
  }, [queryToken]);

  // Password rules
  const isLengthValid = newPassword.length >= 6;
  const isMatchValid = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (!isLengthValid) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (resetMode === "code" && (!code || code.trim().length !== 6)) {
      toast.error("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        token: resetMode === "token" ? token : undefined,
        code: resetMode === "code" ? code.trim() : undefined,
        email: email ? email.trim().toLowerCase() : undefined,
        newPassword,
        confirmPassword,
      };

      const res = await axiosInstance.post("/user/reset-password", payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        setResetSuccess(true);
        toast.success(res.data.message || "Password successfully reset!");
      } else {
        toast.error(res.data?.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to reset password. The code or link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  if (verifyingToken) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#090D16] text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FACE25]" />
          <p className="text-xs text-zinc-400 font-medium">
            Verifying your password reset security link...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#090D16] text-zinc-100 antialiased overflow-hidden">
      {/* Background radial highlights */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 15%, rgba(245, 158, 11, 0.09), transparent 50%), radial-gradient(circle at 80% 80%, rgba(56, 189, 248, 0.05), transparent 50%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#111726]/85 border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 items-center justify-center text-zinc-950 font-black text-2xl shadow-lg shadow-amber-500/20 mb-2">
              <ShieldCheck className="w-6 h-6 text-zinc-950" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">
              {resetSuccess
                ? "Password Reset Complete!"
                : !tokenValid && queryToken
                ? "Expired or Invalid Link"
                : "Create New Password"}
            </h1>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              {resetSuccess
                ? "Your Net-ly password has been updated securely. You can now log in with your new credentials."
                : !tokenValid && queryToken
                ? tokenError || "This password reset token has expired or is invalid."
                : "Choose a strong password with at least 6 characters."}
            </p>
          </div>

          {/* Invalid Token State */}
          {!tokenValid && queryToken && !resetSuccess ? (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-2">
                <p className="text-xs text-rose-300 font-medium">
                  {tokenError || "This password reset link is no longer valid."}
                </p>
                <p className="text-[11px] text-zinc-400">
                  Password reset links expire after 15 minutes for your account security.
                </p>
              </div>

              <Button
                onClick={() => navigate("/forgot-password")}
                className="w-full bg-[#FACE25] hover:bg-[#eab308] text-zinc-950 font-bold rounded-xl h-11 text-sm shadow-md cursor-pointer"
              >
                Request a New Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to login</span>
                </Link>
              </div>
            </div>
          ) : resetSuccess ? (
            /* Success State */
            <div className="space-y-5 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs text-emerald-300 font-semibold">
                  Credentials Successfully Updated
                </p>
                <p className="text-[11px] text-zinc-400">
                  Your new password is now active. All active password reset tokens have been invalidated.
                </p>
              </div>

              <Button
                onClick={() => navigate("/login")}
                className="w-full bg-[#FACE25] hover:bg-[#eab308] text-zinc-950 font-bold rounded-xl h-11 text-sm shadow-md shadow-amber-500/15 cursor-pointer"
              >
                Log In to Net-ly
              </Button>
            </div>
          ) : (
            /* Reset Password Form */
            <form onSubmit={handleResetSubmit} className="space-y-4">
              {/* Method Switcher if not using verified URL token */}
              {!queryToken && (
                <div className="grid grid-cols-2 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setResetMode("code")}
                    className={`py-1.5 rounded-lg transition cursor-pointer ${
                      resetMode === "code"
                        ? "bg-[#FACE25] text-zinc-950 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    6-Digit Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetMode("token")}
                    className={`py-1.5 rounded-lg transition cursor-pointer ${
                      resetMode === "token"
                        ? "bg-[#FACE25] text-zinc-950 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Security Token
                  </button>
                </div>
              )}

              {/* Email (if needed) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Account Email</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-500 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-amber-400 text-sm"
                />
              </div>

              {/* 6-Digit Code Input (when in code mode) */}
              {resetMode === "code" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-300">
                      6-Digit Verification Code
                    </label>
                    <span className="text-[10px] text-amber-400 font-mono">From email</span>
                  </div>
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                    className="bg-white/[0.04] border-white/[0.08] text-amber-400 font-mono text-center tracking-widest text-lg font-bold rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-amber-400"
                  />
                </div>
              )}

              {/* Token Input (when in manual token mode) */}
              {resetMode === "token" && !queryToken && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Reset Token</label>
                  <Input
                    type="text"
                    placeholder="Paste hex token from email"
                    value={token}
                    onChange={(e) => setToken(e.target.value.trim())}
                    required
                    className="bg-white/[0.04] border-white/[0.08] text-white font-mono text-xs rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-amber-400"
                  />
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-500 pl-10 pr-10 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-amber-400 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-500 pl-10 pr-10 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-amber-400 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Requirement Checklist */}
              <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl space-y-1.5 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 ${
                    isLengthValid ? "text-emerald-400" : "text-zinc-400"
                  }`}
                >
                  {isLengthValid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>At least 6 characters long</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    isMatchValid ? "text-emerald-400" : "text-zinc-400"
                  }`}
                >
                  {isMatchValid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  <span>Passwords match</span>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <Button
                  type="submit"
                  disabled={loading || !isLengthValid || !isMatchValid}
                  className="w-full bg-[#FACE25] hover:bg-[#eab308] text-zinc-950 font-bold rounded-xl h-11 text-sm shadow-md shadow-amber-500/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating password...</span>
                    </div>
                  ) : (
                    <span>Save New Password</span>
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
          )}
        </div>
      </div>
    </div>
  );
}
