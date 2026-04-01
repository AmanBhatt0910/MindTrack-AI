export interface SpeechRecognitionConfig {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  silenceTimeout: number; // ms before auto-stop on silence
}

export interface VoiceState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
}

export const DEFAULT_SPEECH_CONFIG: SpeechRecognitionConfig = {
  language: "en-US",
  continuous: true,
  interimResults: true,
  silenceTimeout: 5000,
};

// Language codes for Web Speech API
export const SPEECH_LANGUAGES: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  pt: "pt-BR",
  ar: "ar-SA",
  zh: "zh-CN",
};
