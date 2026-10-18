import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { memoryStore } from "../lib/memoryStore.js";

// Helper to extract hashtags from caption text
const extractHashtags = (text = "") => {
  if (!text || typeof text !== "string") return [];
  const matches = text.match(/#[a-zA-Z0-9_\u00c0-\u024e\u0600-\u06ff]+/g) || [];
  return matches.map((m) => m.slice(1).toLowerCase());
};

const SEED_HASHTAGS = [
  { tag: "photography", count: 18, sampleMedia: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&auto=format&fit=crop&q=80" },
  { tag: "technology", count: 14, sampleMedia: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80" },
  { tag: "coding", count: 11, sampleMedia: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&auto=format&fit=crop&q=80" },
  { tag: "books", count: 9, sampleMedia: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80" },
  { tag: "travel", count: 8, sampleMedia: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80" },
  { tag: "nature", count: 7, sampleMedia: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&auto=format&fit=crop&q=80" },
  { tag: "developer", count: 6, sampleMedia: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80" },
  { tag: "design", count: 5, sampleMedia: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=80" },
];

export const globalSearch = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const type = (req.query.type || "all").toLowerCase(); // 'all' | 'users' | 'posts' | 'hashtags'
    const limit = parseInt(req.query.limit) || 20;

    const isHashtagQuery = q.startsWith("#");
    const cleanQuery = q.replace(/^#/, "").toLowerCase();

    // 1. In-memory store fallback
    if (mongoose.connection.readyState !== 1) {
      const allUsers = Array.from(memoryStore.users.values());
      const allPosts = Array.from(memoryStore.posts.values());

      // If query is empty, return top trending hashtags & popular users
      if (!cleanQuery) {
        // Collect all hashtags across all posts
        const tagMap = new Map();
        for (const post of allPosts) {
          const combinedTags = new Set([
            ...(post.tags || []).map((t) => t.toLowerCase().replace(/^#/, "")),
            ...extractHashtags(post.caption),
          ]);
          for (const tag of combinedTags) {
            if (!tag) continue;
            const current = tagMap.get(tag) || { tag, count: 0, sampleMedia: "" };
            current.count += 1;
            if (!current.sampleMedia && (post.image || post.video)) {
              current.sampleMedia = post.image || post.video;
            }
            tagMap.set(tag, current);
          }
        }

        const trendingHashtags = Array.from(tagMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);

        const popularUsers = allUsers
          .slice(0, 6)
          .map((u) => ({
            _id: u._id,
            username: u.username,
            fullName: u.fullName,
            profilePicture: u.profilePicture,
            bio: u.bio,
            followersCount: (u.followers || []).length,
            role: u.role,
            accountStatus: u.accountStatus,
            isBlueTag: Boolean(u.isBlueTag),
          }));

        return res.status(200).json({
          success: true,
          query: "",
          users: popularUsers,
          posts: [],
          hashtags: trendingHashtags,
          total: popularUsers.length + trendingHashtags.length,
        });
      }

      let matchedUsers = [];
      let matchedPosts = [];
      let matchedHashtags = [];

      // A. Match Users
      if (type === "all" || type === "users") {
        matchedUsers = allUsers
          .filter((u) => {
            const username = (u.username || "").toLowerCase();
            const fullName = (u.fullName || "").toLowerCase();
            const bio = (u.bio || "").toLowerCase();
            return (
              username.includes(cleanQuery) ||
              fullName.includes(cleanQuery) ||
              bio.includes(cleanQuery)
            );
          })
          .slice(0, limit)
          .map((u) => ({
            _id: u._id,
            username: u.username,
            fullName: u.fullName,
            profilePicture: u.profilePicture,
            bio: u.bio,
            followersCount: (u.followers || []).length,
            role: u.role,
            accountStatus: u.accountStatus,
            isBlueTag: Boolean(u.isBlueTag),
          }));
      }

      // B. Match Posts
      if (type === "all" || type === "posts") {
        matchedPosts = allPosts
          .filter((p) => {
            const caption = (p.caption || "").toLowerCase();
            const location = (p.location || "").toLowerCase();
            const tags = (p.tags || []).map((t) => t.toLowerCase());
            return (
              caption.includes(cleanQuery) ||
              location.includes(cleanQuery) ||
              tags.some((t) => t.includes(cleanQuery))
            );
          })
          .slice(0, limit)
          .map((p) => {
            const author = memoryStore.getUserById(p.author) || {};
            return {
              _id: p._id,
              caption: p.caption,
              image: p.image,
              video: p.video,
              postType: p.postType || "post",
              likesCount: (p.likes || []).length,
              commentsCount: (p.comments || []).length,
              tags: p.tags || [],
              createdAt: p.createdAt,
              author: {
                _id: author._id,
                username: author.username,
                fullName: author.fullName,
                profilePicture: author.profilePicture,
              },
            };
          });
      }

      // C. Match Hashtags
      if (type === "all" || type === "hashtags" || isHashtagQuery) {
        const tagMap = new Map();
        for (const post of allPosts) {
          const combinedTags = new Set([
            ...(post.tags || []).map((t) => t.toLowerCase().replace(/^#/, "")),
            ...extractHashtags(post.caption),
          ]);
          for (const tag of combinedTags) {
            if (tag.includes(cleanQuery)) {
              const current = tagMap.get(tag) || { tag, count: 0, sampleMedia: "" };
              current.count += 1;
              if (!current.sampleMedia && (post.image || post.video)) {
                current.sampleMedia = post.image || post.video;
              }
              tagMap.set(tag, current);
            }
          }
        }
        matchedHashtags = Array.from(tagMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
      }

      return res.status(200).json({
        success: true,
        query: q,
        users: matchedUsers,
        posts: matchedPosts,
        hashtags: matchedHashtags,
        total: matchedUsers.length + matchedPosts.length + matchedHashtags.length,
      });
    }

    // 2. MongoDB execution
    if (!cleanQuery) {
      // Find top users and top hashtags
      const popularUsers = await User.find({})
        .select("username fullName profilePicture bio role accountStatus isBlueTag followers")
        .sort({ followers: -1 })
        .limit(6);

      const recentPosts = await Post.find({
        $or: [{ tags: { $exists: true, $not: { $size: 0 } } }, { caption: /#/ }],
      })
        .select("tags caption image video")
        .limit(50);

      const tagMap = new Map();
      for (const s of SEED_HASHTAGS) {
        tagMap.set(s.tag, { ...s });
      }

      for (const p of recentPosts) {
        const combined = new Set([
          ...(p.tags || []).map((t) => t.toLowerCase().replace(/^#/, "")),
          ...extractHashtags(p.caption),
        ]);
        for (const tag of combined) {
          if (!tag) continue;
          const cur = tagMap.get(tag) || { tag, count: 0, sampleMedia: "" };
          cur.count += 1;
          if (!cur.sampleMedia && (p.image || p.video)) {
            cur.sampleMedia = p.image || p.video;
          }
          tagMap.set(tag, cur);
        }
      }

      const trendingHashtags = Array.from(tagMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      return res.status(200).json({
        success: true,
        query: "",
        users: popularUsers.map((u) => ({
          _id: u._id,
          username: u.username,
          fullName: u.fullName,
          profilePicture: u.profilePicture,
          bio: u.bio,
          followersCount: (u.followers || []).length,
          role: u.role,
          accountStatus: u.accountStatus,
          isBlueTag: Boolean(u.isBlueTag),
        })),
        posts: [],
        hashtags: trendingHashtags,
        total: popularUsers.length + trendingHashtags.length,
      });
    }

    const regex = new RegExp(cleanQuery, "i");

    const promises = [];

    // Users Query
    if (type === "all" || type === "users") {
      promises.push(
        User.find({
          $or: [
            { username: regex },
            { fullName: regex },
            { bio: regex },
          ],
        })
          .select("username fullName profilePicture bio role accountStatus isBlueTag followers")
          .limit(limit)
          .lean()
      );
    } else {
      promises.push(Promise.resolve([]));
    }

    // Posts Query
    if (type === "all" || type === "posts") {
      promises.push(
        Post.find({
          $or: [
            { caption: regex },
            { tags: regex },
            { location: regex },
          ],
        })
          .populate("author", "username fullName profilePicture")
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean()
      );
    } else {
      promises.push(Promise.resolve([]));
    }

    // Hashtags Aggregation
    if (type === "all" || type === "hashtags" || isHashtagQuery) {
      promises.push(
        Post.find({
          $or: [{ tags: regex }, { caption: regex }],
        })
          .select("tags caption image video")
          .limit(80)
          .lean()
      );
    } else {
      promises.push(Promise.resolve([]));
    }

    const [rawUsers, rawPosts, hashtagCandidatePosts] = await Promise.all(promises);

    const formattedUsers = (rawUsers || []).map((u) => ({
      _id: u._id,
      username: u.username,
      fullName: u.fullName,
      profilePicture: u.profilePicture,
      bio: u.bio,
      followersCount: (u.followers || []).length,
      role: u.role,
      accountStatus: u.accountStatus,
    }));

    const formattedPosts = (rawPosts || []).map((p) => ({
      _id: p._id,
      caption: p.caption,
      image: p.image,
      video: p.video,
      postType: p.postType || "post",
      likesCount: (p.likes || []).length,
      commentsCount: (p.comments || []).length,
      tags: p.tags || [],
      createdAt: p.createdAt,
      author: p.author || {},
    }));

    const tagMap = new Map();
    for (const s of SEED_HASHTAGS) {
      if (s.tag.includes(cleanQuery)) {
        tagMap.set(s.tag, { ...s });
      }
    }
    for (const p of hashtagCandidatePosts || []) {
      const combined = new Set([
        ...(p.tags || []).map((t) => t.toLowerCase().replace(/^#/, "")),
        ...extractHashtags(p.caption),
      ]);
      for (const tag of combined) {
        if (tag.includes(cleanQuery)) {
          const cur = tagMap.get(tag) || { tag, count: 0, sampleMedia: "" };
          cur.count += 1;
          if (!cur.sampleMedia && (p.image || p.video)) {
            cur.sampleMedia = p.image || p.video;
          }
          tagMap.set(tag, cur);
        }
      }
    }

    const formattedHashtags = Array.from(tagMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return res.status(200).json({
      success: true,
      query: q,
      users: formattedUsers,
      posts: formattedPosts,
      hashtags: formattedHashtags,
      total: formattedUsers.length + formattedPosts.length + formattedHashtags.length,
    });
  } catch (error) {
    console.error("Global search error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during global search",
      error: error.message,
    });
  }
};

// Search posts specifically by hashtag
export const getPostsByHashtag = async (req, res) => {
  try {
    const rawTag = req.params.tag || "";
    const cleanTag = rawTag.replace(/^#/, "").toLowerCase();

    if (!cleanTag) {
      return res.status(400).json({ success: false, message: "Hashtag is required" });
    }

    if (mongoose.connection.readyState !== 1) {
      const allPosts = Array.from(memoryStore.posts.values());
      const matched = allPosts
        .filter((p) => {
          const tags = (p.tags || []).map((t) => t.toLowerCase().replace(/^#/, ""));
          const captionTags = extractHashtags(p.caption);
          return tags.includes(cleanTag) || captionTags.includes(cleanTag);
        })
        .map((p) => {
          const author = memoryStore.getUserById(p.author) || {};
          return {
            ...p,
            author: {
              _id: author._id,
              username: author.username,
              fullName: author.fullName,
              profilePicture: author.profilePicture,
            },
            likesCount: (p.likes || []).length,
            commentsCount: (p.comments || []).length,
          };
        });

      return res.status(200).json({
        success: true,
        tag: `#${cleanTag}`,
        count: matched.length,
        posts: matched,
      });
    }

    const regex = new RegExp(`(^|\\s|#)${cleanTag}(\\s|$|#)`, "i");
    const posts = await Post.find({
      $or: [
        { tags: { $in: [new RegExp(`^${cleanTag}$`, "i"), cleanTag] } },
        { caption: regex },
      ],
    })
      .populate("author", "username fullName profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      tag: `#${cleanTag}`,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Error in getPostsByHashtag:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch posts for hashtag" });
  }
};
