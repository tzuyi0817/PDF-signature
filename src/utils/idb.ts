import { get, set, type UseStore } from 'idb-keyval';
import { isProxy, isReactive, isRef, toRaw } from 'vue';
import { hasOwn, isArray, isPlainObject } from './check-type';

export function getIdb<T>(key: IDBValidKey, customStore?: UseStore): Promise<T | undefined> {
  return get(key, customStore);
}

export function setIdb<T>(key: IDBValidKey, value: T, customStore?: UseStore) {
  return set(key, deepToRaw(value), customStore);
}

export function deepToRaw<T>(value: T): T {
  if (isArray(value)) return value.map(item => deepToRaw(item)) as T;
  if (isRef(value) || isProxy(value) || isReactive(value)) return deepToRaw(toRaw(value));
  if (isPlainObject(value)) {
    return Object.keys(value).reduce((obj, key) => {
      if (!hasOwn(value, key)) return obj;
      return ((obj[key] = deepToRaw(value[key])), obj);
    }, {} as T);
  }
  return value;
}
