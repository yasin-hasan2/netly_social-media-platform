import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {}; // this map stores socket id corresponding the user id; userId -> socketId

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(
      `User connected: user Id = ${userId}, socket Id = ${socket.id}`
    );
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Real-time typing indicators
  socket.on("typing", (data) => {
    const receiverId = data?.receiverId;
    if (!receiverId) return;
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", {
        senderId: userId || data?.senderId,
        username: data?.username,
      });
    }
  });

  socket.on("stopTyping", (data) => {
    const receiverId = data?.receiverId;
    if (!receiverId) return;
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userStoppedTyping", {
        senderId: userId || data?.senderId,
      });
    }
  });

  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      console.log(
        `User disconnected: user Id = ${userId}, socket Id = ${socket.id}`
      );
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io };
