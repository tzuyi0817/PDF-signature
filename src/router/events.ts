import { inject } from 'vue';
import { ROUTER_INJECT_KEY } from '@/constants/router';
import type { RouterEvents } from '@/types/router';
import type { Router } from 'vue-router';

type Handler<T> = (params?: T) => void;
type RouterEventKey = keyof RouterEvents;
type EventKey = `${RouterEventKey}-${string}`;

class RouteEvent {
  #events = new Map<EventKey, Set<Handler<any>>>();

  publish(key: EventKey) {
    if (!this.#events.has(key)) return;
    const callbacks = this.#events.get(key);

    callbacks?.forEach(callback => callback());
  }

  subscribe<T>(key: EventKey, callback: Handler<T>) {
    const callbacks = this.#events.get(key);

    if (callbacks) {
      callbacks.add(callback);
    } else {
      this.#events.set(key, new Set([callback]));
    }
  }

  unsubscribe<T>(key: EventKey, callback: Handler<T>) {
    const callbacks = this.#events.get(key);

    callbacks?.delete(callback);
  }

  clearEvents() {
    this.#events.forEach(callbacks => {
      callbacks.clear();
    });
  }
}

const events = new RouteEvent();
export const onBeforeRouteEnter = onRouteEvent('onBeforeEnter');
export const onRouteEnter = onRouteEvent('onEnter');
export const onAfterRouteEnter = onRouteEvent('onAfterEnter');
export const onBeforeRouteLeave = onRouteEvent('onBeforeLeave');
export const onRouteLeave = onRouteEvent('onLeave');
export const onAfterRouteLeave = onRouteEvent('onAfterLeave');

function onRouteEvent<T>(name: RouterEventKey) {
  return (callback: Handler<T>) => {
    const currentRoute = inject(ROUTER_INJECT_KEY) as Router['currentRoute'];
    const routeName = currentRoute.value?.name;

    if (!routeName) {
      throw new Error('Route name is not defined');
    }
    const eventKey: EventKey = `${name}-${String(routeName)}`;
    const processed = () => {
      callback();
      events.unsubscribe(eventKey, processed);
    };

    events.subscribe(eventKey, processed);
  };
}

export function emitRouteEvent(name: RouterEventKey, route: string) {
  events.publish(`${name}-${route}`);
}
