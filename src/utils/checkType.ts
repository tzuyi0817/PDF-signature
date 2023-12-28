export const isArray = Array.isArray;
export const isObject = (value: unknown): value is Record<any, any> => typeof value === 'object' && value !== null;
