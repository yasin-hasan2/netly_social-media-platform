import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true, // Removes leading and trailing whitespace
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensure that every comment has an author
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true, // Ensure that every comment is associated with a post
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

export const Comment = mongoose.model("Comment", commentSchema);
// This schema defines a comment model with fields for text, author, post, likes, and replies.
