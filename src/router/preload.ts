import { isFunction } from '@/utils/check-type';
import type { AsyncComponentLoader, Component } from 'vue';
import type { RouteComponent, Router } from 'vue-router';

const DEFAULT_CONCURRENCY = 3;

function parallelPreload(loaders: AsyncComponentLoader[], concurrency = DEFAULT_CONCURRENCY) {
  const iterator = loaders.values();

  const workers = Array.from({ length: concurrency }, async () => {
    for (const load of iterator) {
      try {
        await load();
      } catch (error: unknown) {
        console.warn('Component preloading failed:', error);
      }
    }
  });

  return Promise.all(workers);
}

export function preloadComponents(concurrency?: number) {
  scheduleIdle(async () => {
    const loaders: AsyncComponentLoader<Component>[] = [
      () => import('@/pages/upload/components/UploadPassword.vue'),
      () => import('@/components/biz/sign-encryption/src/index.vue'),
    ];

    await parallelPreload(loaders, concurrency);
  });
}

export async function preloadRoutes(router: Router, concurrency?: number) {
  await router.isReady();

  scheduleIdle(async () => {
    const loaders = router.getRoutes().flatMap(route => {
      const component = route.components?.default;

      return route.name && isLazyLoader(component) ? [component] : [];
    });

    await parallelPreload(loaders, concurrency);
  });
}

function isLazyLoader(component: unknown): component is () => Promise<RouteComponent> {
  return isFunction(component) && !('displayName' in component);
}

/** Safari does not support requestIdleCallback, setTimeout is used instead to delay execution. */
function scheduleIdle(callback: () => void) {
  if (requestIdleCallback) {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
}
