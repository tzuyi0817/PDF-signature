import { ROUTER_INJECT_KEY } from '@/constants/router';
import { preloadComponents, preloadRoutes } from './preload';
import { router } from './setup';
import type { App } from 'vue';

export default {
  async install(app: App) {
    app.provide(ROUTER_INJECT_KEY, router.currentRoute);
    app.use(router);

    await router.isReady();
    preloadRoutes(router);
    preloadComponents();
  },
};
