import { isArray } from 'is-what';

export function addArray<T>(array: T[], newItem: T | T[]): T[] {
  return [...(array ?? []), ...(isArray(newItem) ? newItem : [newItem])];
}
