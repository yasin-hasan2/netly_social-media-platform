import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      default: "",
      required: true,
      trim: true, // Removes leading and trailing whitespace
    },
    image: {
      type: String,
      required: true,
      trim: true, // Removes leading and trailing whitespace
    },
    video: {
      type: String,
      default: "",
      trim: true, // Removes leading and trailing whitespace
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensure that every post has an author
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    tags: [
      {
        type: String,
        trim: true, // Removes leading and trailing whitespace
      },
    ],
    location: {
      type: String,
      trim: true, // Removes leading and trailing whitespace
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    toJSON: { virtuals: true }, // Include virtuals in JSON output
    toObject: { virtuals: true }, // Include virtuals in object output
  }
);

export const Post = mongoose.model("Post", postSchema);
