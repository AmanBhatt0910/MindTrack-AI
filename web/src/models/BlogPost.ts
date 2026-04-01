import mongoose, { Schema, models } from "mongoose";

const CommentSchema = new Schema(
  {
    userId: { type: String, required: true },
    authorName: { type: String, required: true },
    content: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const BlogPostSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    authorName: { type: String, required: true },
    title: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 5000 },
    emotionTags: { type: [String], default: [] },
    isAnonymous: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] },
    comments: { type: [CommentSchema], default: [] },
    status: {
      type: String,
      enum: ["published", "draft", "flagged"],
      default: "published",
    },
  },
  { timestamps: true }
);

// Index for listing posts sorted by date
BlogPostSchema.index({ status: 1, createdAt: -1 });

export const BlogPost =
  models.BlogPost || mongoose.model("BlogPost", BlogPostSchema);
