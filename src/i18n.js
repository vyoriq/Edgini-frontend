// src/i18n.js
import i18n from 'i18next';; // ✅ Required for setup once globally
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend) // Load translation files dynamically
  .use(LanguageDetector) // Detect user language via localStorage or browser
  .use(initReactI18next) // Integrate with React
  .init({
    fallbackLng: 'en', // default language
    debug: false,
    backend: {
      // Translation files served from /public/locales
      loadPath: '/locales/{{lng}}/translation.json'
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false // React already escapes by default
    }
  });

export default i18n;
