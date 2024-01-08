import { createI18n } from 'vue-i18n';
import enUS from '@/locales/en-US.json';
import zhTW from '@/locales/zh-TW.json';

const i18n = createI18n({
  legacy: import.meta.env.MODE === 'test',
  locale: localStorage.getItem('pdf-signature-i18n') ?? navigator.language,
  fallbackLocale: 'en-US',
  allowComposition: true,
  messages: {
    'zh-TW': zhTW,
    'en-US': enUS,
  },
});

export default i18n;
