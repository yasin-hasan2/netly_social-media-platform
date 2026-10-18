import bcrypt from "bcryptjs";

// Helper to generate IDs
const uid = (prefix = "id") => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

// Pre-seeded demo password hash for "password123"
const DEMO_PASSWORD_HASH = bcrypt.hashSync("password123", 10);

class MemoryStore {
  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.stories = new Map();
    this.seed();
  }

  seed() {
    const user1 = {
      _id: "user_demo_1",
      username: "demo_user",
      fullName: "Demo User",
      email: "demo@example.com",
      password: DEMO_PASSWORD_HASH,
      profileType: "personal",
      profilePrivacy: "public",
      accountStatus: "verified",
      profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      coverPicture: "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=1200&auto=format&fit=crop&q=80",
      bio: "Welcome to Net-ly! Exploring this awesome social feed ✨",
      gender: "female",
      dateOfBirth: "1998-05-12",
      relationshipStatus: "single",
      contactInfo: { phone: "", email: "demo@example.com", socialLinks: {}, websiteLink: "" },
      followers: ["user_sarah_2"],
      following: ["user_sarah_2", "user_alex_3"],
      posts: ["post_demo_1"],
      bookmarks: [],
      role: "user",
      isBlueTag: false,
      canManageBlueTag: false,
      createdAt: new Date(Date.now() - 86400000 * 5),
    };

    const user2 = {
      _id: "user_sarah_2",
      username: "sarah_miller",
      fullName: "Sarah Miller",
      email: "sarah@example.com",
      password: DEMO_PASSWORD_HASH,
      profileType: "personal",
      profilePrivacy: "public",
      accountStatus: "verified",
      isBlueTag: true,
      canManageBlueTag: false,
      profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      coverPicture: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
      bio: "Visual storyteller & travel photographer 📸 Exploring golden hours 🌄",
      gender: "female",
      dateOfBirth: "1996-09-22",
      relationshipStatus: "single",
      contactInfo: { phone: "", email: "sarah@example.com", socialLinks: {}, websiteLink: "" },
      followers: ["user_demo_1"],
      following: ["user_demo_1"],
      posts: ["post_sarah_1"],
      bookmarks: [],
      role: "professional",
      createdAt: new Date(Date.now() - 86400000 * 10),
    };

    const user3 = {
      _id: "user_alex_3",
      username: "alex_chen",
      fullName: "Alex Chen",
      email: "alex@example.com",
      password: DEMO_PASSWORD_HASH,
      profileType: "personal",
      profilePrivacy: "public",
      accountStatus: "verified",
      isBlueTag: false,
      canManageBlueTag: false,
      profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      coverPicture: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80",
      bio: "Code craftsman, coffee addict & open-source contributor ☕🚀",
      gender: "male",
      dateOfBirth: "1995-03-15",
      relationshipStatus: "single",
      contactInfo: { phone: "", email: "alex@example.com", socialLinks: {}, websiteLink: "" },
      followers: ["user_demo_1"],
      following: [],
      posts: ["post_alex_1"],
      bookmarks: [],
      role: "user",
      createdAt: new Date(Date.now() - 86400000 * 12),
    };

    const userAdmin = {
      _id: "user_admin_marcus",
      username: "marcus_admin",
      fullName: "Marcus Vance (Admin)",
      email: "admin@example.com",
      password: DEMO_PASSWORD_HASH,
      profileType: "personal",
      category: "Platform Moderator",
      profilePrivacy: "public",
      accountStatus: "verified",
      isBlueTag: true,
      canManageBlueTag: false,
      profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      coverPicture: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80",
      bio: "Community moderator & safety lead 🛡️ Keeping conversations respectful.",
      gender: "male",
      dateOfBirth: "1993-04-18",
      relationshipStatus: "single",
      contactInfo: { phone: "", email: "admin@example.com", socialLinks: {}, websiteLink: "" },
      followers: ["user_demo_1"],
      following: ["user_demo_1"],
      posts: [],
      bookmarks: [],
      role: "admin",
      createdAt: new Date(Date.now() - 86400000 * 20),
    };

    const userSuperAdmin = {
      _id: "user_super_admin",
      username: "yasinalhasan",
      fullName: "Yasin Alhasan (Super Admin)",
      email: "yasinalhasan@gmail.com",
      password: DEMO_PASSWORD_HASH,
      profileType: "creator",
      category: "Platform Super Admin",
      profilePrivacy: "public",
      accountStatus: "verified",
      isBlueTag: true,
      canManageBlueTag: true,
      profilePicture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      coverPicture: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80",
      bio: "Super Admin · 100% Platform Controller",
      gender: "male",
      dateOfBirth: "1995-01-01",
      relationshipStatus: "single",
      contactInfo: { phone: "", email: "yasinalhasan@gmail.com", socialLinks: {}, websiteLink: "" },
      followers: ["user_demo_1", "user_sarah_2", "user_alex_3"],
      following: ["user_demo_1"],
      posts: [],
      bookmarks: [],
      role: "super_admin",
      createdAt: new Date(Date.now() - 86400000 * 30),
    };

    const userSuperAdmin2 = {
      _id: "user_super_admin_2",
      username: "yaseen_admin",
      fullName: "Yaseen Alhasan (Super Admin)",
      email: "yaseenalhassan2@gmail.com",
      password: DEMO_PASSWORD_HASH,
      profileType: "creator",
      category: "Platform Super Admin",
      profilePrivacy: "public",
      accountStatus: "verified",
      isBlueTag: true,
      canManageBlueTag: true,
      profilePicture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      coverPicture: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80",
      bio: "Super Admin · Full Platform Controller",
      gender: "male",
      dateOfBirth: "1995-01-01",
      relationshipStatus: "single",
      contactInfo: { phone: "", email: "yaseenalhassan2@gmail.com", socialLinks: {}, websiteLink: "" },
      followers: ["user_demo_1", "user_sarah_2"],
      following: ["user_demo_1"],
      posts: [],
      bookmarks: [],
      role: "super_admin",
      createdAt: new Date(Date.now() - 86400000 * 30),
    };

    this.users.set(user1._id, user1);
    this.users.set(user2._id, user2);
    this.users.set(user3._id, user3);
    this.users.set(userAdmin._id, userAdmin);
    this.users.set(userSuperAdmin._id, userSuperAdmin);
    this.users.set(userSuperAdmin2._id, userSuperAdmin2);

    const comment1 = {
      _id: "comment_1",
      text: "Breathtaking lighting in this shot! What lens did you use?",
      author: "user_demo_1",
      post: "post_sarah_1",
      createdAt: new Date(Date.now() - 3600000),
    };
    this.comments.set(comment1._id, comment1);

    const post1 = {
      _id: "post_sarah_1",
      caption: "Golden hour in the mountains 🏔️ Nothing beats this stillness after a long trek!",
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80",
      video: "",
      author: "user_sarah_2",
      likes: ["user_demo_1", "user_alex_3"],
      comments: ["comment_1"],
      tags: ["mountains", "nature", "wanderlust"],
      location: "Swiss Alps, Switzerland",
      feeling: "🏔️ Adventurous",
      sharesCount: 14,
      isEdited: false,
      createdAt: new Date(Date.now() - 7200000),
    };

    const post2 = {
      _id: "post_alex_1",
      caption: "Late night coding session with good beats and coffee ☕ Building the future step by step.",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80",
      video: "",
      author: "user_alex_3",
      likes: ["user_sarah_2"],
      comments: [],
      tags: ["coding", "setup", "developer", "nightowl"],
      location: "Shibuya, Tokyo",
      feeling: "☕ Focused",
      sharesCount: 8,
      isEdited: false,
      createdAt: new Date(Date.now() - 14400000),
    };

    const post3 = {
      _id: "post_demo_1",
      caption: "Excited to connect with creators and friends here on Net-ly! Drop a hello 👋",
      image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
      video: "",
      author: "user_demo_1",
      likes: ["user_sarah_2"],
      comments: [],
      tags: ["hello", "community", "welcome"],
      location: "San Francisco, CA",
      feeling: "✨ Excited",
      sharesCount: 5,
      isEdited: false,
      createdAt: new Date(Date.now() - 28800000),
    };

    const post4 = {
      _id: "post_sarah_2",
      caption: "Design is not just what it looks like and feels like — design is how it works. Truly obsessed with micro-interactions, responsive typography, and tactile UI feedback. What is your all-time favorite web design detail?",
      image: "",
      video: "",
      author: "user_sarah_2",
      likes: ["user_demo_1"],
      comments: [],
      tags: ["design", "ux", "frontend", "minimalism"],
      location: "Zurich, Switzerland",
      feeling: "💡 Inspired",
      sharesCount: 19,
      isEdited: false,
      createdAt: new Date(Date.now() - 54000000),
    };

    const post5 = {
      _id: "post_alex_2",
      caption: "Just shipped a major performance refactor! Reduced WebSocket payload latency by 42% and eradicated redundant client rerenders. Feeling the flow today 🚀",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
      video: "",
      author: "user_alex_3",
      likes: ["user_demo_1", "user_sarah_2"],
      comments: [],
      tags: ["performance", "javascript", "engineering"],
      location: "Tokyo, Japan",
      feeling: "🚀 Shipping",
      postType: "post",
      reposts: [],
      originalPost: null,
      sharesCount: 27,
      isEdited: true,
      editedAt: new Date(Date.now() - 86000000),
      createdAt: new Date(Date.now() - 90000000),
    };

    const reel1 = {
      _id: "reel_sarah_1",
      caption: "Golden light hitting the peaks at dawn 🏔️✨ Breathe in the crisp mountain air! #nature #reels #mountains",
      image: "",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      author: "user_sarah_2",
      likes: ["user_demo_1", "user_alex_3"],
      comments: ["comment_1"],
      tags: ["nature", "mountains", "wanderlust", "reels"],
      location: "Zermatt, Switzerland",
      feeling: "🏔️ Adventurous",
      postType: "reel",
      reposts: ["user_demo_1"],
      originalPost: null,
      sharesCount: 42,
      isEdited: false,
      createdAt: new Date(Date.now() - 18000000),
    };

    const reel2 = {
      _id: "reel_alex_1",
      caption: "Desk setup tour & key switch sound test ⌨️ Mechanical keyboards are therapeutic. Which switch do you prefer? 🎧",
      image: "",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      author: "user_alex_3",
      likes: ["user_sarah_2", "user_demo_1"],
      comments: [],
      tags: ["setup", "keyboard", "coding", "desksetup"],
      location: "Tokyo, Japan",
      feeling: "🎧 Relaxed",
      postType: "reel",
      reposts: [],
      originalPost: null,
      sharesCount: 31,
      isEdited: false,
      createdAt: new Date(Date.now() - 36000000),
    };

    const reel3 = {
      _id: "reel_demo_1",
      caption: "City sunset cruise through the bay 🌊 Golden hour magic in the city by the bay. Happy vibes only! ✨",
      image: "",
      video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
      author: "user_demo_1",
      likes: ["user_sarah_2"],
      comments: [],
      tags: ["city", "sunset", "travel", "vlog"],
      location: "San Francisco Bay",
      feeling: "✨ Excited",
      postType: "reel",
      reposts: [],
      originalPost: null,
      sharesCount: 18,
      isEdited: false,
      createdAt: new Date(Date.now() - 72000000),
    };

    this.posts.set(post1._id, { ...post1, postType: "post", reposts: [], originalPost: null });
    this.posts.set(post2._id, { ...post2, postType: "post", reposts: [], originalPost: null });
    this.posts.set(post3._id, { ...post3, postType: "post", reposts: [], originalPost: null });
    this.posts.set(post4._id, { ...post4, postType: "post", reposts: [], originalPost: null });
    this.posts.set(post5._id, post5);
    this.posts.set(reel1._id, reel1);
    this.posts.set(reel2._id, reel2);
    this.posts.set(reel3._id, reel3);

    // Initial seed conversation between demo_user and sarah_miller
    const initialMsg = {
      _id: "msg_init_1",
      senderId: "user_sarah_2",
      receiverId: "user_demo_1",
      content: "Hey Demo! Thanks for connecting on Net-ly ✨ Feel free to message anytime!",
      createdAt: new Date(Date.now() - 3600000 * 3),
    };
    this.messages.set(initialMsg._id, initialMsg);
    const initialConv = {
      _id: "conv_init_1",
      participants: ["user_demo_1", "user_sarah_2"],
      messages: ["msg_init_1"],
    };
    this.conversations.set(initialConv._id, initialConv);

    // Initial seed active 24-hr stories
    const story1 = {
      _id: "story_sarah_1",
      author: "user_sarah_2",
      media: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
      mediaType: "image",
      caption: "Sunrise across the valley 🌄 Stunning views today!",
      views: ["user_demo_1"],
      createdAt: new Date(Date.now() - 3600000 * 2),
      expiresAt: new Date(Date.now() + 3600000 * 22),
    };
    const story2 = {
      _id: "story_alex_1",
      author: "user_alex_3",
      media: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      mediaType: "image",
      caption: "Coding new real-time features ☕💻",
      views: [],
      createdAt: new Date(Date.now() - 3600000 * 4),
      expiresAt: new Date(Date.now() + 3600000 * 20),
    };
    this.stories.set(story1._id, story1);
    this.stories.set(story2._id, story2);
  }

  getUserByEmail(email) {
    if (!email) return null;
    for (const u of this.users.values()) {
      if (u.email && u.email.toLowerCase() === email.toLowerCase()) return { ...u };
    }
    return null;
  }

  getUserByResetToken(token) {
    if (!token) return null;
    for (const u of this.users.values()) {
      if (
        u.resetPasswordToken === token &&
        u.resetPasswordExpires &&
        new Date(u.resetPasswordExpires) > new Date()
      ) {
        return { ...u };
      }
    }
    return null;
  }

  getUserByResetCode(code, email) {
    if (!code) return null;
    for (const u of this.users.values()) {
      const emailMatches = email
        ? u.email && u.email.toLowerCase() === email.toLowerCase()
        : true;
      if (
        emailMatches &&
        u.resetPasswordCode === code &&
        u.resetPasswordExpires &&
        new Date(u.resetPasswordExpires) > new Date()
      ) {
        return { ...u };
      }
    }
    return null;
  }

  getUserById(id) {
    const u = this.users.get(id);
    return u ? { ...u } : null;
  }

  createUser(userData) {
    const id = uid("user");
    const user = {
      _id: id,
      username: userData.username,
      fullName: userData.fullName || userData.username,
      email: userData.email,
      password: userData.password,
      profileType: userData.profileType || "personal",
      profilePrivacy: userData.profilePrivacy || "public",
      accountStatus: userData.accountStatus || "unverified",
      profilePicture: userData.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      coverPicture: userData.coverPicture || "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=1200&auto=format&fit=crop&q=80",
      bio: userData.bio || "",
      gender: userData.gender || "male",
      dateOfBirth: userData.dateOfBirth || null,
      relationshipStatus: userData.relationshipStatus || "single",
      contactInfo: userData.contactInfo || { phone: "", email: userData.email, socialLinks: {}, websiteLink: "" },
      followers: [],
      following: [],
      posts: [],
      bookmarks: [],
      role: userData.role || "user",
      isBlueTag: Boolean(userData.isBlueTag),
      canManageBlueTag: Boolean(userData.canManageBlueTag),
      blueTagGivenBy: userData.blueTagGivenBy || null,
      blueTagGivenAt: userData.blueTagGivenAt || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return { ...user };
  }

  updateUser(id, updates) {
    const u = this.users.get(id);
    if (!u) return null;
    const updated = { ...u, ...updates };
    this.users.set(id, updated);
    return { ...updated };
  }

  getAllUsers() {
    return Array.from(this.users.values()).map(u => {
      const { password, ...safe } = u;
      return safe;
    });
  }

  getSuggestedUsers(currentUserId) {
    return Array.from(this.users.values())
      .filter(u => u._id !== currentUserId)
      .map(u => {
        const { password, ...safe } = u;
        return safe;
      });
  }

  followOrUnfollow(currentUserId, targetUserId) {
    const user = this.users.get(currentUserId);
    const target = this.users.get(targetUserId);
    if (!user || !target) return { success: false, message: "User not found" };

    if (!Array.isArray(user.following)) user.following = [];
    if (!Array.isArray(target.followers)) target.followers = [];

    const isFollowing = user.following.some(
      (id) => (id?._id || id).toString() === targetUserId.toString()
    );

    if (isFollowing) {
      user.following = user.following.filter(
        (id) => (id?._id || id).toString() !== targetUserId.toString()
      );
      target.followers = target.followers.filter(
        (id) => (id?._id || id).toString() !== currentUserId.toString()
      );
      return { success: true, message: "Unfollowed successfully", isFollowing: false };
    } else {
      user.following.push(targetUserId);
      target.followers.push(currentUserId);
      return { success: true, message: "Followed successfully", isFollowing: true };
    }
  }

  getChatContacts(userId) {
    const user = this.users.get(userId);
    if (!user) return [];

    const userFollowing = (user.following || []).map((id) => (id?._id || id).toString());
    const userFollowers = (user.followers || []).map((id) => (id?._id || id).toString());

    const contactsMap = new Map();

    // 1. All users that currentUser is following (first-class inbox contacts)
    for (const followedId of userFollowing) {
      const u = this.users.get(followedId);
      if (u) {
        contactsMap.set(followedId, {
          _id: u._id,
          username: u.username,
          fullName: u.fullName || u.username,
          profilePicture: u.profilePicture,
          bio: u.bio || "",
          isFollowing: true,
          isFollower: userFollowers.includes(followedId),
        });
      }
    }

    // 2. All users that follow currentUser
    for (const followerId of userFollowers) {
      if (!contactsMap.has(followerId)) {
        const u = this.users.get(followerId);
        if (u) {
          contactsMap.set(followerId, {
            _id: u._id,
            username: u.username,
            fullName: u.fullName || u.username,
            profilePicture: u.profilePicture,
            bio: u.bio || "",
            isFollowing: userFollowing.includes(followerId),
            isFollower: true,
          });
        }
      }
    }

    // 3. Any users with existing conversation
    for (const conv of this.conversations.values()) {
      if (conv.participants.includes(userId)) {
        const otherId = conv.participants.find((p) => p !== userId);
        if (otherId && !contactsMap.has(otherId)) {
          const u = this.users.get(otherId);
          if (u) {
            contactsMap.set(otherId, {
              _id: u._id,
              username: u.username,
              fullName: u.fullName || u.username,
              profilePicture: u.profilePicture,
              bio: u.bio || "",
              isFollowing: userFollowing.includes(otherId),
              isFollower: userFollowers.includes(otherId),
            });
          }
        }
      }
    }

    // Attach last message for each contact
    const contacts = Array.from(contactsMap.values()).map((contact) => {
      const conv = this.getConversation(userId, contact._id);
      let lastMessage = null;
      if (conv && conv.messages && conv.messages.length > 0) {
        const lastMsgId = conv.messages[conv.messages.length - 1];
        lastMessage = this.messages.get(lastMsgId) || null;
      }
      return {
        ...contact,
        lastMessage,
      };
    });

    // Sort: contacts with latest messages first, followed by alphabetical
    contacts.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
      if (timeA !== timeB) return timeB - timeA;
      return a.username.localeCompare(b.username);
    });

    return contacts;
  }

  getAllPosts() {
    const posts = Array.from(this.posts.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return posts.map(p => this.populatePost(p));
  }

  getReels() {
    const reels = Array.from(this.posts.values())
      .filter((p) => p.postType === "reel" || (p.video && p.video.trim()))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return reels.map((p) => this.populatePost(p));
  }

  getUserPosts(userId) {
    const posts = Array.from(this.posts.values())
      .filter(p => p.author === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return posts.map(p => this.populatePost(p));
  }

  getPostById(id) {
    const post = this.posts.get(id);
    return post ? this.populatePost(post) : null;
  }

  createPost({
    caption = "",
    image = "",
    video = "",
    authorId,
    tags = [],
    location = "",
    feeling = "",
    postType = "post",
  }) {
    const id = uid(postType === "reel" ? "reel" : "post");
    const post = {
      _id: id,
      caption,
      image,
      video,
      author: authorId,
      likes: [],
      comments: [],
      reposts: [],
      originalPost: null,
      postType: postType || (video ? "reel" : "post"),
      tags: Array.isArray(tags) ? tags : [],
      location: location || "",
      feeling: feeling || "",
      sharesCount: 0,
      isEdited: false,
      editedAt: null,
      createdAt: new Date(),
    };
    this.posts.set(id, post);

    const user = this.users.get(authorId);
    if (user) {
      if (!Array.isArray(user.posts)) user.posts = [];
      user.posts.push(id);
    }
    return this.populatePost(post);
  }

  repostPost(postId, userId) {
    const original = this.posts.get(postId);
    if (!original) return null;

    if (!Array.isArray(original.reposts)) {
      original.reposts = [];
    }

    const alreadyReposted = original.reposts.includes(userId);
    if (alreadyReposted) {
      original.reposts = original.reposts.filter((id) => id !== userId);
    } else {
      original.reposts.push(userId);
    }

    return {
      post: this.populatePost(original),
      isReposted: !alreadyReposted,
      repostsCount: original.reposts.length,
    };
  }

  updatePost(postId, userId, updates = {}) {
    const post = this.posts.get(postId);
    if (!post) return { success: false, status: 404, message: "Post not found" };
    if (post.author !== userId) return { success: false, status: 403, message: "Unauthorized" };

    if (updates.caption !== undefined) post.caption = updates.caption;
    if (updates.location !== undefined) post.location = updates.location;
    if (updates.feeling !== undefined) post.feeling = updates.feeling;
    if (updates.tags !== undefined) post.tags = Array.isArray(updates.tags) ? updates.tags : [];
    post.isEdited = true;
    post.editedAt = new Date();

    return { success: true, message: "Post updated successfully", post: this.populatePost(post) };
  }

  sharePost(postId) {
    const post = this.posts.get(postId);
    if (!post) return null;
    post.sharesCount = (post.sharesCount || 0) + 1;
    return post;
  }

  deletePost(postId, userId) {
    const post = this.posts.get(postId);
    if (!post) return { success: false, status: 404, message: "Post not found" };
    if (post.author !== userId) return { success: false, status: 403, message: "Unauthorized" };

    this.posts.delete(postId);
    const user = this.users.get(userId);
    if (user) {
      user.posts = user.posts.filter(id => id !== postId);
    }
    for (const [cId, comment] of this.comments.entries()) {
      if (comment.post === postId) {
        this.comments.delete(cId);
      }
    }
    return { success: true, message: "Post deleted successfully" };
  }

  likePost(postId, userId) {
    const post = this.posts.get(postId);
    if (!post) return null;
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
    }
    return post;
  }

  dislikePost(postId, userId) {
    const post = this.posts.get(postId);
    if (!post) return null;
    post.likes = post.likes.filter(id => id !== userId);
    return post;
  }

  bookmarkPost(postId, userId) {
    const user = this.users.get(userId);
    if (!user) return null;
    const isBookmarked = user.bookmarks.includes(postId);
    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(id => id !== postId);
      return { type: "unsaved", message: "Post removed from bookmarks" };
    } else {
      user.bookmarks.push(postId);
      return { type: "saved", message: "Post bookmarked successfully" };
    }
  }

  addComment(postId, userId, text) {
    const post = this.posts.get(postId);
    if (!post) return null;

    const cId = uid("comment");
    const comment = {
      _id: cId,
      text,
      author: userId,
      post: postId,
      createdAt: new Date(),
    };
    this.comments.set(cId, comment);
    post.comments.push(cId);

    const author = this.users.get(userId);
    return {
      ...comment,
      author: author ? { _id: author._id, username: author.username, profilePicture: author.profilePicture } : { _id: userId, username: "User" },
    };
  }

  getCommentsOfPost(postId) {
    const comments = [];
    for (const c of this.comments.values()) {
      if (c.post === postId) {
        const author = this.users.get(c.author);
        comments.push({
          ...c,
          author: author ? { _id: author._id, username: author.username, profilePicture: author.profilePicture } : { _id: c.author, username: "User" },
        });
      }
    }
    return comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getConversation(user1, user2) {
    for (const conv of this.conversations.values()) {
      if (conv.participants.includes(user1) && conv.participants.includes(user2)) {
        return conv;
      }
    }
    return null;
  }

  addMessage(senderId, receiverId, content, replyTo = null) {
    let conv = this.getConversation(senderId, receiverId);
    if (!conv) {
      const convId = uid("conv");
      conv = { _id: convId, participants: [senderId, receiverId], messages: [] };
      this.conversations.set(convId, conv);
    }

    const msgId = uid("msg");
    const msg = {
      _id: msgId,
      senderId,
      receiverId,
      content,
      reactions: [],
      replyTo: replyTo || null,
      createdAt: new Date(),
    };
    this.messages.set(msgId, msg);
    conv.messages.push(msgId);
    return msg;
  }

  deleteMessage(msgId, userId) {
    const msg = this.messages.get(msgId);
    if (!msg) return { success: false, message: "Message not found" };
    if (msg.senderId !== userId) return { success: false, message: "Unauthorized to delete this message" };
    this.messages.delete(msgId);
    for (const conv of this.conversations.values()) {
      conv.messages = conv.messages.filter((id) => id !== msgId);
    }
    return { success: true, message: "Message deleted" };
  }

  reactMessage(msgId, userId, emoji) {
    const msg = this.messages.get(msgId);
    if (!msg) return { success: false, message: "Message not found" };
    if (!Array.isArray(msg.reactions)) {
      msg.reactions = [];
    }
    const existingIndex = msg.reactions.findIndex(
      (r) => r.userId === userId && r.emoji === emoji
    );
    if (existingIndex > -1) {
      // Toggle off
      msg.reactions.splice(existingIndex, 1);
    } else {
      // Replace existing reaction from this user or add new
      msg.reactions = msg.reactions.filter((r) => r.userId !== userId);
      msg.reactions.push({ userId, emoji });
    }
    return { success: true, reactions: msg.reactions, message: msg };
  }

  getMessages(user1, user2) {
    const conv = this.getConversation(user1, user2);
    if (!conv) return [];
    return conv.messages.map(mId => this.messages.get(mId)).filter(Boolean);
  }

  populatePost(post) {
    const author = this.users.get(typeof post.author === "string" ? post.author : post.author?._id);
    const authorData = author
      ? {
          _id: author._id,
          username: author.username,
          fullName: author.fullName,
          profilePicture: author.profilePicture,
          isBlueTag: Boolean(author.isBlueTag),
          role: author.role || "user",
          accountStatus: author.accountStatus || "unverified",
        }
      : { _id: post.author, username: "Unknown", profilePicture: "", isBlueTag: false };

    const commentsData = (post.comments || []).map(cId => {
      const c = typeof cId === "string" ? this.comments.get(cId) : cId;
      if (!c) return null;
      const cAuthor = this.users.get(typeof c.author === "string" ? c.author : c.author?._id);
      return {
        ...c,
        author: cAuthor
          ? {
              _id: cAuthor._id,
              username: cAuthor.username,
              fullName: cAuthor.fullName,
              profilePicture: cAuthor.profilePicture,
              isBlueTag: Boolean(cAuthor.isBlueTag),
              role: cAuthor.role || "user",
            }
          : { _id: c.author, username: "User", isBlueTag: false },
      };
    }).filter(Boolean);

    return {
      ...post,
      author: authorData,
      comments: commentsData,
    };
  }

  // --- Story methods ---
  getActiveStories() {
    const now = new Date();
    const active = Array.from(this.stories.values())
      .filter((s) => new Date(s.expiresAt) > now)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Group stories by author
    const groups = new Map();
    for (const story of active) {
      const authorId = typeof story.author === "string" ? story.author : story.author?._id;
      if (!groups.has(authorId)) {
        const author = this.users.get(authorId);
        groups.set(authorId, {
          author: author
            ? { _id: author._id, username: author.username, profilePicture: author.profilePicture }
            : { _id: authorId, username: "Creator", profilePicture: "" },
          stories: [],
        });
      }
      groups.get(authorId).stories.push(story);
    }
    return Array.from(groups.values());
  }

  createStory({ authorId, media, mediaType = "image", caption = "" }) {
    const id = uid("story");
    const story = {
      _id: id,
      author: authorId,
      media,
      mediaType,
      caption: caption || "",
      views: [],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
    this.stories.set(id, story);
    const author = this.users.get(authorId);
    return {
      ...story,
      author: author
        ? { _id: author._id, username: author.username, profilePicture: author.profilePicture }
        : { _id: authorId, username: "User" },
    };
  }

  deleteStory(storyId, userId) {
    const story = this.stories.get(storyId);
    if (!story) return { success: false, status: 404, message: "Story not found" };
    if (story.author !== userId) return { success: false, status: 403, message: "Unauthorized" };
    this.stories.delete(storyId);
    return { success: true, message: "Story deleted successfully" };
  }

  viewStory(storyId, userId) {
    const story = this.stories.get(storyId);
    if (!story) return null;
    if (!Array.isArray(story.views)) story.views = [];
    if (!story.views.includes(userId)) {
      story.views.push(userId);
    }
    return story;
  }
}

export const memoryStore = new MemoryStore();
