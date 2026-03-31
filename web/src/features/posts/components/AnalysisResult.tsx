"use client";

import { motion } from "framer-motion";
import { Brain, AlertTriangle, TrendingUp, Sparkles, BarChart3, Info } from "lucide-react";
import { AnalysisResponse } from "../types/post.types";

interface AnalysisResultProps {
  data: AnalysisResponse;
}

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.7) return "text-green-500";
  if (confidence >= 0.4) return "text-yellow-500";
  if (confidence >= 0.2) return "text-orange-500";
  return "text-red-500";
};

const getConfidenceBgColor = (confidence: number) => {
  if (confidence >= 0.7) return "bg-green-500";
  if (confidence >= 0.4) return "bg-yellow-500";
  if (confidence >= 0.2) return "bg-orange-500";
  return "bg-red-500";
};

const getPredictionIcon = (prediction: string) => {
  switch (prediction.toLowerCase()) {
    case "depression":
      return <AlertTriangle className="w-5 h-5 text-purple-500" />;
    case "anxiety":
      return <Brain className="w-5 h-5 text-yellow-500" />;
    case "stress":
      return <TrendingUp className="w-5 h-5 text-orange-500" />;
    case "bipolar":
      return <AlertTriangle className="w-5 h-5 text-pink-500" />;
    default:
      return <Sparkles className="w-5 h-5 text-green-500" />;
  }
};

const getPredictionColor = (prediction: string) => {
  switch (prediction.toLowerCase()) {
    case "depression":
      return "border-purple-500/20 bg-purple-500/5";
    case "anxiety":
      return "border-yellow-500/20 bg-yellow-500/5";
    case "stress":
      return "border-orange-500/20 bg-orange-500/5";
    case "bipolar":
      return "border-pink-500/20 bg-pink-500/5";
    default:
      return "border-green-500/20 bg-green-500/5";
  }
};

export default function AnalysisResult({ data }: AnalysisResultProps) {
  const confidencePercent = (data.confidence * 100).toFixed(1);
  const confidenceColor = getConfidenceColor(data.confidence);
  const predictionColor = getPredictionColor(data.prediction);

  // Check if there are any significant detections (above 30%)
  const hasSignificantDetections = data.mlData?.allPredictions?.some(
    (pred) => pred.confidence > 0.3
  ) ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[var(--radius-lg)] border ${predictionColor} bg-[var(--surface)] p-6 space-y-4`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getPredictionIcon(data.prediction)}
          <h3 className="text-lg font-semibold text-[var(--text)]">
            Analysis Result
          </h3>
        </div>
        <div className={`text-sm font-medium ${confidenceColor}`}>
          {confidencePercent}% confidence
        </div>
      </div>

      <div className="h-px bg-[var(--border)]" />

      {/* Main Prediction */}
      <div className="space-y-2">
        <div className="text-sm text-[var(--text-muted)]">Primary Detection</div>
        <div className="text-2xl font-bold text-[var(--text)]">
          {data.prediction}
        </div>
        <div className="w-full bg-[var(--surface-raised)] rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.confidence * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full ${getConfidenceBgColor(data.confidence)}`}
          />
        </div>
      </div>

      {/* Explanation */}
      {data.explanation && data.explanation.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-[var(--text-muted)]">Explanation</div>
          <div className="space-y-1">
            {data.explanation.map((text, idx) => (
              <p key={idx} className="text-sm text-[var(--text-secondary)]">
                • {text}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* All Detections - Show if we have mlData */}
      {data.mlData && data.mlData.allPredictions && data.mlData.allPredictions.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-[var(--text-muted)]" />
            <div className="text-sm text-[var(--text-muted)]">All Detections</div>
          </div>
          
          <div className="space-y-2">
            {data.mlData.allPredictions.map((pred, idx) => {
              const predConfidence = pred.confidence;
              const isSignificant = predConfidence > 0.3;
              const barColor = isSignificant 
                ? predConfidence > 0.7 ? "bg-green-500" : predConfidence > 0.4 ? "bg-yellow-500" : "bg-orange-500"
                : "bg-gray-500/30";
              
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={`capitalize ${isSignificant ? 'text-[var(--text)] font-medium' : 'text-[var(--text-muted)]'}`}>
                      {pred.label}
                      {isSignificant && (
                        <span className="ml-2 text-xs text-[var(--accent)]">●</span>
                      )}
                    </span>
                    <span className={`text-[var(--text-muted)] tabular-nums ${isSignificant ? 'font-medium' : ''}`}>
                      {(predConfidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-[var(--surface-raised)] rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${predConfidence * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: idx * 0.05 }}
                      className={`h-full rounded-full ${barColor}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Indicator for no significant issues */}
      {!hasSignificantDetections && data.prediction === "Neutral" && (
        <div className="mt-3 p-3 rounded-md bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-green-500" />
            <p className="text-xs text-green-600 dark:text-green-400">
              No significant mental health concerns detected in this text.
            </p>
          </div>
        </div>
      )}

      {/* Detailed Stats - Collapsible */}
      {data.mlData && data.mlData.rawProbs && (
        <details className="text-xs pt-2">
          <summary className="cursor-pointer text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            View detailed statistics
          </summary>
          <div className="mt-2 p-3 bg-[var(--surface-raised)] rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="text-[var(--text-muted)]">Model Label</div>
                <div className="font-mono text-[var(--text)]">{data.mlData.label}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[var(--text-muted)]">Raw Confidence</div>
                <div className="font-mono text-[var(--text)]">
                  {(data.mlData.confidence * 100).toFixed(2)}%
                </div>
              </div>
            </div>
            {data.mlData.probabilities && (
              <div className="space-y-1">
                <div className="text-[var(--text-muted)]">Raw Probabilities</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(data.mlData.probabilities).map(([key, value]) => (
                    <div key={key} className="flex justify-between font-mono text-xs">
                      <span className="capitalize">{key}:</span>
                      <span>{(value * 100).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </details>
      )}
    </motion.div>
  );
}