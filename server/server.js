import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import http from 'http';
import User from './models/user.js';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server with dynamic CORS
export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://real-time-chat-app-omega-blond.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Store online users
export const userSocketMap = {}; // userId → socketId

// Socket.IO connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected:", userId);

  if (userId) userSocketMap[userId] = socket.id;

  // Send online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://real-time-chat-app-omega-blond.vercel.app",
  credentials: true,
}));

// Route setup
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to MongoDB
await connectDB();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));
