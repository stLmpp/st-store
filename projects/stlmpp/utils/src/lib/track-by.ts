import { TrackByFunction } from '@angular/core';
import { has } from 'lodash-es';
import { getDeep } from './get-deep';

export function trackByFactory<T = any>(key?: keyof T, ...fallback: (keyof T)[]): TrackByFunction<T> {
  return (index, element) => {
    if (!key || !element) return index;
    if (element?.[key]) {
      return element[key];
    } else {
      for (const fallbackKey of fallback) {
        if (element?.[fallbackKey]) {
          return element[fallbackKey];
        }
      }
      return index;
    }
  };
}

export function trackByConcat<T = any>(keys: (keyof T)[], concatBy = '-'): TrackByFunction<T> {
  return (index, element) => {
    return keys
      .filter(key => !!element?.[key])
      .reduce((acc, item, index1) => (index1 > 0 ? `${acc}${concatBy}${element[item]}` : `${element[item]}${acc}`), '');
  };
}

export function trackByDeep<T = any>(
  deepKey: string | string[],
  ...fallback: string[] | string[][]
): TrackByFunction<T> {
  return (index, element) => {
    if (!deepKey) return index;
    if (has(element, deepKey)) {
      return getDeep(element, deepKey);
    } else {
      for (const fallbackKey of fallback) {
        if (has(element, fallbackKey)) {
          return getDeep(element, fallbackKey);
        }
      }
      return index;
    }
  };
}
