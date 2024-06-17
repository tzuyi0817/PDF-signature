import type { App } from 'vue';
import i18n from '@/plugins/i18n';
import toast from '@/utils/toast';

export default {
  install(app: App) {
    app.config.errorHandler = (err, vm, info) => {
      const { t } = i18n.global;

      console.error('Global error handling:', err);
      console.error('The error occurred in:', vm);
      console.error('The error message:', info);
      toast.showToast(t('prompt.error_occurred'), 'error');
    };
  },
};
