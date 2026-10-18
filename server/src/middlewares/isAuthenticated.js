import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { memoryStore } from "../lib/memoryStore.js";

export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers?.authorization) {
      if (req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      } else {
        token = req.headers.authorization;
      }
    }

    if (token) {
      const decode = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY || "netly_jwt_secret_dev_key"
      );

      let user;
      if (mongoose.connection.readyState === 1) {
        user = await User.findById(decode.userId).select("-password");
      } else {
        user = memoryStore.getUserById(decode.userId);
      }

      if (user) {
        const SUPER_ADMIN_EMAILS = ["yasinalhasan@gmail.com", "yaseenalhassan2@gmail.com"];
        if (SUPER_ADMIN_EMAILS.includes((user.email || "").toLowerCase())) {
          user.role = "super_admin";
        }
        req.user = user;
        req.id = decode.userId;
      }
    }
  } catch (error) {
    // Optional auth - ignore invalid token and proceed as guest
  }
  next();
};

const isAuthenticated = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers?.authorization) {
      if (req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      } else {
        token = req.headers.authorization;
      }
    }

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const decode = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY || "netly_jwt_secret_dev_key"
    );

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decode.userId).select("-password");
    } else {
      user = memoryStore.getUserById(decode.userId);
    }

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - user not found" });
    }

    const SUPER_ADMIN_EMAILS = ["yasinalhasan@gmail.com", "yaseenalhassan2@gmail.com"];
    if (SUPER_ADMIN_EMAILS.includes((user.email || "").toLowerCase())) {
      user.role = "super_admin";
    }

    req.user = user;
    req.id = decode.userId;
    next();
  } catch (error) {
    console.log("❌ Error in isAuthenticated middleware:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default isAuthenticated;
