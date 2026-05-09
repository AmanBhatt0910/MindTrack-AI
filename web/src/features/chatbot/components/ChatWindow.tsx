"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Trash2, Plus, MessageCircle, PhoneCall } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { chatService } from "../services/chatbot.service";
import { ChatMessage as ChatMessageType } from "../types/chat.types";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useTranslation } from "@/hooks/useTranslation";
import { CRISIS_RESOURCES } from "../types/chat.types";

export default function ChatWindow() {
  const { t, language } = useTranslation();
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
          language,
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
    [addMessage, setTyping, getActiveSession, t, language]
  );

  return (
    <div className="flex h-full">
      <div className="hidden lg:flex flex-col w-72 border-r border-[var(--border)] bg-[var(--surface)] shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10 relative">
        <div className="p-5 border-b border-[var(--border)] bg-gradient-to-b from-[var(--surface-raised)] to-transparent">
          <button
            onClick={createSession}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                       bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold shadow-md
                       hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0"
          >
            <Plus size={18} />
            Start New Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSession(session.id)}
              className={`w-full flex flex-col gap-1 px-4 py-3 rounded-xl text-left transition-all duration-200 border
                ${
                  session.id === activeSessionId
                    ? "bg-emerald-500/10 border-emerald-500/30 shadow-sm"
                    : "bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:border-[var(--border)]"
                }`}
            >
              <div className="flex items-center gap-2">
                <MessageCircle size={14} className={session.id === activeSessionId ? "text-emerald-500" : "text-[var(--text-muted)]"} />
                <span className={`text-sm font-medium truncate flex-1 ${session.id === activeSessionId ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--text)]"}`}>
                  {session.messages.length > 0
                    ? session.messages[0].content.slice(0, 25) + "…"
                    : "New conversation"}
                </span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] pl-6">
                {new Date(session.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg)] relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="size-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <Bot size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text)]">
                AI Wellness Guide
              </h3>
              <p className="text-xs font-medium text-emerald-500 flex items-center gap-1.5">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                </span>
                {isTyping ? "Typing a response..." : "Online & ready to listen"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={createSession}
              className="lg:hidden p-2.5 rounded-xl text-[var(--text-secondary)] bg-[var(--surface-raised)] border border-[var(--border)] hover:bg-[var(--accent-dim)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-all shadow-sm"
              title="New Chat"
            >
              <Plus size={18} />
            </button>
            {activeSessionId && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this chat session?")) {
                    clearSession(activeSessionId);
                  }
                }}
                className="p-2.5 rounded-xl text-red-400 bg-red-500/5 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all shadow-sm group"
                title="Delete Chat"
              >
                <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
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
