import type { AsyncComponent } from './types';
import type { Router, RouteRecordName } from 'vue-router';

/** Used to store preloaded routing components */
const preloadRouteSet = new Set<RouteRecordName>();

const requestIdleCallback =
  window.requestIdleCallback ||
  function (callback: IdleRequestCallback) {
    const startTime = Date.now();
    // Use setTimeout to simulate and delay execution for 1ms
    return window.setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - startTime)),
      });
    }, 1);
  };

export function isAsyncComponent(component: unknown): component is AsyncComponent {
  return typeof component === 'function' && component.length === 0;
}

function parallelPreload<T, K>(
  concurrency: number,
  array: readonly T[],
  func: (item: T) => Promise<K>,
): Promise<Array<K>> {
  const n = array.length;
  const results: K[] = Array.from({ length: n });
  let currentIndex = 0;

  function worker(): Promise<void> {
    const index = currentIndex++;

    if (index >= n) {
      return Promise.resolve();
    }

    const item = array[index];

    if (item === undefined) return worker();

    return func(item).then(result => {
      results[index] = result;

      return worker();
    });
  }

  const workers = Array.from({ length: concurrency }, worker);

  return Promise.all(workers).then(() => results);
}

export function preloadRoutes(router: Router, concurrency = 3) {
  requestIdleCallback(() => {
    const routes = router.getRoutes();
    const dynamicRoutes = routes.filter(route => {
      if (!route.name || preloadRouteSet.has(route.name)) return false;

      return isAsyncComponent(route.components?.default);
    });

    parallelPreload(concurrency, dynamicRoutes, route => {
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
  });
}
