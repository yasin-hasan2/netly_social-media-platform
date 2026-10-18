import express from "express";
import upload from "../middlewares/multer.js";
import isAuthenticated, { optionalAuth } from "../middlewares/isAuthenticated.js";
import {
  getStories,
  createStory,
  deleteStory,
  markStoryViewed,
  toggleStoryLike,
} from "../controllers/story.controller.js";

const router = express.Router();

const uploadMedia = (req, res, next) => {
  upload.fields([
    { name: "media", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message, success: false });
    if (req.files) {
      if (req.files.media?.[0]) req.file = req.files.media[0];
      else if (req.files.video?.[0]) req.file = req.files.video[0];
      else if (req.files.image?.[0]) req.file = req.files.image[0];
    }
    next();
  });
};

router.route("/all").get(optionalAuth, getStories);
router.route("/create").post(isAuthenticated, uploadMedia, createStory);
router.route("/:id").delete(isAuthenticated, deleteStory);
router.route("/:id/view").post(isAuthenticated, markStoryViewed);
router.route("/:id/like").post(isAuthenticated, toggleStoryLike);

export default router;
