import express from "express";
import {
  editProfile,
  followOrUnfollowUser,
  getAllUsers,
  getFollowers,
  getFollowing,
  getProfile,
  getSuggestedUsers,
  login,
  logout,
  registerUser,
  toggleProfilePrivacy,
  forgotPassword,
  verifyResetToken,
  resetPassword,
} from "../controllers/user.controller.js";
import isAuthenticated, { optionalAuth } from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(login);
router.route("/logout").get(logout);

// Password Reset Routes
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-reset-token").get(verifyResetToken);
router.route("/reset-password").post(resetPassword);

router.route("/:id/profile").get(optionalAuth, getProfile);
router
  .route("/profile/edit")
  .post(isAuthenticated, upload.single("profilePhoto"), editProfile);
router.route("/profile/toggle-privacy").post(isAuthenticated, toggleProfilePrivacy);
router.route("/suggested").get(optionalAuth, getSuggestedUsers);
router.route("/:id/followers").get(optionalAuth, getFollowers);
router.route("/:id/following").get(optionalAuth, getFollowing);
router
  .route("/followorunfollow/:id")
  .post(isAuthenticated, followOrUnfollowUser);

router.get("/allUsers", getAllUsers);

router.get("/me", isAuthenticated, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
// This code defines the user-related routes for the application.

// If you want to upload both profile and cover photo at the same time use below code by commenting the above edit profile route and uncommenting the below one and also uncomment the related code in controller file

// router.route("/profile/edit").post(
//   isAuthenticated,
//   upload.fields([
//     { name: "profilePhoto", maxCount: 1 },
//     { name: "coverPhoto", maxCount: 1 },
//   ]),
//   editProfile
// );
