import { api } from "@/lib/axios";
import { ChatRequest, ChatResponse } from "../types/chat.types";

export const chatService = {
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const res = await api.post<ChatResponse>("/chat", data);
    return res.data;
  },
};
