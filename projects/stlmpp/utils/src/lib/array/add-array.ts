import { isArray } from '../util';

export function addArray<T>(array: T[], newItem: T | T[]): T[] {
  return [...(array ?? []), ...(isArray(newItem) ? newItem : [newItem])];
}
