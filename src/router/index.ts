import { ROUTER_INJECT_KEY } from '@/constants/router';
import { preloadRoutes } from './preload';
import { router } from './setup';
import type { App } from 'vue';

export * from './events';

router.isReady().then(() => {
  preloadRoutes(router);
});

export default {
  install(app: App) {
    app.provide(ROUTER_INJECT_KEY, router.currentRoute);
    app.use(router);
  },
};
