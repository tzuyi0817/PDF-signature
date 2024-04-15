export const isArray = Array.isArray;
export const toRawType = (value: unknown) => Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isFunction = (value: unknown): value is () => unknown => typeof value === 'function';
export const isPlainObject = (value: unknown): value is object => toRawType(value) === 'object';
export const hasOwn = <T extends object>(obj: T, key: PropertyKey): key is keyof T => Object.hasOwn(obj, key);

export function isPrimitive(value: unknown) {
  const primitive = new Set(['string', 'bigint', 'boolean', 'undefined', 'symbol']);

  return value === null || primitive.has(typeof value);
}
