import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { de } from '../locales/de';

export const defaultLanguage = 'de';

/**
 * The UI ships in German only, so the bundle is compiled in rather than fetched
 * at runtime — no request on first paint and no flash of untranslated keys.
 * Adding a language means adding a resource entry here.
 */
i18n.use(initReactI18next).init({
  resources: {
    [defaultLanguage]: { translation: de },
  },
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  supportedLngs: [defaultLanguage],
  debug: false,
  react: {
    useSuspense: false,
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
