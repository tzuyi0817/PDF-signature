import { showToast } from '@/components/common';
import i18n from '@/plugins/i18n';
import type { App } from 'vue';

export default {
  install(app: App) {
    app.config.errorHandler = (error, vm, info) => {
      console.error('Global error handling:', error);
      console.error('The error occurred in:', vm);
      console.error('The error message:', info);

      errorHandler();
    };

    window.addEventListener('error', ({ message, filename, lineno, colno, error }) => {
      console.error('Error caught:', { message, filename, lineno, colno, error });

      errorHandler();
      return true; // Return true to prevent errors from continuing to be output on the console
    });

    window.addEventListener('unhandledrejection', event => {
      console.error('Catch errors thrown by unhandled Promise', event.reason);

      errorHandler();
    });
  },
};

function errorHandler() {
  const { t } = i18n.global;
  const reloadBtn = document.querySelector('#loading-reload');

  showToast({ message: t('prompt.error_occurred'), type: 'error' });

  if (!reloadBtn || !(reloadBtn instanceof HTMLElement)) return;
  reloadBtn.style.display = 'flex';
}
