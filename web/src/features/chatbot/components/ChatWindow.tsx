"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Trash2, Plus, MessageCircle } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { chatService } from "../services/chatbot.service";
import { ChatMessage as ChatMessageType } from "../types/chat.types";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useTranslation } from "@/hooks/useTranslation";
import { CRISIS_RESOURCES } from "../types/chat.types";

export default function ChatWindow() {
  const { t } = useTranslation();
  const {
    sessions,
    activeSessionId,
    isTyping,
    createSession,
    getActiveSession,
    addMessage,
    setTyping,
    clearSession,
    setActiveSession,
  } = useChatStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeSession = getActiveSession();

  // Auto-create session if none exists
  useEffect(() => {
    if (!activeSessionId || !sessions.find((s) => s.id === activeSessionId)) {
      createSession();
    }
  }, [activeSessionId, sessions, createSession]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isTyping]);

  const handleSend = useCallback(
    async (text: string) => {
      // Add user message
      const userMsg: ChatMessageType = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      };
      addMessage(userMsg);
      setTyping(true);

      try {
        const session = getActiveSession();
        const history = (session?.messages ?? []).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await chatService.sendMessage({
          message: text,
          sessionHistory: history,
        });

        const botMsg: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.reply,
          source: response.source,
          timestamp: new Date().toISOString(),
        };
        addMessage(botMsg);
      } catch {
        const errorMsg: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: t("chatError"),
          source: "rule",
          timestamp: new Date().toISOString(),
        };
        addMessage(errorMsg);
      } finally {
        setTyping(false);
      }
    },
    [addMessage, setTyping, getActiveSession, t]
  );

  return (
    <div className="flex h-full">
      {/* Session list sidebar (desktop only) */}
      <div className="hidden lg:flex flex-col w-64 border-r border-[var(--border)] bg-[var(--surface)]">
        <div className="p-4 border-b border-[var(--border)]">
          <button
            onClick={createSession}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                       bg-[var(--accent)] text-[#080c10] text-sm font-medium
                       hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSession(session.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all
                ${
                  session.id === activeSessionId
                    ? "bg-[var(--accent-dim)] text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]"
                }`}
            >
              <MessageCircle size={14} />
              <span className="truncate flex-1">
                {session.messages.length > 0
                  ? session.messages[0].content.slice(0, 30) + "…"
                  : "New conversation"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-[var(--accent-dim)] border border-[var(--accent)]/20 flex items-center justify-center">
              <Bot size={16} className="text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)]">
                {t("chatTitle")}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {isTyping ? t("chatThinking") : t("chatSubtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={createSession}
              className="lg:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] transition"
              title="New Chat"
            >
              <Plus size={16} />
            </button>
            {activeSessionId && (
              <button
                onClick={() => clearSession(activeSessionId)}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/5 transition"
                title="Clear chat"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Welcome message */}
          {(!activeSession || activeSession.messages.length === 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full gap-4 text-center py-16"
            >
              <div className="size-16 rounded-2xl bg-[var(--accent-dim)] border border-[var(--accent)]/20 flex items-center justify-center">
                <Bot size={28} className="text-[var(--accent)]" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="text-lg font-semibold text-[var(--text)]">
                  {t("chatTitle")}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {t("chatWelcome")}
                </p>
              </div>

              {/* Crisis resources info */}
              <div className="mt-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] max-w-md">
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  🆘 If you&apos;re in crisis, these resources are always available:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {CRISIS_RESOURCES.map((r) => (
                    <div
                      key={r.phone}
                      className="text-left p-2 rounded-lg bg-[var(--surface-raised)]"
                    >
                      <p className="text-xs font-medium text-[var(--text)]">
                        {r.name}
                      </p>
                      <p className="text-[10px] text-[var(--accent)]">
                        {r.phone}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat messages */}
          {activeSession?.messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3"
              >
                <div className="size-8 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center">
                  <Bot size={14} className="text-[var(--accent)]" />
                </div>
                <div className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                        className="size-2 rounded-full bg-[var(--text-muted)]"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
    </div>
  );
}
