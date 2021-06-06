import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'max' })
export class MaxPipe implements PipeTransform {
  /**
   * @description Used to compare numbers and return the max {@link Math.max}
   * @param {number} value
   * @param {number} args
   * @returns {number}
   */
  transform(value: number, ...args: number[]): number {
    return Math.max(value, ...args);
  }
}
