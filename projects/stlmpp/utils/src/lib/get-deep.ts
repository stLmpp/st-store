import { Pipe, PipeTransform } from '@angular/core';
import { getDeep } from './util';

@Pipe({ name: 'stGetDeep' })
export class GetDeepPipe implements PipeTransform {
  transform<T = any, K extends keyof T = keyof T, R = T[K]>(value: T, key: K): R;
  transform<T = any, R = any>(value: T, key: string): R;
  transform<T = any, R = any>(value: T, key: string[]): R;
  transform<T = any, R = any>(value: T, key: string | string[]): R {
    return getDeep(value, key);
  }
}
