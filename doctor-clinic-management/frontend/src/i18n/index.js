import en from './translations/en';
import hi from './translations/hi';
import te from './translations/te';
import kn from './translations/kn';
import ta from './translations/ta';
import ml from './translations/ml';

export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
];

export const DEFAULT_LANGUAGE = 'en';

export const TRANSLATIONS = { en, hi, te, kn, ta, ml };

export function getTranslations(lang) {
  return TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANGUAGE];
}

// Resolve a dotted key (e.g. "sidebar.dashboard") from a translation object.
// Falls back to the English value, then to the key itself.
export function lookup(dict, key) {
  const value = key
    .split('.')
    .reduce((acc, part) => (acc && acc[part] != null ? acc[part] : undefined), dict);
  return value;
}

export function translate(lang, key, fallback) {
  const primary = lookup(TRANSLATIONS[lang], key);
  if (primary !== undefined) return primary;
  const enValue = lookup(TRANSLATIONS[DEFAULT_LANGUAGE], key);
  if (enValue !== undefined) return enValue;
  return fallback !== undefined ? fallback : key;
}
