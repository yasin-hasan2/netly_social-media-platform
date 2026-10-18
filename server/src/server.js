import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

// Routes
import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";
import storyRoute from "./routes/story.route.js";
import adminRoute from "./routes/admin.route.js";
import searchRoute from "./routes/search.route.js";
import notificationRoute from "./routes/notification.route.js";

// DB connection
import { connectDB } from "./lib/db.js";

// Using app & server from socket (for real-time features)
import { app, server } from "./socket/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");
const clientDistDir = path.resolve(rootDir, "client/dist");

// AI Studio dev server must run on port 3000
const PORT = 3000;

// CORS setup
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());

// API Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/story", storyRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/search", searchRoute);
app.use("/api/v1/notification", notificationRoute);

// Test API status route
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    message: "Net-ly API is operational",
    status: "success",
  });
});

// Mongoose / Database error fallback middleware (per migration skill guidance)
app.use((err, req, res, next) => {
  if (
    err.name === "MongooseError" ||
    err.name === "MongoNetworkError" ||
    (err.message && err.message.includes("buffering timed out"))
  ) {
    console.warn("[Net-ly] Database offline — returning mock empty response");
    if (req.method === "GET") {
      return res.json(req.path.endsWith("s") || req.path.endsWith("s/") ? [] : {});
    }
    return res
      .status(503)
      .json({ error: "Service temporarily unavailable (database offline)" });
  }
  next(err);
});

// Build client automatically if client/dist is not found
const clientIndex = path.join(clientDistDir, "index.html");
if (!fs.existsSync(clientIndex)) {
  console.log("Client build not found. Running npm run build in client...");
  try {
    execSync("npm --prefix client run build", { cwd: rootDir, stdio: "inherit" });
  } catch (err) {
    console.error("Auto client build failed:", err.message);
  }
}

// Serve static frontend assets
app.use(express.static(clientDistDir));

// SPA fallback for all client routes
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "API endpoint not found" });
  }
  if (fs.existsSync(clientIndex)) {
    return res.sendFile(clientIndex);
  }
  return res.status(200).send("Net-ly is starting up... Please reload in a moment.");
});

// Start server on 0.0.0.0
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  connectDB();
});
