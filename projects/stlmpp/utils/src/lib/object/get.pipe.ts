import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'get' })
export class GetPipe implements PipeTransform {
  /**
   * @description Simply tries to get (safely) the value of a object (shallow),
   * <br> if the object is null or undefined, or the key doesn't exists, returns undefined
   * @param {T | undefined} obj
   * @param {string | K} key
   * @returns {T[K] | undefined}
   */
  transform<T extends Record<any, any>, K extends keyof T>(obj: T | undefined, key: K | string): T[K] | undefined {
    return obj?.[key];
  }
}
