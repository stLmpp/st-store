import { Pipe, PipeTransform } from '@angular/core';
import { Primitive } from 'type-fest';

@Pipe({ name: 'join' })
export class JoinPipe implements PipeTransform {
  /**
   * @description Join an array of objects into a string based on a key
   * @template T, K
   * @param {T[]} value
   * @param {K} key
   * @param {string} char
   * @returns {string}
   */
  transform<T extends Record<any, any>, K extends keyof T>(value: T[], key: K, char?: string): string;
  /**
   * @description Join an array of primitives into a string
   * @template T
   * @param {T[]} value
   * @param {"."} key
   * @param {string} char
   * @returns {string}
   */
  transform<T extends Primitive>(value: T[], key?: '.', char?: string): string;
  /**
   * @description Returns null if not array is provided
   * @param {null | undefined} value
   * @param {string} key
   * @param {string} char
   * @returns {null}
   */
  transform(value: null | undefined, key?: string, char?: string): null;
  transform<T, K extends keyof T>(value: T[] | null | undefined, key: K | '.' = '.', char = ', '): string | null {
    if (!value) {
      return null;
    }
    return (key !== '.' ? value.map(item => item[key]) : value).join(char);
  }
}
