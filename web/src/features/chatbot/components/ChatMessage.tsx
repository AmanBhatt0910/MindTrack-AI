"use client";

import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { ChatMessage as ChatMessageType } from "../types/chat.types";

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isCrisis = message.source === "crisis";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 size-8 rounded-full flex items-center justify-center text-xs font-bold ${
          isUser
            ? "bg-[var(--accent)] text-[#080c10]"
            : isCrisis
            ? "bg-red-500/20 text-red-400 border border-red-500/30"
            : "bg-[var(--surface-raised)] text-[var(--accent)] border border-[var(--border)]"
        }`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Message bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${
            isUser
              ? "bg-[var(--accent)] text-[#080c10] rounded-tr-sm"
              : isCrisis
              ? "bg-red-500/10 border border-red-500/30 text-[var(--text)] rounded-tl-sm"
              : "bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] rounded-tl-sm"
          }
        `}
      >
        {/* Render markdown-lite (bold, line breaks) */}
        <div className="whitespace-pre-wrap">
          {message.content.split("\n").map((line, i) => (
            <span key={i}>
              {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={j} className="font-semibold">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return <span key={j}>{part}</span>;
              })}
              {i < message.content.split("\n").length - 1 && <br />}
            </span>
          ))}
        </div>

        {/* Timestamp */}
        <p
          className={`mt-1.5 text-[10px] ${
            isUser ? "text-[#080c10]/60" : "text-[var(--text-muted)]"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {message.source && !isUser && (
            <span className="ml-2 opacity-50">
              {message.source === "gemini" ? "✨ AI" : message.source === "crisis" ? "🆘" : "💬"}
            </span>
          )}
        </p>
      </div>
    </motion.div>
  );
}
