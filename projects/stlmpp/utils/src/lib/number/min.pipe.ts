import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'min' })
export class MinPipe implements PipeTransform {
  /**
   * @description Used to compare numbers and return the min {@link Math.min}
   * @param {number} value
   * @param {number} args
   * @returns {number}
   */
  transform(value: number, ...args: number[]): number {
    return Math.min(value, ...args);
  }
}
