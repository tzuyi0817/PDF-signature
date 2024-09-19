import type { App } from 'vue';
import i18n from '@/plugins/i18n';
import { toast } from '@/utils/toast';

export default {
  install(app: App) {
    app.config.errorHandler = (error, vm, info) => {
      console.error('Global error handling:', error);
      console.error('The error occurred in:', vm);
      console.error('The error message:', info);

      errorHandler();
    };

    window.onerror = function (message, source, lineno, colno, error) {
      console.error('Error caught:', { message, source, lineno, colno, error });

      errorHandler();
      return true; // Return true to prevent errors from continuing to be output on the console
    };

    window.addEventListener('unhandledrejection', event => {
      console.error('Catch errors thrown by unhandled Promise', event.reason);

      errorHandler();
    });

    function errorHandler() {
      const { t } = i18n.global;
      const reloadBtn = document.getElementById('loading-reload');

      toast.showToast(t('prompt.error_occurred'), 'error');

      if (!reloadBtn) return;
      reloadBtn.style.display = 'flex';
    }
  },
};
