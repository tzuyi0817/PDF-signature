import { isArray, isObject } from '@/utils/checkType';

export function deepClone<T extends Record<string, unknown>>(obj: T, hash = new WeakMap()): T {
  if (obj instanceof Date || obj instanceof RegExp) return obj;
  if (hash.has(obj)) return hash.get(obj);

  const descriptors = Object.getOwnPropertyDescriptors(obj);
  const clone = isArray(obj) ? [] : Object.create(Object.getPrototypeOf(obj), descriptors);

  hash.set(obj, clone);
  Reflect.ownKeys(obj).forEach(key => {
    const value = obj[key as keyof T];
    clone[key] = isObject(value) ? deepClone(value, hash) : value;
  });
  return clone;
}

export function debounce(fun: unknown, time = 500) {
  if (typeof fun !== 'function') throw new TypeError('The first argument is not a function.');
  let timer: NodeJS.Timeout | null = null;

  return function (this: unknown, ...args: unknown[]) {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      fun.apply(this, args);
      timer = null;
    }, time);
  };
}

export function sleep(time = 500) {
  return new Promise(resolve => setTimeout(resolve, time));
}

export function isDesktop() {
  return window.innerWidth > 768;
}

export function getDPR() {
  return window.devicePixelRatio ?? 1;
}
