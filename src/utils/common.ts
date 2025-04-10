import { isArray, isObject } from '@/utils/check-type';

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

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(fun: T, time = 500) {
  if (typeof fun !== 'function') throw new TypeError('The first argument is not a function.');
  let timer: NodeJS.Timeout | null = null;

  return function (this: void, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      fun.apply(this, args);
    }, time);
  };
}

export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(fun: T, time = 500) {
  if (typeof fun !== 'function') throw new TypeError('The first argument is not a function.');
  let lastTime = 0;

  return function (this: void, ...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastTime < time) return;

    fun.apply(this, args);
    lastTime = now;
  };
}

export function sleep(time = 500) {
  return new Promise(resolve => setTimeout(resolve, time));
}

export function isDesktop() {
  return window.innerWidth > 768;
}

export function transformTimestamp(timestamp: number) {
  const [date, time] = new Date(timestamp).toLocaleString('en-GB').split(',');
  const [day, month, year] = date.split('/');

  return `${year}-${month}-${day} ${time}`;
}

export function monitorDevicePixelRatio(callback: (ratio: number) => void) {
  let currentRatio = window.devicePixelRatio;

  const mediaQuery = window.matchMedia(`(resolution: ${currentRatio}dppx)`);

  const handleChange = () => {
    const newRatio = window.devicePixelRatio;
    if (newRatio !== currentRatio) {
      currentRatio = newRatio;
      callback(newRatio);
    }
  };

  mediaQuery.addEventListener('change', handleChange);

  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}
