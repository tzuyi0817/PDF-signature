import type { AsyncComponent } from './types';
import type { AsyncComponentLoader, Component } from 'vue';
import type { Router, RouteRecordName } from 'vue-router';

/** Used to store preloaded routing components */
const preloadRouteSet = new Set<RouteRecordName>();

const requestIdleCallback =
  globalThis.requestIdleCallback ||
  function (callback: IdleRequestCallback) {
    const startTime = Date.now();
    // Use setTimeout to simulate and delay execution for 1ms
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - startTime)),
      });
    }, 1);
  };

export function isAsyncComponent(component: unknown): component is AsyncComponent {
  return typeof component === 'function' && component.length === 0;
}

async function parallelPreload<T, K>(
  concurrency: number,
  array: readonly T[],
  func: (item: T) => Promise<K>,
): Promise<Array<K>> {
  const n = array.length;
  const results: K[] = Array.from({ length: n });
  let currentIndex = 0;

  async function worker(): Promise<void> {
    const index = currentIndex++;

    if (index >= n) return;

    const item = array[index];

    if (item === undefined) return worker();

    results[index] = await func(item);

    return worker();
  }

  const workers = Array.from({ length: concurrency }, () => worker());

  await Promise.all(workers);

  return results;
}

export function preloadComponents() {
  requestIdleCallback(async () => {
    const components: AsyncComponentLoader<Component>[] = [
      () => import('@/pages/upload/components/UploadPassword.vue'),
      () => import('@/components/biz/sign-encryption/src/index.vue'),
    ];

    try {
      await parallelPreload(2, components, loader => loader());
    } catch (error) {
      // Preloading is solely for performance optimization; failure should not trigger global error handling.
      console.warn('Component preloading failed:', error);
    }
  });
}

export function preloadRoutes(router: Router, concurrency = 3) {
  requestIdleCallback(async () => {
    const routes = router.getRoutes();
    const dynamicRoutes = routes.filter(route => {
      if (!route.name || preloadRouteSet.has(route.name)) return false;

      return isAsyncComponent(route.components?.default);
    });

    try {
      await parallelPreload(concurrency, dynamicRoutes, route => {
        if (!route.name) {
          return Promise.reject(new Error('Route name is required for preloading'));
        }
        const name: RouteRecordName = route.name.toString();

        preloadRouteSet.add(name);

        if (!route.components?.default || !isAsyncComponent(route.components.default)) {
          return Promise.reject(new Error(`Route ${name} has no component to preload`));
        }

        return route.components.default();
      });
    } catch (error) {
      // Preloading is solely for performance optimization; failure should not trigger global error handling.
      console.warn('Route preloading failed:', error);
    }
  });
}
