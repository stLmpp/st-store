import { Pipe, PipeTransform } from '@angular/core';
import { Primitive } from 'type-fest';

@Pipe({ name: 'join' })
export class JoinPipe implements PipeTransform {
  /**
   * @description Join an array of objects into a string based on a key
   * @param {T[]} value
   * @param {K} key
   * @param {string} char
   * @returns {string}
   */
  transform<T extends Record<any, any>, K extends keyof T>(value: T[], key: K, char?: string): string;
  /**
   * @description Join an array of primitives into a string
   * @param {T[]} value
   * @param {"."} key
   * @param {string} char
   * @returns {string}
   */
  transform<T extends Primitive>(value: T[], key?: '.', char?: string): string;
  transform<T, K extends keyof T>(value: T[], key: K | '.' = '.', char = ', '): string {
    return (key !== '.' ? value.map(item => item[key]) : value).join(char);
  }
}
