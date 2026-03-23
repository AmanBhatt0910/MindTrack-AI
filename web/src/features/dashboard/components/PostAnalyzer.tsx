"use client";

import { useState } from "react";
import PostInput from "@/features/posts/components/PostInput";
import LanguageSelect from "@/features/posts/components/LanguageSelect";
import AnalysisResult from "@/features/posts/components/AnalysisResult";
import Button from "@/components/ui/Button";
import { postService } from "@/features/posts/services/post.service";
import { AnalysisResponse } from "@/features/posts/types/post.types";

export default function PostAnalyzer() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setLoading(true);
    const res = await postService.analyze(text, language);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <PostInput value={text} onChange={setText} />

      <LanguageSelect value={language} onChange={setLanguage} />

      <Button onClick={handleAnalyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </Button>

      {result && <AnalysisResult data={result} />}
    </div>
  );
}