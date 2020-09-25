import { Pipe, PipeTransform } from '@angular/core';
import { idGetterFactory } from './util';

export function groupBy<T>(array: T[], idGetter: (entity: T) => any): [T[keyof T], T[]][] {
  return array.reduce((acc, item) => {
    if (!acc.some(([id]) => id === idGetter(item))) {
      return [...acc, [idGetter(item), [item]]];
    } else {
      return acc.map(([id, items]) => {
        if (id === idGetter(item)) {
          return [id, [...items, item]];
        }
        return [id, items];
      });
    }
  }, [] as [T[keyof T], T[]][]);
}

@Pipe({ name: 'stGroupBy' })
export class GroupByPipe implements PipeTransform {
  transform<T = any, K extends keyof T = keyof T>(value: T[], key: K): [T[keyof T], T[]][] {
    return groupBy(value, idGetterFactory(key));
  }
}
