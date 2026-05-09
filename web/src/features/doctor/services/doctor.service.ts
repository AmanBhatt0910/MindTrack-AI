/**
 * Doctor API Service Layer
 * All doctor-facing API calls through the existing axios instance.
 */

import { api } from "@/lib/axios";
import type {
  DashboardData,
  PatientListItem,
  PatientDetail,
  SessionNote,
  AlertItem,
  MessageItem,
  MessageThread,
  NotificationItem,
  ClinicalSummary,
  RiskTrendData,
} from "../types/doctor.types";

export const doctorService = {
  // ─── Dashboard ──────────────────────────────────────────────────────────────
  getDashboard: async (): Promise<DashboardData> => {
    const res = await api.get("/doctor/dashboard");
    return res.data;
  },

  // ─── Patients ───────────────────────────────────────────────────────────────
  getPatients: async (): Promise<{ patients: PatientListItem[] }> => {
    const res = await api.get("/doctor/patients");
    return res.data;
  },

  getPatientDetail: async (id: string): Promise<PatientDetail> => {
    const res = await api.get(`/doctor/patients/${id}`);
    return res.data;
  },

  assignPatient: async (
    patientEmail: string
  ): Promise<{ message: string }> => {
    const res = await api.post("/doctor/patients", { patientEmail });
    return res.data;
  },

  acceptPatient: async (
    patientId: string
  ): Promise<{ success: boolean }> => {
    const res = await api.post("/doctor/patients/accept", { patientId });
    return res.data;
  },

  // ─── Sessions ───────────────────────────────────────────────────────────────
  getSessions: async (
    patientId?: string
  ): Promise<{ sessions: SessionNote[] }> => {
    const params = patientId ? `?patientId=${patientId}` : "";
    const res = await api.get(`/doctor/sessions${params}`);
    return res.data;
  },

  createSession: async (data: {
    patientId: string;
    noteContent: string;
    sessionDate?: string;
    moodAtSession?: string;
    riskAssessment?: string;
    primaryConcerns?: string[];
    followUpRequired?: boolean;
    nextSessionDate?: string;
  }): Promise<{ session: SessionNote }> => {
    const res = await api.post("/doctor/sessions", data);
    return res.data;
  },

  // ─── Alerts ─────────────────────────────────────────────────────────────────
  getAlerts: async (
    unreadOnly?: boolean
  ): Promise<{ alerts: AlertItem[] }> => {
    const params = unreadOnly ? "?unread=true" : "";
    const res = await api.get(`/doctor/alerts${params}`);
    return res.data;
  },

  acknowledgeAlert: async (id: string): Promise<{ alert: AlertItem }> => {
    const res = await api.patch(`/doctor/alerts/${id}/acknowledge`);
    return res.data;
  },

  // ─── Messages ───────────────────────────────────────────────────────────────
  getThreads: async (): Promise<{ threads: MessageThread[] }> => {
    const res = await api.get("/conversations");
    return { threads: res.data.conversations };
  },

  getMessages: async (
    conversationId: string
  ): Promise<{ messages: MessageItem[] }> => {
    const res = await api.get(`/conversations/${conversationId}/messages`);
    return res.data;
  },

  sendMessage: async (
    patientId: string, // Kept for backward compatibility if needed elsewhere
    content: string
  ): Promise<{ message: MessageItem }> => {
    // Actually we shouldn't use this if we use socket! 
    // We will keep it for now but the UI will use socket.emit
    const res = await api.post("/doctor/messages", { patientId, content });
    return res.data;
  },

  // ─── Notifications ──────────────────────────────────────────────────────────
  getNotifications: async (
    limit?: number
  ): Promise<{ notifications: NotificationItem[]; unreadCount: number }> => {
    const params = limit ? `?limit=${limit}` : "";
    const res = await api.get(`/doctor/notifications${params}`);
    return res.data;
  },

  markNotificationsRead: async (ids?: string[]): Promise<void> => {
    await api.patch("/doctor/notifications", { ids });
  },

  // ─── AI ─────────────────────────────────────────────────────────────────────
  getClinicalSummary: async (
    patientId: string
  ): Promise<{
    summary: ClinicalSummary | null;
    metadata: { entriesAnalyzed: number; dateRange: string; disclaimer: string };
  }> => {
    const res = await api.post("/ai/clinical-summary", { patientId });
    return res.data;
  },

  getRiskTrend: async (patientId: string): Promise<RiskTrendData> => {
    const res = await api.get(`/ai/risk-trend?patientId=${patientId}`);
    return res.data;
  },
};
