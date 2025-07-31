// src/i18n.ts
import i18n from 'i18next';

const languages = ['en', 'de', 'es', 'fr', 'ru', 'zh'] as const;
type Lang = typeof languages[number];

let initialized = false;

export async function initI18n(): Promise<void> {
  if (initialized) return;

  const savedLang = localStorage.getItem('userLanguage');
  const browserLang = navigator.language.split('-')[0] as Lang;
  const lang = languages.includes(savedLang as Lang) ? (savedLang as Lang) :
               languages.includes(browserLang) ? browserLang : 'en';

  try {
    const res = await fetch(`/src/locales/${lang}/translation.json`);
    if (!res.ok) throw new Error(`Failed to load ${lang}`);
    const translation = await res.json();

    i18n.init({
      lng: lang,
      fallbackLng: 'en',
      resources: { [lang]: { translation } },
      interpolation: { escapeValue: false }
    });
  } catch (err) {
    console.warn(`Failed to load ${lang}, falling back to en`, err);
    const res = await fetch('/src/locales/en/translation.json');
    const translation = await res.json();
    i18n.init({
      lng: 'en',
      fallbackLng: 'en',
      resources: { en: { translation } },
      interpolation: { escapeValue: false }
    });
  }

  initialized = true;
}

export function t(key: string): string {
  return i18n.t(key);
}


/* // src/i18n.ts
import i18n from 'i18next';

// Supported languages
const languages = ['en', 'de', 'es', 'fr', 'ru', 'zh'] as const;
type Lang = typeof languages[number];

let initialized = false;

export async function initI18n(): Promise<void> {
  if (initialized) return;

  // Detect saved or browser language
  const savedLang = localStorage.getItem('userLanguage');
  const browserLang = navigator.language.split('-')[0] as Lang;
  const lang = languages.includes(savedLang as Lang) ? (savedLang as Lang) :
               languages.includes(browserLang) ? browserLang : 'en';

  try {
    // Fetch translation file
    const res = await fetch(`/locales/${lang}/translation.json`);
    if (!res.ok) throw new Error(`Failed to load ${lang}`);
    const translation = await res.json();

    i18n.init({
      lng: lang,
      fallbackLng: 'en',
      resources: { [lang]: { translation } },
      interpolation: { escapeValue: false }
    });
  } catch (err) {
    console.error('i18n init failed, falling back to en', err);
    // Fallback to en if file not found
    const res = await fetch('/locales/en/translation.json');
    const translation = await res.json();
    i18n.init({
      lng: 'en',
      resources: { en: { translation } },
      interpolation: { escapeValue: false }
    });
  }

  initialized = true;
}

export function t(key: string): string {
  return i18n.t(key);
} */