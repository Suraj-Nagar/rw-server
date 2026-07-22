import Message from "../models/message.model.js";

// Keep track of connected users: { userId: socketId }
const connectedUsers = new Map();

export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected to chat:", socket.id);

    // When a user connects and identifies themselves
    socket.on("register", (userId) => {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ${socket.id}`);
      
      // Optionally emit online status to others
      io.emit("user_online", userId);
    });

    // Handle sending messages
    socket.on("send_message", async (data) => {
      try {
        const { senderId, receiverId, text } = data;

        // Save to database
        const message = await Message.create({ senderId, receiverId, text });

        // Check if receiver is online
        const receiverSocketId = connectedUsers.get(receiverId);

        // Emit to receiver if online
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);
        }

        // Emit back to sender to confirm (or they can just use optimistic UI)
        socket.emit("message_sent", message);

      } catch (error) {
        console.error("Error sending message via socket:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      for (const [userId, sockId] of connectedUsers.entries()) {
        if (sockId === socket.id) {
          connectedUsers.delete(userId);
          io.emit("user_offline", userId);
          break;
        }
      }
    });
  });
};
