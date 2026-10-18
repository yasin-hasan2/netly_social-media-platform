import express from "express";
import upload from "../middlewares/multer.js";
import isAuthenticated, { optionalAuth } from "../middlewares/isAuthenticated.js";
import {
  addNewPost,
  bookmarkPost,
  commentPost,
  deletePost,
  disLikePost,
  getAllPosts,
  getReels,
  repostPost,
  getCommentsOfPost,
  getUserPost,
  likePost,
  updatePost,
  sharePost,
} from "../controllers/post.controller.js";

const router = express.Router();

// Upload middleware allowing either 'image', 'video', or generic 'media'
const uploadMedia = (req, res, next) => {
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "media", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      console.warn("Upload middleware error:", err.message);
      return res.status(400).json({ message: err.message, success: false });
    }
    // Normalise req.file to whichever was uploaded
    if (req.files) {
      if (req.files.media?.[0]) req.file = req.files.media[0];
      else if (req.files.video?.[0]) req.file = req.files.video[0];
      else if (req.files.image?.[0]) req.file = req.files.image[0];
    }
    next();
  });
};

router.route("/addPost").post(isAuthenticated, uploadMedia, addNewPost);
router.route("/all").get(optionalAuth, getAllPosts);
router.route("/reels").get(optionalAuth, getReels);
router.route("/userPost/all").get(isAuthenticated, getUserPost);
router.route("/:id/like").get(isAuthenticated, likePost);
router.route("/:id/dislike").get(isAuthenticated, disLikePost);
router.route("/:id/repost").post(isAuthenticated, repostPost);
router.route("/:id/comment").post(isAuthenticated, commentPost);
router.route("/:id/comment/all").post(isAuthenticated, getCommentsOfPost);
router.route("/:id/edit").put(isAuthenticated, updatePost).post(isAuthenticated, updatePost);
router.route("/:id/share").post(isAuthenticated, sharePost);
router.route("/delete/:id").delete(isAuthenticated, deletePost);
router.route("/:id/bookmark").get(isAuthenticated, bookmarkPost);

export default router;
