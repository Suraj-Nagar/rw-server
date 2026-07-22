import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";

// Fetch chat history between two users
export const getChatHistory = async (req, res, next) => {
  try {
    const { otherUserId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    }).sort({ createdAt: 1 }); // Oldest first for chat history

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

// Get list of users the current user has chatted with
export const getChatContacts = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;

    // Find all distinct users we sent messages to or received messages from
    const messages = await Message.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }],
    });

    const contactIds = new Set();
    messages.forEach((msg) => {
      if (msg.senderId.toString() !== currentUserId) {
        contactIds.add(msg.senderId.toString());
      }
      if (msg.receiverId.toString() !== currentUserId) {
        contactIds.add(msg.receiverId.toString());
      }
    });

    const contacts = await User.find({
      _id: { $in: Array.from(contactIds) },
    }).select("fullName avatar email role");

    res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
