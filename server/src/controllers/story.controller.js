import sharp from "sharp";
import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import { Story } from "../models/story.model.js";
import { User } from "../models/user.model.js";
import { memoryStore } from "../lib/memoryStore.js";

export const getStories = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const storyGroups = memoryStore.getActiveStories();
      return res.status(200).json({
        success: true,
        message: "Stories fetched successfully",
        storyGroups,
      });
    }

    const now = new Date();
    let stories = await Story.find({ expiresAt: { $gt: now } })
      .sort({ createdAt: 1 })
      .populate("author", "username profilePicture isBlueTag");

    // If only one user has stories or no other users have stories, seed stories for other users so everyone has interactive stories
    if (stories.length < 3) {
      const otherUsers = await User.find({
        profilePicture: { $exists: true, $ne: "" },
      }).limit(5);

      const sampleStoryImages = [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      ];
      const sampleCaptions = [
        "Chasing golden hour in the mountains 🏔️✨",
        "Building new creative things today! ☕💻",
        "Nature walk to clear the mind 🌿 Happy weekend!",
      ];

      for (let i = 0; i < otherUsers.length && i < 3; i++) {
        const u = otherUsers[i];
        const existing = await Story.findOne({ author: u._id, expiresAt: { $gt: now } });
        if (!existing) {
          await Story.create({
            author: u._id,
            media: sampleStoryImages[i % sampleStoryImages.length],
            mediaType: "image",
            caption: sampleCaptions[i % sampleCaptions.length],
            views: [],
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          });
        }
      }

      // Re-fetch populated stories
      stories = await Story.find({ expiresAt: { $gt: now } })
        .sort({ createdAt: 1 })
        .populate("author", "username profilePicture isBlueTag");
    }

    // Group by author
    const groupsMap = new Map();
    for (const story of stories) {
      const authorId = story.author?._id?.toString() || "unknown";
      if (!groupsMap.has(authorId)) {
        groupsMap.set(authorId, {
          author: story.author,
          stories: [],
        });
      }
      groupsMap.get(authorId).stories.push(story);
    }

    return res.status(200).json({
      success: true,
      message: "Stories fetched successfully",
      storyGroups: Array.from(groupsMap.values()),
    });
  } catch (error) {
    console.error("getStories error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch stories" });
  }
};

export const createStory = async (req, res) => {
  try {
    const authorId = req.user ? req.user._id : req.id;
    const { caption } = req.body;
    const mediaFile = req.file;

    if (!mediaFile) {
      return res.status(400).json({ success: false, message: "Media file is required for a story" });
    }

    const isVideo = mediaFile.mimetype.startsWith("video/");
    let mediaUrl = "";

    if (isVideo) {
      const videoDataUri = `data:${mediaFile.mimetype || "video/mp4"};base64,${mediaFile.buffer.toString("base64")}`;
      mediaUrl = videoDataUri;

      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        try {
          const cloudRes = await cloudinary.uploader.upload(videoDataUri, {
            resource_type: "video",
            transformation: [{ quality: "auto:eco", fetch_format: "auto" }],
          });
          mediaUrl = cloudRes.secure_url;
        } catch (err) {
          console.warn("Cloudinary story video upload fallback:", err.message);
        }
      }
    } else {
      let fileUri;
      try {
        const optimizedBuffer = await sharp(mediaFile.buffer)
          .resize({ width: 1080, height: 1920, fit: "inside" })
          .toFormat("jpeg", { quality: 85 })
          .toBuffer();
        fileUri = `data:image/jpeg;base64,${optimizedBuffer.toString("base64")}`;
      } catch {
        fileUri = `data:${mediaFile.mimetype || "image/jpeg"};base64,${mediaFile.buffer.toString("base64")}`;
      }
      mediaUrl = fileUri;

      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        try {
          const cloudRes = await cloudinary.uploader.upload(fileUri);
          mediaUrl = cloudRes.secure_url;
        } catch (err) {
          console.warn("Cloudinary story image upload fallback:", err.message);
        }
      }
    }

    if (mongoose.connection.readyState !== 1) {
      const story = memoryStore.createStory({
        authorId,
        media: mediaUrl,
        mediaType: isVideo ? "video" : "image",
        caption: (caption || "").trim(),
      });
      return res.status(201).json({
        success: true,
        message: "Story shared for 24 hours",
        story,
      });
    }

    const story = await Story.create({
      author: authorId,
      media: mediaUrl,
      mediaType: isVideo ? "video" : "image",
      caption: (caption || "").trim(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await story.populate("author", "username profilePicture");
    return res.status(201).json({
      success: true,
      message: "Story shared for 24 hours",
      story,
    });
  } catch (error) {
    console.error("createStory error:", error);
    return res.status(500).json({ success: false, message: "Failed to create story" });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.id;

    if (mongoose.connection.readyState !== 1) {
      const result = memoryStore.deleteStory(storyId, userId);
      return res.status(result.status || 200).json(result);
    }

    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });
    if (story.author.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await Story.findByIdAndDelete(storyId);
    return res.status(200).json({ success: true, message: "Story deleted" });
  } catch (error) {
    console.error("deleteStory error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete story" });
  }
};

export const markStoryViewed = async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.id;

    if (mongoose.connection.readyState !== 1) {
      const story = memoryStore.viewStory(storyId, userId);
      return res.status(200).json({ success: true, story });
    }

    const story = await Story.findByIdAndUpdate(
      storyId,
      { $addToSet: { views: userId } },
      { new: true }
    );
    return res.status(200).json({ success: true, story });
  } catch (error) {
    console.error("markStoryViewed error:", error);
    return res.status(500).json({ success: false, message: "Failed to update view" });
  }
};

export const toggleStoryLike = async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.id;

    if (mongoose.connection.readyState !== 1) {
      const story = memoryStore.stories.get(storyId);
      if (!story) return res.status(404).json({ success: false, message: "Story not found" });
      if (!Array.isArray(story.likes)) story.likes = [];
      const hasLiked = story.likes.includes(userId);
      if (hasLiked) {
        story.likes = story.likes.filter((id) => id !== userId);
      } else {
        story.likes.push(userId);
      }
      return res.status(200).json({
        success: true,
        liked: !hasLiked,
        likesCount: story.likes.length,
      });
    }

    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });

    if (!Array.isArray(story.likes)) story.likes = [];
    const hasLiked = story.likes.some((id) => id.toString() === userId.toString());
    if (hasLiked) {
      story.likes = story.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      story.likes.push(userId);
    }
    await story.save();

    return res.status(200).json({
      success: true,
      liked: !hasLiked,
      likesCount: story.likes.length,
    });
  } catch (error) {
    console.error("toggleStoryLike error:", error);
    return res.status(500).json({ success: false, message: "Failed to toggle story like" });
  }
};

