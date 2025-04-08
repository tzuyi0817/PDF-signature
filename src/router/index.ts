import type { App } from 'vue';
import { router } from './setup';
import { ROUTER_INJECT_KEY } from '@/constants/router';

export * from './events';

export default {
  install(app: App) {
    app.provide(ROUTER_INJECT_KEY, router.currentRoute);
    app.use(router);
  },
};
