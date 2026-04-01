export type MessageRole = "user" | "assistant";
export type MessageSource = "rule" | "gemini" | "crisis";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  source?: MessageSource;
  timestamp: string; // ISO string
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatRequest {
  message: string;
  sessionHistory?: { role: MessageRole; content: string }[];
}

export interface ChatResponse {
  reply: string;
  source: MessageSource;
  isCrisis: boolean;
  crisisResources?: CrisisResource[];
}

export interface CrisisResource {
  name: string;
  phone: string;
  description: string;
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: "National Suicide Prevention Lifeline",
    phone: "988",
    description: "24/7 free and confidential support",
  },
  {
    name: "Crisis Text Line",
    phone: "Text HOME to 741741",
    description: "Free crisis counseling via text",
  },
  {
    name: "iCall (India)",
    phone: "9152987821",
    description: "Psychosocial helpline by TISS",
  },
  {
    name: "Vandrevala Foundation (India)",
    phone: "1860-2662-345",
    description: "24/7 mental health support",
  },
];
