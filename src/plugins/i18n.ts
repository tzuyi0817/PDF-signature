import { createI18n } from 'vue-i18n';
import enUS from '@/locales/en-US.json';
import zhTW from '@/locales/zh-TW.json';
import jaJP from '@/locales/ja-JP.json';
import zhCN from '@/locales/zh-CN.json';
import koKR from '@/locales/ko-KR.json';
import frFR from '@/locales/fr-FR.json';
import deDE from '@/locales/de-DE.json';
import esEs from '@/locales/es-ES.json';
import itIT from '@/locales/it-IT.json';
import ruRU from '@/locales/ru-RU.json';
import ptPT from '@/locales/pt-PT.json';
import nlNL from '@/locales/nl-NL.json';
import svSE from '@/locales/sv-SE.json';
import noNO from '@/locales/no-NO.json';
import daDK from '@/locales/da-DK.json';
import fiFI from '@/locales/fi-FI.json';
import plPL from '@/locales/pl-PL.json';

const i18n = createI18n({
  legacy: import.meta.env.MODE === 'test',
  locale: localStorage.getItem('pdf-signature-i18n') ?? navigator.language,
  fallbackLocale: 'en-US',
  allowComposition: true,
  messages: {
    'zh-TW': zhTW,
    'en-US': enUS,
    'ja-JP': jaJP,
    'zh-CN': zhCN,
    'ko-KR': koKR,
    'fr-FR': frFR,
    'de-DE': deDE,
    'es-ES': esEs,
    'it-IT': itIT,
    'ru-RU': ruRU,
    'pt-PT': ptPT,
    'nl-NL': nlNL,
    'sv-SE': svSE,
    'no-NO': noNO,
    'da-DK': daDK,
    'fi-FI': fiFI,
    'pl-PL': plPL,
  },
});

export default i18n;
