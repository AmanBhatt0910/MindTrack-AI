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
import { doctorService } from "@/features/doctor/services/doctor.service";
import type { MessageThread, MessageItem } from "@/features/doctor/types/doctor.types";
import { useAuthStore } from "@/store/useAuthStore";

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeThreadIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeThreadIdRef.current = activeThreadId;
  }, [activeThreadId]);

  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user]);

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const socketIo = io("http://localhost:3001", {
      auth: { token }
    });

    socketIo.on("connect", () => {
      console.log("Connected to chat server");
      if (activeThreadIdRef.current) {
        socketIo.emit("join_conversation", activeThreadIdRef.current);
      }
    });

    socketIo.on("typing", (data: { conversationId: string }) => {
      if (data.conversationId === activeThreadIdRef.current) {
        setOtherTyping(true);
      }
    });

    socketIo.on("stop_typing", (data: { conversationId: string }) => {
      if (data.conversationId === activeThreadIdRef.current) {
        setOtherTyping(false);
      }
    });

    socketIo.on("new_message", (msg: MessageItem) => {
      const msgConvId = (msg as MessageItem & { conversationId?: string }).conversationId;
      if (msgConvId && msgConvId === activeThreadIdRef.current) {
        setMessages(prev => {
          if (!prev.find(m => m._id === msg._id)) {
            return [...prev, msg];
          }
          return prev;
        });
      }
      setOtherTyping(false);
      setThreads(prev => prev.map(t => {
        if (t.id === msgConvId) {
          const isFromMe = msg.senderId === userIdRef.current;
          const isActive = t.id === activeThreadIdRef.current;
          return {
            ...t,
            lastMessage: { content: msg.content, sentAt: msg.createdAt, senderId: msg.senderId },
            unreadCount: !isFromMe && !isActive ? t.unreadCount + 1 : 0
          };
        }
        return t;
      }));
    });

    socketIo.on("message_notification", (msg: MessageItem) => {
      const msgConvId = (msg as MessageItem & { conversationId?: string }).conversationId;
      setThreads(prev => prev.map(t => {
        if (t.id === msgConvId) {
          const isActive = t.id === activeThreadIdRef.current;
          return {
            ...t,
            lastMessage: { content: msg.content, sentAt: msg.createdAt, senderId: msg.senderId },
            unreadCount: isActive ? 0 : t.unreadCount + 1
          };
        }
        return t;
      }));
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [user]);

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
      const data = await doctorService.getThreads();
      setThreads(data.threads || []);
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
    socket?.emit("join_conversation", threadId);
    socket?.emit("mark_read", { conversationId: threadId });

    // Reset unread count locally
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, unreadCount: 0 } : t));

    try {
      const data = await doctorService.getMessages(threadId);
      setMessages(data.messages || []);
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
    
    setNewMessage("");
  };

  const activeThread = threads.find((t) => t.id === activeThreadId);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="shimmer h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex h-[calc(100vh-12rem)] rounded-xl border border-(--border) bg-(--surface) overflow-hidden">
        {/* ─── Thread List ────────────────────────────────────────── */}
        <div className={`${activeThreadId ? "hidden sm:flex" : "flex"} flex-col w-full sm:w-80 border-r border-(--border)`}>
          <div className="px-4 py-3 border-b border-(--border)">
            <h3 className="text-sm font-semibold text-(--text)">Conversations</h3>
          </div>

          {threads.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <MessageSquare size={32} className="text-(--text-muted) opacity-40 mb-2" />
              <p className="text-xs text-(--text-muted) text-center">Connected Doctors</p>
              <p className="text-[10px] text-(--text-muted) text-center mt-1">No active patient connections found.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => openThread(thread.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b border-(--border) hover:bg-(--surface-raised) transition-colors cursor-pointer text-left ${
                    activeThreadId === thread.id ? "bg-(--surface-raised)" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                    {thread.otherUser?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-(--text) truncate">{thread.otherUser?.name}</p>
                      {thread.unreadCount > 0 && (
                        <span className="bg-emerald-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-(--text-muted) truncate">
                      {thread.lastMessage?.content || "Start Conversation"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Message Area ───────────────────────────────────────── */}
        <div className={`${activeThreadId ? "flex" : "hidden sm:flex"} flex-col flex-1`}>
          {activeThread ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-(--border)">
                <button
                  onClick={() => {
                    socket?.emit("leave_conversation", activeThreadId);
                    setActiveThreadId(null);
                  }}
                  className="sm:hidden text-(--text-muted) cursor-pointer"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                  {activeThread.otherUser?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-(--text)">{activeThread.otherUser?.name}</p>
                  <p className="text-[10px] text-(--text-muted)">{activeThread.otherUser?.email}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => {
                  const isDoctor = msg.senderRole === "doctor";
                  return (
                    <div
                      key={msg._id || i}
                      className={`flex ${isDoctor ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        isDoctor
                          ? "bg-emerald-500/15 text-(--text)"
                          : "bg-(--surface-raised) text-(--text)"
                      }`}>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {isDoctor ? (
                            <Stethoscope size={10} className="text-emerald-400" />
                          ) : (
                            <User size={10} className="text-(--text-muted)" />
                          )}
                          <span className="text-[10px] text-(--text-muted)">
                            {isDoctor ? "You" : activeThread.otherUser?.name}
                          </span>
                        </div>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-[9px] text-(--text-muted) mt-1 text-right">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {otherTyping && (
                  <div className="flex justify-start">
                    <div className="bg-(--surface-raised) rounded-2xl px-4 py-2.5 flex items-center gap-1">
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-(--text-muted) rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-(--text-muted) rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-(--text-muted) rounded-full animate-bounce"></span>
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-(--border) p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-(--bg) border border-(--border) text-sm text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                    className="p-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center">
              <MessageSquare size={48} className="text-(--text-muted) opacity-20 mb-3" />
              <p className="text-sm text-(--text-muted)">Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
