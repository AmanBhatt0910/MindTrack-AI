import { useLanguageStore } from "@/store/useLanguageStore";
import { translations, TranslationKey } from "@/constants/translations";

export function useTranslation() {
  const { language, setLanguage } = useLanguageStore();

  function t(key: TranslationKey): string {
    const lang = translations[language];
    const val = lang[key as keyof typeof lang];
    if (val !== undefined) return val as string;
    // Fallback to English
    const fallback = translations.en[key];
    if (fallback !== undefined) return fallback as string;
    // Last resort: return the key itself
    return key;
  }

  return { t, language, setLanguage };
}
