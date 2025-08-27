import express from "express";
import {
  editProfile,
  followOrUnfollowUser,
  getProfile,
  getSuggestedUsers,
  login,
  logout,
  registerUser,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/:id/profile").get(isAuthenticated, getProfile);
router
  .route("/profile/edit")
  .post(isAuthenticated, upload.single("profilePhoto"), editProfile);
router.route("/suggested").get(isAuthenticated, getSuggestedUsers);
router
  .route("/followorunfollow/:id")
  .post(isAuthenticated, followOrUnfollowUser);

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
