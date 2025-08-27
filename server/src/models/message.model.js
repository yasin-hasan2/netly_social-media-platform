import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensure that every message has a sender
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Ensure that every message has a receiver
    },
    content: {
      type: String,
      required: true, // Ensure that every message has content
      trim: true, // Removes leading and trailing whitespace
    },
    timestamp: {
      type: Date,
      default: Date.now, // Automatically set the timestamp to the current date and time
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    toJSON: { virtuals: true }, // Include virtuals in JSON output
    toObject: { virtuals: true }, // Include virtuals in object output
  }
);

export const Message = mongoose.model("Message", messageSchema);
