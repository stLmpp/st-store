import { isArray } from 'is-what';
import { Pipe, PipeTransform } from '@angular/core';

export function getDeep<T = any, R = any>(
  obj: T,
  path: string | string[],
  defaultValue?: any
): R {
  if (!isArray(path)) path = path.split('.');
  return path.reduce((acc, key) => acc?.[key], obj) ?? defaultValue;
}

@Pipe({ name: 'stGetDeep' })
export class GetDeepPipe implements PipeTransform {
  transform<T = any, R = any>(value: T, key: string | string[]): R {
    return getDeep(value, key);
  }
}
