import { createI18n } from 'vue-i18n';
import enUS from '@/locales/en-US.json';
import zhTW from '@/locales/zh-TW.json';
import jaJP from '@/locales/ja-JP.json';
import zhCN from '@/locales/zh-CN.json';
import koKR from '@/locales/ko-KR.json';
import frFR from '@/locales/fr-FR.json';
import deDE from '@/locales/de-DE.json';

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
  },
});

export default i18n;
