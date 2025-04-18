import { ROUTER_INJECT_KEY } from '@/constants/router';
import { router } from './setup';
import type { App } from 'vue';

export * from './events';

export default {
  install(app: App) {
    app.provide(ROUTER_INJECT_KEY, router.currentRoute);
    app.use(router);
  },
};
