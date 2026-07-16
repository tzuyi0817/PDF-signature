import { ROUTER_INJECT_KEY } from '@/constants/router';
import { preloadComponents, preloadRoutes } from './preload';
import { router } from './setup';
import type { App } from 'vue';

export default {
  install(app: App) {
    app.provide(ROUTER_INJECT_KEY, router.currentRoute);
    app.use(router);

    if (import.meta.env.DEV) return;

    preloadRoutes(router);
    preloadComponents();
  },
};
