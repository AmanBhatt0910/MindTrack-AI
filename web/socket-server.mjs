import { Server } from "socket.io";
import { createServer } from "http";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// Load env variables
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGODB_URI || !JWT_SECRET) {
  console.error("Missing MONGODB_URI or JWT_SECRET");
  process.exit(1);
}

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // allow NextJS frontend
    methods: ["GET", "POST"]
  }
});

// We connect directly to MongoDB here using mongoose to avoid redefining models
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Socket server connected to DB"))
  .catch(err => console.error(err));

// Note: In a real production setup, we would share the exact mongoose models.
// Here we use db.collection directly to avoid TS compiler issues with model imports.
const db = mongoose.connection;

// Middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
  if (!token) return next(new Error("Authentication error"));

  jwt.verify(token.replace("Bearer ", ""), JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.data.user = decoded;
    next();
  });
});

const connectedUsers = new Map();

io.on("connection", (socket) => {
  const user = socket.data.user;
  const userId = user.id;
  
  // Track online status
  connectedUsers.set(userId, socket.id);
  
  console.log(`User connected: ${userId} (${user.role})`);

  socket.on("join_conversation", async (conversationId) => {
    // Validate that user is part of conversation
    const conversation = await db.collection("conversations").findOne({
      _id: new mongoose.Types.ObjectId(conversationId)
    });

    if (!conversation) {
      return socket.emit("error", { message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(p => p.toString() === userId);
    if (!isParticipant) {
      return socket.emit("error", { message: "Unauthorized access" });
    }

    socket.join(conversationId);
    console.log(`User ${userId} joined room ${conversationId}`);
  });

  socket.on("leave_conversation", (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on("typing", (data) => {
    socket.to(data.conversationId).emit("typing", {
      conversationId: data.conversationId,
      userId: userId
    });
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.conversationId).emit("stop_typing", {
      conversationId: data.conversationId,
      userId: userId
    });
  });

  socket.on("send_message", async (data) => {
    const { conversationId, receiverId, content } = data;
    
    // Save message to DB
    const message = {
      conversationId: new mongoose.Types.ObjectId(conversationId),
      senderId: new mongoose.Types.ObjectId(userId),
      receiverId: new mongoose.Types.ObjectId(receiverId),
      senderRole: user.role,
      content,
      read: false,
      readAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const res = await db.collection("messages").insertOne(message);
    const savedMessage = { ...message, _id: res.insertedId };

    // Update conversation last message
    await db.collection("conversations").updateOne(
      { _id: new mongoose.Types.ObjectId(conversationId) },
      { 
        $set: { 
          lastMessage: {
            content,
            senderId: new mongoose.Types.ObjectId(userId),
            createdAt: new Date()
          }
        },
        $inc: { [`unreadCounts.${receiverId}`]: 1 }
      }
    );

    // Emit to conversation room
    io.to(conversationId).emit("new_message", savedMessage);
    
    // Also emit to receiver if they are online but not in the room
    const receiverSocketId = connectedUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message_notification", savedMessage);
    }
  });

  socket.on("mark_read", async (data) => {
    const { conversationId } = data;
    
    await db.collection("messages").updateMany(
      { 
        conversationId: new mongoose.Types.ObjectId(conversationId),
        receiverId: new mongoose.Types.ObjectId(userId),
        read: false 
      },
      { $set: { read: true, readAt: new Date() } }
    );

    await db.collection("conversations").updateOne(
      { _id: new mongoose.Types.ObjectId(conversationId) },
      { $set: { [`unreadCounts.${userId}`]: 0 } }
    );

    // Notify other party
    socket.to(conversationId).emit("messages_read", { conversationId, userId });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId}`);
    connectedUsers.delete(userId);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
