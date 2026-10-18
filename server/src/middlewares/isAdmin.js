import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { memoryStore } from "../lib/memoryStore.js";

const SUPER_ADMIN_EMAILS = [
  "yasinalhasan@gmail.com",
  "yaseenalhassan2@gmail.com",
];

export const isAdmin = async (req, res, next) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    let user;
    if (mongoose.connection.readyState !== 1) {
      user = memoryStore.getUserById(userId);
    } else {
      user = await User.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const email = (user.email || "").toLowerCase();
    const isSuperByEmail = SUPER_ADMIN_EMAILS.includes(email);
    const hasAdminRole = user.role === "admin" || user.role === "super_admin" || isSuperByEmail;

    if (!hasAdminRole) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Administrator privileges required.",
      });
    }

    // Attach role and user to req
    const isSuper = isSuperByEmail || user.role === "super_admin";
    req.userRole = isSuper ? "super_admin" : user.role;
    req.adminUser = user;
    req.canManageBlueTag = isSuper || Boolean(user.canManageBlueTag);
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({ success: false, message: "Authorization check failed" });
  }
};

export const isSuperAdmin = async (req, res, next) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    let user;
    if (mongoose.connection.readyState !== 1) {
      user = memoryStore.getUserById(userId);
    } else {
      user = await User.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const email = (user.email || "").toLowerCase();
    const isSuper = user.role === "super_admin" || SUPER_ADMIN_EMAILS.includes(email);

    if (!isSuper) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Super Admin has permission to perform this action.",
      });
    }

    req.userRole = "super_admin";
    req.adminUser = user;
    req.canManageBlueTag = true;
    next();
  } catch (error) {
    console.error("Super Admin middleware error:", error);
    return res.status(500).json({ success: false, message: "Authorization check failed" });
  }
};

export const canManageBlueTag = async (req, res, next) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    let user = req.adminUser;
    if (!user) {
      if (mongoose.connection.readyState !== 1) {
        user = memoryStore.getUserById(userId);
      } else {
        user = await User.findById(userId);
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const email = (user.email || "").toLowerCase();
    const isSuper = user.role === "super_admin" || SUPER_ADMIN_EMAILS.includes(email);
    const hasAccess = isSuper || (user.role === "admin" && Boolean(user.canManageBlueTag));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Super Admin or authorized Admins with Blue Tag privileges can grant or revoke Blue Tags.",
      });
    }

    req.userRole = isSuper ? "super_admin" : user.role;
    req.adminUser = user;
    req.canManageBlueTag = true;
    next();
  } catch (error) {
    console.error("canManageBlueTag middleware error:", error);
    return res.status(500).json({ success: false, message: "Authorization check failed" });
  }
};
