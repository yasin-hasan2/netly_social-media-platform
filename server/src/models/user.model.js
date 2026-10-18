import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true, // Removes leading and trailing whitespace

      // match: [
      //   /^[a-zA-Z0-9_]+$/,
      //   "Username can only contain letters, numbers, and underscores",
      // ],
      // // Validate username format using a regular expression
      // validate: {
      //   validator: function (v) {
      //     return /^[a-zA-Z0-9_]+$/.test(v);
      //   },
      //   message: "Username can only contain letters, numbers, and underscores",
      // },
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email is unique
      // Validate email format using a regular expression
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Exclude password from queries by default
      // This means that when you query for users, the password field will not be returned unless explicitly requested
    },
    profileType: {
      type: String,
      enum: ["personal", "creator", "business"],
      default: "personal",
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    websiteLink: {
      type: String,
      default: "",
      trim: true,
    },
    profilePrivacy: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    accountStatus: {
      type: String,
      enum: ["verified", "unverified", "suspended"],
      default: "unverified",
    },
    isBlueTag: {
      type: Boolean,
      default: false,
    },
    blueTagGivenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    blueTagGivenAt: {
      type: Date,
      default: null,
    },
    canManageBlueTag: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default: "https://example.com/default-profile-picture.png", // Default profile picture URL
    },
    coverPicture: {
      type: String,
      default: "https://example.com/default-cover-picture.png", // Default cover picture URL
    },
    bio: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    dateOfBirth: {
      type: Date, // Store date of birth as a Date object
      default: null, // Allow null if not provided
    },
    relationshipStatus: {
      type: String,
      default: "single", // Default relationship status
    },
    contactInfo: {
      phone: {
        type: String,
        default: "",
        trim: true,
      },
      email: {
        type: String,
        default: "",
        trim: true,
      },
      socialLinks: {
        facebook: {
          type: String,
          default: "",
          trim: true,
        },
        twitter: {
          type: String,
          default: "",
          trim: true,
        },
        instagram: {
          type: String,
          default: "",
          trim: true,
        },
        linkedin: {
          type: String,
          default: "",
          trim: true,
        },
        github: {
          type: String,
          default: "",
          trim: true,
        },
        youtube: {
          type: String,
          default: "",
          trim: true,
        },
      },
      websiteLink: {
        type: String,
        default: "",
        trim: true,
      },
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],

    role: {
      type: String,
      enum: ["user", "admin", "super_admin", "professional"],
      default: "user",
    },

    messagingOptions: {
      canSendMessages: {
        type: Boolean,
        default: true,
      },
      messagingStatus: {
        type: String,
        enum: ["active", "restricted", "disabled"],
        default: "active",
      },
      messagePermission: {
        type: String,
        enum: ["everyone", "followers_only", "no_one"],
        default: "everyone",
      },
      restrictionReason: {
        type: String,
        default: "",
      },
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordCode: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
