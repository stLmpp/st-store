import { Pipe, PipeTransform } from '@angular/core';

export function search<T = any>(
  array: T[],
  keyOrKeys: keyof T | (keyof T)[] | string | string[],
  term: any,
  reverse = false
): T[] {
  if (!array?.length || !keyOrKeys || !term) {
    return array;
  }
  term = ('' + term)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
  return array.filter(val => {
    return keys.some(key => {
      const valKey = ('' + val[key as string])
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return reverse ? !valKey.includes(term) : valKey.includes(term);
    });
  });
}

@Pipe({ name: 'search' })
export class SearchPipe implements PipeTransform {
  transform<T = any>(
    value: T[],
    keyOrKeys: keyof T | (keyof T)[] | string | string[],
    term: any,
    reverse = false
  ): T[] {
    return search(value, keyOrKeys, term, reverse);
  }
}
