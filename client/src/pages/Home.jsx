import Feed from "@/components/shared/Feed";
import RightSidebar from "@/components/shared/RightSidebar";
import useGetAllPost from "@/hooks/useGetAllPost";
import useGetSuggestedUsers from "@/hooks/userGetSuggestedUsers";

import { Outlet } from "react-router-dom";

export default function Home() {
  useGetAllPost();
  useGetSuggestedUsers();
  return (
    <div className="flex">
      <div className="flex-grow">
        <Feed />
        <Outlet />
      </div>
      <RightSidebar />
    </div>
  );
}
