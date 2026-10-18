import express from "express";
import { globalSearch, getPostsByHashtag } from "../controllers/search.controller.js";
import { optionalAuth } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Global search across users, posts, and hashtags
router.get("/", optionalAuth, globalSearch);

// Search posts by specific hashtag
router.get("/hashtag/:tag", optionalAuth, getPostsByHashtag);

export default router;
