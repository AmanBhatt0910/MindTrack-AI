import mongoose, { Schema, models } from "mongoose";

const AuditLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "view_patient",
        "view_analysis",
        "create_session_note",
        "send_message",
        "acknowledge_alert",
        "assign_patient",
        "generate_summary",
        "export_data",
      ],
    },
    resource: { type: String, required: true }, // e.g. "Patient", "Analysis"
    resourceId: { type: String, default: "" },
    details: { type: String, default: "" },
  },
  { timestamps: true }
);

AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });

export const AuditLog =
  models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
