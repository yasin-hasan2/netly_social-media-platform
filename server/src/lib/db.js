import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn("⚠️ No MONGO_URI configured — using in-memory store for Net-ly.");
    return;
  }
  try {
    mongoose.set("bufferCommands", false);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    try {
      const { User } = await import("../models/user.model.js");
      await User.updateMany(
        { email: { $in: ["yasinalhasan@gmail.com", "yaseenalhassan2@gmail.com"] } },
        { $set: { role: "super_admin" } }
      );
      console.log("👑 Synchronized Super Admin accounts in database.");
    } catch (e) {
      console.warn("Could not sync super admin in DB:", e.message);
    }
  } catch (error) {
    console.warn("⚠️ Error connecting to MongoDB (using in-memory fallback):", error.message);
  }
};
