import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'any' })
export class AnyPipe implements PipeTransform {
  /**
   * @description Check if a value exists in a list
   * @param {T} value
   * @param {Iterable<T>} possibleValues
   * @returns {boolean}
   */
  transform<T = any>(value: T, possibleValues: Iterable<T>): boolean {
    return [...possibleValues].includes(value);
  }
}
