"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChatMessage, ChatSession } from "../types/chat.types";

interface ChatStore {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isTyping: boolean;

  // Actions
  createSession: () => string;
  getActiveSession: () => ChatSession | null;
  addMessage: (message: ChatMessage) => void;
  setTyping: (typing: boolean) => void;
  clearSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      isTyping: false,

      createSession: () => {
        const id = Date.now().toString();
        const session: ChatSession = {
          id,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          sessions: [session, ...state.sessions],
          activeSessionId: id,
        }));
        return id;
      },

      getActiveSession: () => {
        const { sessions, activeSessionId } = get();
        return sessions.find((s) => s.id === activeSessionId) ?? null;
      },

      addMessage: (message) => {
        set((state) => {
          const sessions = state.sessions.map((s) => {
            if (s.id === state.activeSessionId) {
              return {
                ...s,
                messages: [...s.messages, message],
                updatedAt: new Date().toISOString(),
              };
            }
            return s;
          });
          return { sessions };
        });
      },

      setTyping: (typing) => set({ isTyping: typing }),

      clearSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          activeSessionId:
            state.activeSessionId === sessionId
              ? null
              : state.activeSessionId,
        }));
      },

      setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),
    }),
    { name: "mindtrack-chat-store" }
  )
);
