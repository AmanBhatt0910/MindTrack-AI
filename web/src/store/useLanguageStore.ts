import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Language } from "@/constants/translations";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
    }),
    { name: "mindtrack-language" }
  )
);
