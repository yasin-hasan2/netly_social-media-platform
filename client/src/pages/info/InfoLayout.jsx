import { Link, useLocation } from "react-router-dom";
import {
  Info,
  HelpCircle,
  Sparkles,
  Newspaper,
  Code,
  Briefcase,
  Shield,
  FileText,
  MapPin,
  Globe,
  CheckCircle2,
  ArrowLeft,
  Home,
} from "lucide-react";
import BlueTagBadge from "@/components/shared/BlueTagBadge";

const NAV_ITEMS = [
  { path: "/about", label: "About", icon: Info },
  { path: "/help", label: "Help Center", icon: HelpCircle },
  { path: "/feature-and-feedback", label: "Features & Feedback", icon: Sparkles },
  { path: "/press", label: "Press", icon: Newspaper },
  { path: "/api", label: "API & Devs", icon: Code },
  { path: "/jobs", label: "Jobs", icon: Briefcase },
  { path: "/privacy", label: "Privacy", icon: Shield },
  { path: "/terms", label: "Terms", icon: FileText },
  { path: "/locations", label: "Locations", icon: MapPin },
  { path: "/language", label: "Language", icon: Globe },
  { path: "/verified", label: "Verified Badge", icon: CheckCircle2, isBadge: true },
];

export default function InfoLayout({ title, subtitle, icon: Icon, children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#090D16] text-zinc-100 antialiased selection:bg-amber-400 selection:text-zinc-950 pb-20">
      {/* Ambient background glows */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 10%, rgba(245, 158, 11, 0.08), transparent 45%), radial-gradient(circle at 90% 90%, rgba(56, 189, 248, 0.05), transparent 45%)",
        }}
      />

      {/* Top Banner Navigation Header */}
      <header className="sticky top-0 z-30 bg-[#090D16]/90 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 group text-white hover:text-amber-400 transition"
              title="Return to feed"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-zinc-950 font-black text-sm shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform">
                N
              </div>
              <span className="font-display font-bold text-lg text-white tracking-tight">
                Net-ly
              </span>
            </Link>

            <span className="text-zinc-600 hidden sm:inline">/</span>
            <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
              Company & Resources
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-3 py-1.5 rounded-xl transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Back to Feed</span>
            </Link>
          </div>
        </div>

        {/* Sub-nav horizontal pills */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 overflow-x-auto no-scrollbar py-2 flex items-center gap-1 border-t border-white/[0.04]">
          {NAV_ITEMS.map((item) => {
            const ItemIcon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === "/feature-and-feedback" &&
                location.pathname.toLowerCase() === "/featureandfeedback") ||
              (item.path === "/verified" && location.pathname === "/linkly-verified");

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? "bg-[#FACE25] text-zinc-950 shadow-md shadow-amber-500/15"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {item.isBadge ? (
                  <BlueTagBadge size="xs" />
                ) : (
                  <ItemIcon className="w-3.5 h-3.5" />
                )}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Page Title Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-3 mb-2">
            {Icon && (
              <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Child Page Content */}
        {children}
      </main>
    </div>
  );
}
