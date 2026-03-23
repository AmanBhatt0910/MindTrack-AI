import { AnalysisResponse } from "../types/post.types";
import ExplanationCard from "./ExplanationCard";
import { motion } from "framer-motion";

export default function AnalysisResult({
  data,
}: {
  data: AnalysisResponse;
}) {
  return (
    <motion.div
      className="p-6 rounded-xl space-y-4 border"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-xl font-semibold">
        Analysis Result
      </h2>

      <div className="flex justify-between">
        <span style={{ color: "var(--muted)" }}>
          Prediction
        </span>
        <span className="font-bold text-indigo-400">
          {data.prediction}
        </span>
      </div>

      <div className="flex justify-between">
        <span style={{ color: "var(--muted)" }}>
          Confidence
        </span>
        <span>{Math.round(data.confidence * 100)}%</span>
      </div>

      <div className="space-y-2">
        <p style={{ color: "var(--muted)" }}>
          Why this prediction?
        </p>

        {data.explanation.map((exp, i) => (
          <ExplanationCard key={i} text={exp} />
        ))}
      </div>
    </motion.div>
  );
}