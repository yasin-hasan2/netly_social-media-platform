import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("🟢 Token from cookies:", token);

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decode.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - user not found" });
    }

    req.user = user;
    req.id = decode.userId; // Attach user ID to request object
    console.log("🟢 Authenticated user:", user);
    next();
  } catch (error) {
    console.log("❌ Error in isAuthenticated middleware:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default isAuthenticated;
//     expiresIn: "1d",
