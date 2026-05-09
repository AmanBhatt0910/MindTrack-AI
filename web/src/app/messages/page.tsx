"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  User,
  Stethoscope,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";
import type { MessageItem, MessageThread } from "@/features/doctor/types/doctor.types";
import { api } from "@/lib/axios";

export default function PatientMessagesPage() {
  const { user } = useAuthStore();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadThreads();
    
    // Connect to Socket.IO Server
    const token = localStorage.getItem("token");
    if (!token) return;

    const socketIo = io("http://localhost:3001", {
      auth: { token }
    });

    socketIo.on("connect", () => {
      console.log("Connected to chat server");
    });

    socketIo.on("typing", (data: { conversationId: string }) => {
      if (data.conversationId === activeThreadId) {
        setOtherTyping(true);
      }
    });

    socketIo.on("stop_typing", (data: { conversationId: string }) => {
      if (data.conversationId === activeThreadId) {
        setOtherTyping(false);
      }
    });

    socketIo.on("new_message", (msg: MessageItem) => {
      setMessages(prev => {
        if (!prev.find(m => m._id === msg._id)) {
          return [...prev, msg];
        }
        return prev;
      });
      setOtherTyping(false);
      // Update thread last message
      setThreads(prev => prev.map(t => {
        if (t.id === (msg as any).conversationId) {
          return {
            ...t,
            lastMessage: { content: msg.content, sentAt: msg.createdAt, senderId: msg.senderId },
            unreadCount: msg.senderId !== user?.id && t.id !== activeThreadId ? t.unreadCount + 1 : 0
          };
        }
        return t;
      }));
    });

    socketIo.on("message_notification", (msg: MessageItem) => {
      setThreads(prev => prev.map(t => {
        if (t.id === (msg as any).conversationId) {
          return {
            ...t,
            lastMessage: { content: msg.content, sentAt: msg.createdAt, senderId: msg.senderId },
            unreadCount: t.unreadCount + 1
          };
        }
        return t;
      }));
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [user, activeThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!socket || !activeThreadId) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { conversationId: activeThreadId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stop_typing", { conversationId: activeThreadId });
    }, 2000);
  };

  const loadThreads = async () => {
    try {
      const res = await api.get("/conversations");
      setThreads(res.data.conversations || []);
    } catch (err) {
      console.error("Failed to load threads:", err);
    } finally {
      setLoading(false);
    }
  };

  const openThread = async (threadId: string) => {
    if (activeThreadId) {
      socket?.emit("leave_conversation", activeThreadId);
    }
    setActiveThreadId(threadId);
    setOtherTyping(false);
    socket?.emit("join_conversation", threadId);
    socket?.emit("mark_read", { conversationId: threadId });

    // Reset unread count locally
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, unreadCount: 0 } : t));

    try {
      const res = await api.get(`/conversations/${threadId}/messages`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const handleSend = () => {
    const activeThread = threads.find(t => t.id === activeThreadId);
    if (!activeThreadId || !newMessage.trim() || !socket || !activeThread) return;
    
    socket.emit("send_message", {
      conversationId: activeThreadId,
      receiverId: activeThread.otherUser.id,
      content: newMessage.trim()
    });
    
    socket.emit("stop_typing", { conversationId: activeThreadId });
    setIsTyping(false);
    setNewMessage("");
  };

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <DashboardLayout title="Messages" subtitle="Communicate with your assigned doctor.">
      {loading ? (
        <div className="max-w-5xl mx-auto">
          <div className="shimmer h-96 rounded-xl" />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="flex h-[calc(100vh-10rem)] rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden relative">
            {/* ─── Thread List ────────────────────────────────────────── */}
            <div className={`${activeThreadId ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-96 border-r border-[var(--border)] bg-[var(--surface-raised)]/30 backdrop-blur-md`}>
              <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface)]/80 sticky top-0 z-10">
                <h3 className="text-xl font-bold text-[var(--text)] tracking-tight">Messages</h3>
              </div>

              {threads.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                  <MessageSquare size={32} className="text-[var(--text-muted)] opacity-40 mb-2" />
                  <p className="text-xs text-[var(--text-muted)] text-center">Connected Doctors</p>
                  <p className="text-[10px] text-[var(--text-muted)] text-center mt-1">No active connections yet. Head to Counselling to connect with a doctor.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  {threads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => openThread(thread.id)}
                      className={`w-full flex items-center gap-4 px-6 py-4 border-b border-[var(--border)] transition-all cursor-pointer text-left group
                        ${
                          activeThreadId === thread.id 
                            ? "bg-emerald-500/10 border-l-4 border-l-emerald-500" 
                            : "hover:bg-[var(--surface)] border-l-4 border-l-transparent"
                        }`}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg font-bold shadow-md transform group-hover:scale-105 transition-transform">
                          {thread.otherUser?.name?.charAt(0).toUpperCase()}
                        </div>
                        {thread.unreadCount > 0 && (
                          <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm border-2 border-[var(--surface)]">
                            {thread.unreadCount}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-base font-bold truncate ${thread.unreadCount > 0 ? "text-[var(--text)]" : "text-[var(--text-secondary)]"}`}>
                            Dr. {thread.otherUser?.name}
                          </p>
                        </div>
                        <p className={`text-sm truncate ${thread.unreadCount > 0 ? "font-medium text-[var(--text)]" : "text-[var(--text-muted)]"}`}>
                          {thread.lastMessage?.content || "Start Conversation"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ─── Message Area ───────────────────────────────────────── */}
            <div className={`${activeThreadId ? "flex" : "hidden lg:flex"} flex-col flex-1 bg-[var(--bg)]`}>
              {activeThread ? (
                <>
                  {/* Chat header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          socket?.emit("leave_conversation", activeThreadId);
                          setActiveThreadId(null);
                        }}
                        className="lg:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] transition-colors cursor-pointer"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {activeThread.otherUser?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-base font-bold text-[var(--text)]">Dr. {activeThread.otherUser?.name}</p>
                        <p className="text-xs font-medium text-emerald-500 flex items-center gap-1.5">
                          <span className="relative flex size-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                          </span>
                          Verified Professional
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map((msg, i) => {
                      const isPatient = msg.senderRole === "patient";
                      return (
                        <div
                          key={msg._id || i}
                          className={`flex ${isPatient ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
                            isPatient
                              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-sm"
                              : "bg-[var(--surface-raised)] text-[var(--text)] border border-[var(--border)] rounded-bl-sm"
                          }`}>
                            <div className="flex items-center gap-1.5 mb-1 opacity-80">
                              {isPatient ? (
                                <User size={12} />
                              ) : (
                                <Stethoscope size={12} className="text-emerald-500" />
                              )}
                              <span className="text-[10px] font-medium tracking-wide">
                                {isPatient ? "You" : `Dr. ${activeThread.otherUser?.name}`}
                              </span>
                            </div>
                            <p className="text-[15px] leading-relaxed">{msg.content}</p>
                            <p className={`text-[10px] mt-2 text-right ${isPatient ? "text-emerald-100" : "text-[var(--text-muted)]"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {otherTyping && (
                      <div className="flex justify-start">
                        <div className="bg-[var(--surface-raised)] rounded-2xl px-4 py-2.5 flex items-center gap-1">
                          <span className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce"></span>
                          </span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t border-[var(--border)] p-4 bg-[var(--surface)]">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        placeholder="Type your message here..."
                        className="flex-1 px-5 py-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 transition-all cursor-pointer transform active:scale-95"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <MessageSquare size={48} className="text-[var(--text-muted)] opacity-20 mb-3" />
                  <p className="text-sm text-[var(--text-muted)]">Select a conversation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
