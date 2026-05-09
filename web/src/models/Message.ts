import mongoose, { Schema, models } from "mongoose";

const MessageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: false, // Make it optional for backward compatibility
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["patient", "doctor"],
      required: true,
    },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Thread lookup: messages between two users sorted by time
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
// Unread messages for a user
MessageSchema.index({ receiverId: 1, read: 1 });

if (models.Message) {
  delete models.Message;
}

export const Message = mongoose.model("Message", MessageSchema);
