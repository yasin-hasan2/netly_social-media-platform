import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { textMessage: message } = req.body;

    console.log("✅ Message:", message);

    // ✅ Fix variable name conflict
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      content: message,
    });

    if (newMessage) conversation.messages.push(newMessage._id);

    await Promise.all([conversation.save(), newMessage.save()]);

    // Emit the message to the receiver if they are online
    // using the receiver's socket ID from userSocketMap

    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log("Receiver Socket ID:", receiverSocketId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      console.log(
        "Message emitted to receiver via socket.io" + receiverSocketId + " : ",
        newMessage
      );
    }

    return res.status(200).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json({
        success: true,
        messages: [],
      });
    }

    return res.status(200).json({
      success: true,
      messages: conversation?.messages || [],
    });
  } catch (error) {
    console.error("Error in getMessages:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
