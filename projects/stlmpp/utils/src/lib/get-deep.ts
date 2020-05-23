import { isArray } from 'is-what';

export function getDeep<T = any, R = any>(
  obj: T,
  path: string | string[],
  defaultValue?: any
): R {
  if (!isArray(path)) path = path.split('.');
  return path.reduce((acc, key) => acc?.[key], obj) ?? defaultValue;
}
