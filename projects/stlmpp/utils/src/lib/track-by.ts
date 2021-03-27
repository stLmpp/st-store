import { TrackByFunction } from '@angular/core';

export function trackByFactory<T = any>(key?: keyof T): TrackByFunction<T> {
  return key ? (index, entity) => entity?.[key] || index : index => index;
}
