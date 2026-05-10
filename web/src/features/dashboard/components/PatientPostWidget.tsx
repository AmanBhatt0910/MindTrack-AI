"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

export default function PatientPostWidget() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await api.post("/patient-posts", {
        content,
        allowDoctorAnalysis: true, // Always true since this widget's purpose is to save for the doctor
      });
      toast.success("Social media post saved for your doctor!");
      setContent("");
    } catch (error) {
      console.error("Failed to save post:", error);
      toast.error("Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-(--surface) border border-(--border) rounded-2xl p-5 mb-6 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-(--text) mb-3 flex items-center gap-2">
        <Sparkles size={16} className="text-emerald-400" />
        Social Media Post
      </h2>
      <p className="text-xs text-(--text-muted) mb-4">
        Paste your social media post here. Your doctor can analyze it to gain clinical insights into your mental well-being.
      </p>
      
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write or paste your post here..."
          className="w-full min-h-[100px] p-3 rounded-xl bg-(--bg) border border-(--border) text-sm text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:border-emerald-500/50 resize-y"
        />
      </div>

      <div className="flex justify-end mt-4">
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || loading}
          loading={loading}
          icon={<Send size={14} />}
        >
          Save for Doctor
        </Button>
      </div>
    </motion.div>
  );
}
