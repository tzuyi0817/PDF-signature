import messages from '@intlify/unplugin-vue-i18n/messages';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: import.meta.env.MODE === 'test',
  locale: localStorage.getItem('pdf-signature-i18n') ?? navigator.language,
  fallbackLocale: 'en-US',
  allowComposition: true,
  messages,
});

export default i18n;
