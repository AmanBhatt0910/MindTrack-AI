"use client";

import { useState } from "react";
import PostInput from "@/features/posts/components/PostInput";
import LanguageSelect from "@/features/posts/components/LanguageSelect";
import AnalysisResult from "@/features/posts/components/AnalysisResult";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
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
    <div className="grid gap-6 md:grid-cols-2">
      {/* Input Section */}
      <Card className="space-y-4">
        <h2 className="text-lg font-semibold">Input Post</h2>

        <PostInput value={text} onChange={setText} />

        <LanguageSelect value={language} onChange={setLanguage} />

        <Button onClick={handleAnalyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </Button>
      </Card>

      <div>
        {result ? (
          <AnalysisResult data={result} />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <span style={{ color: "var(--muted)" }}>
              No analysis yet
            </span>
          </Card>
        )}
      </div>
    </div>
  );
}