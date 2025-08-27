import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import userRoute from "./routes/user.route.js";
import postRoute from "./routes/post.route.js";
import messageRoute from "./routes/message.route.js";

import { connectDB } from "./lib/db.js";

// const app = express();  // moved to socket.js
import { app, server } from "./socket/socket.js"; // now we use the app from socket.js

const PORT = process.env.PORT;

// app.get("/", (req, res) => {
//   return res.status(200).json({
//     message: "Welcome to LinkLy API",
//     status: "success",
//   });
// });

const __dirname = path.resolve();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Import all routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log(`server is running on post ${PORT}`);
  connectDB();
});
