import { TrackByFunction } from '@angular/core';

export function trackByFactory<T = any>(key?: keyof T, ...fallback: (keyof T)[]): TrackByFunction<T> {
  if (!key) {
    return index => index;
  }
  return (index, element) => {
    if (!element) {
      return index;
    }
    if (element[key]) {
      return element[key];
    } else {
      for (const fallbackKey of fallback) {
        if (element[fallbackKey]) {
          return element[fallbackKey];
        }
      }
      return index;
    }
  };
}

export function trackByConcat<T = any>(keys: (keyof T)[], concatBy = '-'): TrackByFunction<T> {
  return (index, element) =>
    keys
      .filter(key => !!element?.[key])
      .reduce(
        (acc, item, index1) => (index1 > 0 ? `${acc}${concatBy}${element[item]}` : `${element[item]}${acc}`),
        ''
      ) || index;
}
