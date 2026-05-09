/* ─── Doctor Feature Types ──────────────────────────────────────────────────── */

export interface DashboardStats {
  totalPatients: number;
  highRiskCount: number;
  unreadNotifications: number;
  recentSessions: number;
  crisisAlerts: number;
}

export interface HighRiskPatient {
  patientId: string;
  prediction: string;
  riskLevel: string;
  confidence: number;
  date: string;
}

export interface DashboardData {
  stats: DashboardStats;
  highRiskPatients: HighRiskPatient[];
}

export interface PatientListItem {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  assignmentStatus: string;
  consentGiven: boolean;
  latestRiskLevel: string;
  latestPrediction: string;
  latestConfidence: number;
  lastAnalysisDate: string | null;
  totalEntries: number;
  priorityScore: number;
}

export interface PatientSummary {
  totalEntries: number;
  riskDistribution: { Low: number; Medium: number; High: number };
  disorderFrequency: Record<string, number>;
  avgProbabilities: Record<string, number>;
  latestRiskLevel: string;
  latestPrediction: string;
  lastEntryDate: string | null;
}

export interface PatientAnalysis {
  id: string;
  prediction: string;
  confidence: number;
  riskLevel: string;
  explanation: string[];
  mlData: {
    labels: string[];
    probabilities: Record<string, number>;
    allPredictions?: { label: string; confidence: number }[];
    shapData?: { tokens: string[]; scores: number[] };
  };
  crisisEscalation: boolean;
  createdAt: string;
}

export interface PatientDetail {
  patient: { id: string; name: string; email: string; memberSince: string };
  summary: PatientSummary;
  recentAnalyses: PatientAnalysis[];
  emotionTimeline: unknown[];
  sessionNotes: SessionNote[];
  assignment: { status: string; assignedAt: string; consentGiven: boolean };
}

export interface SessionNote {
  _id: string;
  doctorId: string;
  patientId: string;
  sessionDate: string;
  noteContent: string;
  moodAtSession: string;
  riskAssessment: string;
  primaryConcerns: string[];
  followUpRequired: boolean;
  nextSessionDate: string | null;
  createdAt: string;
}

export interface AlertItem {
  _id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  priority: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface MessageItem {
  _id: string;
  senderId: string;
  receiverId: string;
  senderRole: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  patientId: string;
  doctorId: string;
  otherUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  lastMessage: { content: string; sentAt: string; senderId: string };
  unreadCount: number;
}

export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  priority: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ClinicalSummary {
  primaryConcerns: string[];
  symptomProgression: string;
  riskTrajectory: string;
  currentRiskLevel: string;
  keyPatterns: string[];
  recommendedFocusAreas: string[];
  confidenceNote: string;
  ethicalDisclaimer: string;
}

export interface RiskTrendData {
  trend: "improving" | "stable" | "worsening";
  totalEntries: number;
  riskTimeline: {
    date: string;
    riskLevel: string;
    prediction: string;
    confidence: number;
    probabilities: Record<string, number>;
    crisisEscalation: boolean;
  }[];
  emotionTimeline: unknown[];
  alerts: {
    date: string;
    disorder: string;
    change: number;
    from: number;
    to: number;
  }[];
}
