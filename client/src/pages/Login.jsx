import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios";
import { setAuthUser } from "@/redux/authSlice";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Login() {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const SUPER_ADMIN_EMAILS = [
    "yasinalhasan@gmail.com",
    "yaseenalhassan2@gmail.com",
  ];

  const checkAdminAndNavigate = (loggedUser) => {
    const email = (loggedUser?.email || "").toLowerCase();
    const isSuper = SUPER_ADMIN_EMAILS.includes(email) || loggedUser?.role === "super_admin";
    const isAdmin = loggedUser?.role === "admin" || isSuper;

    if (isAdmin) {
      navigate("/admin-portal");
    } else {
      navigate("/");
    }
  };

  const demoLoginHandler = async () => {
    const demoCredentials = { email: "demo@example.com", password: "password123" };
    setInput(demoCredentials);
    try {
      setLoading(true);
      const res = await axiosInstance.post("/user/login", demoCredentials, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (res.data.success) {
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        dispatch(setAuthUser(res.data.user));
        toast.success(res.data.message || "Logged in as demo user");
        checkAdminAndNavigate(res.data.user);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!input.email || !input.password) {
      toast.error("Please enter your email and password");
      return;
    }
    try {
      setLoading(true);
      const res = await axiosInstance.post("/user/login", input, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      if (res.data.success) {
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }
        dispatch(setAuthUser(res.data.user));
        toast.success(res.data.message || "Welcome back!");
        setInput({ email: "", password: "" });
        checkAdminAndNavigate(res.data.user);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkAdminAndNavigate(user);
    }
  }, [user]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#090D16] text-zinc-100 antialiased overflow-hidden">
      {/* Subtle modern ambient background glow */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 20%, rgba(245, 158, 11, 0.08), transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.05), transparent 50%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Login Card */}
        <div className="bg-[#111726]/80 border border-white/[0.08] backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 items-center justify-center text-zinc-950 font-black text-2xl shadow-lg shadow-amber-500/20 mb-2">
              N
            </div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs text-zinc-400">
              Sign in to your Net-ly account to explore stories and connect
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Email</label>
              <Input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={input.email}
                onChange={changeEventHandler}
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-500 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-amber-400 focus-visible:border-amber-400 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-amber-400 hover:text-amber-300 transition hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="password"
                name="password"
                placeholder="••••••••"
                value={input.password}
                onChange={changeEventHandler}
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-zinc-500 rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-amber-400 focus-visible:border-amber-400 text-sm"
              />
            </div>

            <div className="pt-2 space-y-2.5">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-sm rounded-xl transition shadow-md shadow-amber-500/10 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              <button
                type="button"
                onClick={demoLoginHandler}
                disabled={loading}
                className="w-full h-11 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.14] text-amber-300 hover:text-amber-200 font-medium text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick 1-Click Demo Login</span>
              </button>
            </div>
          </form>

          {/* Footer note */}
          <div className="pt-2 text-center text-xs text-zinc-400">
            <span>Don't have an account? </span>
            <Link
              to="/signup"
              className="text-amber-400 hover:text-amber-300 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
