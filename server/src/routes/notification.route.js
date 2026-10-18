import express from "express";
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  clearUserNotifications,
  getBadgeCounts,
} from "../controllers/notification.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get("/", isAuthenticated, getUserNotifications);
router.get("/badge-counts", isAuthenticated, getBadgeCounts);
router.put("/mark-all-read", isAuthenticated, markAllNotificationsAsRead);
router.put("/:id/read", isAuthenticated, markNotificationAsRead);
router.delete("/clear", isAuthenticated, clearUserNotifications);

export default router;
