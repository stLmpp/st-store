import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'get' })
export class GetPipe implements PipeTransform {
  transform<T extends Record<any, any>, K extends keyof T>(obj: T | undefined, key: K | string): T[K] | undefined {
    return obj?.[key];
  }
}
