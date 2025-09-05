import { ROUTER_INJECT_KEY } from '@/constants/router';
import { preloadComponents, preloadRoutes } from './preload';
import { router } from './setup';
import type { App } from 'vue';

export * from './events';

router.isReady().then(() => {
  preloadRoutes(router);
  preloadComponents();
});

export default {
  install(app: App) {
    app.provide(ROUTER_INJECT_KEY, router.currentRoute);
    app.use(router);
  },
};
