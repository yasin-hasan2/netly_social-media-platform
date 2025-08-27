// import React from "react";
import LeftSidebar from "@/components/shared/LeftSidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="">
      <LeftSidebar />
      <div>
        <Outlet />
      </div>
    </div>
  );
}
