import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isAdmin, isSuperAdmin } from "../middlewares/isAdmin.js";
import {
  getAdminStats,
  getAllUsersAdmin,
  updateUserByAdmin,
  changeUserRole,
  deleteUserByAdmin,
  getAllPostsAdmin,
  deletePostByAdmin,
  updateUserMessagingOptions,
  getAllConversationsAdmin,
  getConversationMessagesAdmin,
  deleteMessageByAdmin,
  deleteConversationByAdmin,
  toggleUserBlueTag,
  toggleAdminBlueTagAccess,
} from "../controllers/admin.controller.js";

const router = express.Router();

// All routes require authentication & at least Admin privileges
router.use(isAuthenticated, isAdmin);

// Stats & Analytics
router.get("/stats", getAdminStats);

// User Management (Admin & Super Admin)
router.get("/users", getAllUsersAdmin);
router.put("/user/:id", updateUserByAdmin);
router.delete("/user/:id", deleteUserByAdmin);

// Blue Tag Verification & Delegation Controls
// 1. Give / Revoke Blue Tag: Super Admin or Authorized Admin with canManageBlueTag privilege
router.put("/user/:id/blue-tag", toggleUserBlueTag);

// 2. Super Admin ONLY: Delegate Blue Tag Management privileges to other Admins
router.put("/user/:id/blue-tag-access", isSuperAdmin, toggleAdminBlueTagAccess);

// Super Admin ONLY: User Messaging Controls
router.put("/user/:id/messaging-options", isSuperAdmin, updateUserMessagingOptions);

// Super Admin ONLY: Role Elevation
router.put("/user/:id/role", isSuperAdmin, changeUserRole);

// Content Moderation (Posts)
router.get("/posts", getAllPostsAdmin);
router.delete("/post/:id", deletePostByAdmin);

// Direct Messages & Conversations Oversight (Super Admin & Admin)
router.get("/conversations", getAllConversationsAdmin);
router.get("/conversation/:id/messages", getConversationMessagesAdmin);
router.delete("/message/:id", deleteMessageByAdmin);
router.delete("/conversation/:id", deleteConversationByAdmin);

export default router;
