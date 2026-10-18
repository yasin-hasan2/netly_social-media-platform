import BottomBar from "@/components/shared/BottomBar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import TopBar from "@/components/shared/TopBar";
import { Outlet, useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Shield, Crown } from "lucide-react";

export default function MainLayout() {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const SUPER_ADMIN_EMAILS = [
    "yasinalhasan@gmail.com",
    "yaseenalhassan2@gmail.com",
  ];
  const email = (user?.email || "").toLowerCase();
  const isSuper = SUPER_ADMIN_EMAILS.includes(email) || user?.role === "super_admin";
  const hasAdminAccess = user?.role === "admin" || isSuper;

  // detect chat page
  const isChatPage = location.pathname.startsWith("/chat");

  return (
    <div className="relative min-h-screen w-full bg-[#0A0D14] text-zinc-100 antialiased overflow-x-hidden">
      {/* Subtle modern ambient background gradient */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.04), transparent 45%), radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.02), transparent 50%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen">
        {/* Desktop Left Sidebar (Clean fixed width 256px) */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <LeftSidebar />
        </div>

        {/* Main content column */}
        <div className="flex-1 md:ml-64 relative min-h-screen flex flex-col w-full min-w-0">
          {/* Global Navigation Header (Desktop & Mobile, hidden on full-screen chat) */}
          {!isChatPage && <TopBar />}

          <main className="flex-1 pb-20 md:pb-8 w-full min-w-0">
            <Outlet />
          </main>

          {/* Mobile Bottom Navigation Bar */}
          {!isChatPage && (
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
              <BottomBar />
            </div>
          )}

          {/* Privileged Floating Admin Button (Only visible to admin / super admin) */}
          {hasAdminAccess && (
            <Link
              to="/admin-portal"
              className="fixed bottom-20 md:bottom-6 right-5 z-40 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/10 shadow-xl backdrop-blur-md transition-all hover:scale-105 text-xs font-medium cursor-pointer"
              title="Open Admin Control Portal"
            >
              {isSuper ? (
                <Crown className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-sky-400" />
              )}
              <span>{isSuper ? "Super Admin" : "Admin"}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
