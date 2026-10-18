import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const SUPER_ADMIN_EMAILS = [
  "yasinalhasan@gmail.com",
  "yaseenalhassan2@gmail.com",
];

const AdminRoute = ({ children }) => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const email = (user.email || "").toLowerCase();
    const isSuper = SUPER_ADMIN_EMAILS.includes(email) || user.role === "super_admin";
    const isAdmin = user.role === "admin" || isSuper;

    if (!isAdmin) {
      navigate("/");
    }
  }, [user, navigate]);

  const email = (user?.email || "").toLowerCase();
  const isSuper = SUPER_ADMIN_EMAILS.includes(email) || user?.role === "super_admin";
  const isAdmin = user?.role === "admin" || isSuper;

  if (!user || !isAdmin) return null;

  return <>{children}</>;
};

export default AdminRoute;
