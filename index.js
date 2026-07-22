import Razorpay from 'razorpay';
import app from '../server/app.js';
import connectionTodb from "./config/db.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initChatSocket } from "./socket/chat.js";

export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});

const PORT = process.env.PORT || 5001;

// Setup HTTP server for Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173','http://192.168.0.116:5173'],
    credentials: true
  }
});

// Initialize Chat Socket
initChatSocket(io);

connectionTodb().then(() => {
    httpServer.listen(PORT, () => {    
        console.log(`server and socket.io are running on http://localhost:${PORT}`);
    })
});

