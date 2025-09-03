import Particles from "@/components/animated/Particles";
import BottomBar from "@/components/shared/BottomBar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import TopBar from "@/components/shared/TopBar";
import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import StartupLoader from "@/components/animated/StartupLoader";

export default function MainLayout() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true); // loader state
  const location = useLocation();

  // detect chat page
  const isChatPage = location.pathname.startsWith("/chat");

  // Simulate startup loading (replace with actual API fetch if needed)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); // 2 seconds
    return () => clearTimeout(timer);
  }, []);

  // Scroll to top after loader finishes
  useEffect(() => {
    if (!loading) {
      window.scrollTo(0, 0);
    }
  }, [loading]);

  if (loading) return <StartupLoader />; // show loader first

  return (
    <div className="relative w-full h-full">
      {/* Background Particles */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "fixed",
          zIndex: -20,
        }}
      >
        <Particles
          particleColors={["#FACE25", "#ffffff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <LeftSidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 md:ml-[16%] relative">
          {/* Mobile TopBar (hidden on chat page) */}
          {!isChatPage && (
            <div className="md:hidden fixed top-0 left-0 right-0 z-50">
              <TopBar onSearchResults={setSearchResults} />
            </div>
          )}

          {/* Global search dropdown for mobile */}
          {!isChatPage && searchResults.length > 0 && (
            <div className="md:hidden absolute top-14 left-1/2 transform -translate-x-1/2 w-[90%] max-w-xl max-h-96 overflow-y-auto backdrop-blur-md bg-white/30 shadow-lg rounded-md z-50">
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-none"
                >
                  {"username" in item
                    ? `User: ${item.username}`
                    : `Post: ${item.caption.slice(0, 50)}...`}
                </div>
              ))}
            </div>
          )}

          <div className={`${!isChatPage ? "pt-12 md:pt-0" : ""}`}>
            <Outlet />
          </div>

          {/* Mobile BottomBar (hidden on chat page) */}
          {!isChatPage && (
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
              <BottomBar />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
