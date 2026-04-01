import dotenv from "dotenv";
dotenv.config(); // Loads environment variables from .env file

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path"; // ❗ You were using path but didn’t import it

// Routes
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";

// DB connection
import { connectDB } from "./lib/db.js";

// Using app & server from socket (for real-time features)
import { app, server } from "./socket/socket.js";

// Port from environment
const PORT = process.env.PORT || 8001;

// 👉 Test route (good for checking API is alive)
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Welcome to LinkLy API",
    status: "success",
  });
});

// ❗ __dirname fix for ES modules
const __dirname = path.resolve();

// 👉 CORS setup (VERY IMPORTANT for frontend connection)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // allow frontend
    credentials: true, // allow cookies
  }),
);

// 👉 Middleware
app.use(express.json()); // parse JSON request body
app.use(cookieParser()); // read cookies from browser

// 👉 API Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

/*
❌ REMOVE THIS (you already did correctly)

This was used when frontend + backend were together.
Now frontend is on Vercel, so this will cause error:

Error: client/dist/index.html not found

app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
});
*/

// 👉 Start server
server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  connectDB(); // connect to MongoDB
});
