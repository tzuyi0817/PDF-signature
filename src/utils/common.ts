import { isArray, isObject } from '@/utils/checkType';

export function deepClone<T extends Record<any, any>>(obj: T, hash = new WeakMap()): T {
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

export function debounce(fun: Function, time = 500) {
  let timer: NodeJS.Timeout | null = null;

  return function (this: () => unknown, ...args: unknown[]) {
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
