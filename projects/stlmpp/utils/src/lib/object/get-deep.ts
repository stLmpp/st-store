import { Pipe, PipeTransform } from '@angular/core';
import { isArray, isString } from 'st-utils';

export function getDeep<T = any, K extends keyof T = keyof T, R = T[K]>(value: T, key: K): R;
export function getDeep<T = any, R = any>(obj: T, path: string, defaultValue?: any): R;
export function getDeep<T = any, R = any>(obj: T, path: string[], defaultValue?: any): R;
export function getDeep<T = any, R = any>(obj: T, path: string | string[], defaultValue?: any): R;
export function getDeep<T = any, R = any>(obj: T, path: string | string[], defaultValue?: any): R {
  if (isString(path) && !path.includes('.')) {
    return (obj as any)[path] ?? defaultValue;
  }
  if (!isArray(path)) path = path.split('.');
  if (path.length === 1) {
    return (obj as any)[path[0]] ?? defaultValue;
  }
  return path.reduce((acc, key) => (acc as any)?.[key], obj) ?? defaultValue;
}

@Pipe({ name: 'getDeep' })
export class GetDeepPipe implements PipeTransform {
  transform<T = any, K extends keyof T = keyof T, R = T[K]>(value: T, key: K): R;
  transform<T = any, R = any>(value: T, key: string): R;
  transform<T = any, R = any>(value: T, key: string[]): R;
  transform<T = any, R = any>(value: T, key: string | string[]): R {
    return getDeep(value, key);
  }
}
