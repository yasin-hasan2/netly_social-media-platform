import Feed from "@/components/shared/Feed";
import RightSidebar from "@/components/shared/RightSidebar";
import useGetAllPost from "@/hooks/useGetAllPost";
import useGetSuggestedUsers from "@/hooks/userGetSuggestedUsers";
import { Outlet } from "react-router-dom";

export default function Home() {
  useGetAllPost();
  useGetSuggestedUsers();

  return (
    <div className="flex justify-center w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6 gap-8">
      {/* Main Center Feed */}
      <div className="w-full max-w-[620px] flex-1">
        <Feed />
        <Outlet />
      </div>

      {/* Right Sidebar (Desktop only) */}
      <aside className="hidden lg:block w-80 flex-shrink-0">
        <div className="sticky top-20">
          <RightSidebar />
        </div>
      </aside>
    </div>
  );
}
