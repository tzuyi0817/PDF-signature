import { createI18n } from 'vue-i18n';
import enUS from '@/locales/en-US.json';
import zhTW from '@/locales/zh-TW.json';

const i18n = createI18n({
  legacy: import.meta.env.MODE === 'test',
  locale: navigator.language,
  fallbackLocale: 'en-US',
  messages: {
    'zh-TW': zhTW,
    'en-US': enUS,
  },
});

export default i18n;
