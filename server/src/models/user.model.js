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
      enum: ["male", "female"],
    },
    dateOfBirth: {
      type: Date, // Store date of birth as a Date object
      default: null, // Allow null if not provided
    },
    relationshipStatus: {
      type: String,
      enum: ["single", "in a relationship", "married", "divorced", "widowed"],
      default: "single", // Default relationship status
    },
    contactInfo: {
      phone: {
        type: String,
        default: "",
        trim: true, // Removes leading and trailing whitespace
      },
      email: {
        type: String,
        default: "",
        trim: true, // Removes leading and trailing whitespace
      },
      socialLinks: {
        facebook: {
          type: String,
          default: "",
          trim: true, // Removes leading and trailing whitespace
        },
        twitter: {
          type: String,
          default: "",
          trim: true, // Removes leading and trailing whitespace
        },
        instagram: {
          type: String,
          default: "",
          trim: true, // Removes leading and trailing whitespace
        },
        linkedin: {
          type: String,
          default: "",
          trim: true, // Removes leading and trailing whitespace
        },
      },
      websiteLink: {
        type: String,
        default: "",
        trim: true, // Removes leading and trailing whitespace
      },
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],

    role: {
      type: String,
      enum: ["user", "professional"],
      default: "user",
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
