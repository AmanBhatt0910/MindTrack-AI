import mongoose, { Schema, models } from "mongoose";

const ConversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastMessage: {
      content: { type: String },
      senderId: { type: Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date }
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {}
    },
    metadata: {
      crisisFlags: { type: Number, default: 0 },
      emotionTrend: { type: String, default: "stable" },
      aiSummary: { type: String, default: "" },
      lastAnalysisDate: { type: Date }
    }
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ patientId: 1, doctorId: 1 }, { unique: true });

if (models.Conversation) {
  delete models.Conversation;
}

export const Conversation = models.Conversation || mongoose.model("Conversation", ConversationSchema);
