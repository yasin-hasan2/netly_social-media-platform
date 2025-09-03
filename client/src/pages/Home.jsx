import Feed from "@/components/shared/Feed";
import Footer from "@/components/shared/Footer";
import RightSidebar from "@/components/shared/RightSidebar";
import useGetAllPost from "@/hooks/useGetAllPost";
import useGetSuggestedUsers from "@/hooks/userGetSuggestedUsers";
import { Outlet } from "react-router-dom";

export default function Home() {
  useGetAllPost();
  useGetSuggestedUsers();

  return (
    <div className="flex justify-center w-full px-2 md:px-6 relative ">
      {/* Main Feed */}
      <div className="w-full md:w-[60%] lg:w-[55%] xl:w-[50%]   ">
        <div className="">
          <Feed />
          <Outlet />
        </div>
      </div>

      {/* Right Sidebar - hidden on small screens */}
      <div className="hidden md:block w-[35%] lg:w-[30%] xl:w-[25%] pl-6  ">
        <div className="sticky top-4">
          <RightSidebar />
          {/* <div>
            <Footer />
          </div> */}
        </div>
      </div>
    </div>
  );
}
