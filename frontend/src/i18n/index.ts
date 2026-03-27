import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enStudent from './locales/en/student.json';
import enHr from './locales/en/hr.json';
import enAdmin from './locales/en/admin.json';

import ruCommon from './locales/ru/common.json';
import ruAuth from './locales/ru/auth.json';
import ruStudent from './locales/ru/student.json';
import ruHr from './locales/ru/hr.json';
import ruAdmin from './locales/ru/admin.json';

import kkCommon from './locales/kk/common.json';
import kkAuth from './locales/kk/auth.json';
import kkStudent from './locales/kk/student.json';
import kkHr from './locales/kk/hr.json';
import kkAdmin from './locales/kk/admin.json';

export const resources = {
  en: { common: enCommon, auth: enAuth, student: enStudent, hr: enHr, admin: enAdmin },
  ru: { common: ruCommon, auth: ruAuth, student: ruStudent, hr: ruHr, admin: ruAdmin },
  kk: { common: kkCommon, auth: kkAuth, student: kkStudent, hr: kkHr, admin: kkAdmin },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'common',
    fallbackLng: 'ru',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
