import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { LANGUAGES, DEFAULT_LANGUAGE, translate } from './index';

const STORAGE_KEY = 'clinic_lang';

const LanguageContext = createContext(null);

function getInitialLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && LANGUAGES.some((l) => l.code === stored)) return stored;
  const browser = window.navigator?.language?.slice(0, 2);
  if (browser && LANGUAGES.some((l) => l.code === browser)) return browser;
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((lang) => {
    if (LANGUAGES.some((l) => l.code === lang)) setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key, fallback) => translate(language, key, fallback),
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, languages: LANGUAGES }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe no-op fallback so components can be used outside the provider.
    return {
      language: DEFAULT_LANGUAGE,
      setLanguage: () => {},
      t: (key, fallback) => fallback ?? key,
      languages: LANGUAGES,
    };
  }
  return ctx;
}

export default LanguageContext;
