import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getChatUsers,
  getMessages,
  sendMessage,
  deleteMessage,
  reactMessage,
  clearConversation,
} from "../controllers/message.controller.js";

const router = express.Router();

router.route("/chat-users").get(isAuthenticated, getChatUsers);
router.route("/send/:id").post(isAuthenticated, sendMessage);
router.route("/all/:id").get(isAuthenticated, getMessages);
router.route("/delete/:id").delete(isAuthenticated, deleteMessage);
router.route("/react/:id").post(isAuthenticated, reactMessage);
router.route("/clear/:id").delete(isAuthenticated, clearConversation);

export default router;
