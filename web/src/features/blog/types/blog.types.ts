export interface BlogComment {
  _id?: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface BlogPostData {
  _id: string;
  userId: string;
  authorName: string;
  title: string;
  content: string;
  emotionTags: string[];
  isAnonymous: boolean;
  likes: number;
  likedBy: string[];
  comments: BlogComment[];
  status: "published" | "draft" | "flagged";
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogRequest {
  title: string;
  content: string;
  emotionTags: string[];
  isAnonymous: boolean;
}

export interface BlogListResponse {
  posts: BlogPostData[];
  total: number;
  page: number;
  totalPages: number;
}

export const EMOTION_TAGS = [
  "Anxiety",
  "Stress",
  "Depression",
  "Hopeful",
  "Grateful",
  "Recovery",
  "Self-care",
  "Mindfulness",
  "Support",
] as const;

export const EMOTION_TAG_COLORS: Record<string, string> = {
  Anxiety: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  Stress: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  Depression: "bg-blue-700/15 text-blue-400 border-blue-700/30",
  Hopeful: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  Grateful: "bg-green-500/15 text-green-300 border-green-500/30",
  Recovery: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "Self-care": "bg-pink-500/15 text-pink-300 border-pink-500/30",
  Mindfulness: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  Support: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
};
