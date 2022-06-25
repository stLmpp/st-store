import { TrackByFunction } from '@angular/core';

/**
 * @description Creates a {@link TrackByFunction} based on a key, if the object is null or undefined, returns the index
 * @template T
 * @param {keyof T} key
 * @returns {TrackByFunction<T>}
 */
export function trackByFactory<T = any>(key?: keyof T): TrackByFunction<T> {
  return key ? (index, entity) => entity?.[key] || index : index => index;
}
