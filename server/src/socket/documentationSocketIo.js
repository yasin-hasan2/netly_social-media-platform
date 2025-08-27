// Let’s go step by step — I’ll explain how to build a Socket.IO server with:

// Basic single connection (1-to-1 chat)

// Group connections (chat rooms / groups)

// Best practices (scalability, JWT auth, online users tracking)

// 🔹 1. Basic Socket Server Setup
// // socketServer.js
// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import jwt from "jsonwebtoken";

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173", // frontend URL
//     methods: ["GET", "POST"],
//   },
// });

// // Map of userId -> socketIds
// const userSocketMap = {};

// // ✅ Middleware: authenticate socket connections using JWT
// io.use((socket, next) => {
//   try {
//     const token = socket.handshake.auth.token; // frontend will send token here
//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//     socket.userId = decoded.userId;
//     next();
//   } catch (err) {
//     console.error("❌ Socket Auth Error:", err.message);
//     next(new Error("Authentication error"));
//   }
// });

// io.on("connection", (socket) => {
//   const userId = socket.userId;

//   // Save socket id for the user
//   if (!userSocketMap[userId]) {
//     userSocketMap[userId] = [];
//   }
//   userSocketMap[userId].push(socket.id);

//   console.log(`🟢 User ${userId} connected with socket ${socket.id}`);

//   // Broadcast online users
//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   // Handle private message
//   socket.on("private_message", ({ receiverId, message }) => {
//     const receiverSockets = userSocketMap[receiverId] || [];
//     receiverSockets.forEach((sockId) => {
//       io.to(sockId).emit("private_message", {
//         senderId: userId,
//         message,
//       });
//     });
//   });

//   // Handle disconnect
//   socket.on("disconnect", () => {
//     console.log(`🔴 User ${userId} disconnected`);

//     // Remove this socket from user’s array
//     userSocketMap[userId] = userSocketMap[userId].filter(
//       (id) => id !== socket.id
//     );

//     if (userSocketMap[userId].length === 0) {
//       delete userSocketMap[userId]; // fully remove user if no connections
//     }

//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });
// });

// export { app, server, io };

// ✅ With this, you have a secure 1-to-1 messaging system.

// 🔹 2. Single Connection (1-to-1 Chat)

// Flow:

// User A sends message to User B → backend gets B’s socketId from userSocketMap.

// Server delivers the message only to that socket.

// Client example (React):

// import { io } from "socket.io-client";

// const socket = io("http://localhost:5000", {
//   auth: { token: localStorage.getItem("token") }, // JWT auth
// });

// // Send message
// socket.emit("private_message", {
//   receiverId: "68aab1ca4b3a006abb87e21c",
//   message: "Hello Lion 🦁",
// });

// // Receive
// socket.on("private_message", (data) => {
//   console.log("📩 Message received:", data);
// });

// 🔹 3. Group Chat (Rooms / Groups)

// Socket.IO has rooms, perfect for group chats.

// Server side:

// // Join a room (group)
// socket.on("join_room", (roomId) => {
//   socket.join(roomId);
//   console.log(`🟢 User ${userId} joined room: ${roomId}`);
// });

// // Leave a room
// socket.on("leave_room", (roomId) => {
//   socket.leave(roomId);
//   console.log(`🔴 User ${userId} left room: ${roomId}`);
// });

// // Send message to all in a room
// socket.on("group_message", ({ roomId, message }) => {
//   io.to(roomId).emit("group_message", {
//     senderId: userId,
//     message,
//   });
// });

// Client side:

// // Join room
// socket.emit("join_room", "group123");

// // Send group message
// socket.emit("group_message", {
//   roomId: "group123",
//   message: "Hello everyone 👋",
// });

// // Listen for group messages
// socket.on("group_message", (data) => {
//   console.log("📢 Group message:", data);
// });

// 🔹 4. Best Practices

// ✅ Use JWT auth → safer than passing userId directly.

// ✅ Support multiple devices → store multiple socketIds per userId.

// ✅ Use rooms for groups → efficient & scalable.

// ✅ Emit online users only when needed → prevents spam.

// ✅ Persist chat messages in MongoDB (not just in socket) → so users don’t lose chats.

// ⚡ Summary

// 1-to-1 chat → store userId -> socketIds and send directly.

// Group chat → use socket.join(roomId) and broadcast with io.to(roomId).

// Security → always verify JWT during socket.handshake.

// Scalability → allow multiple socket connections per user.
