import { map } from 'rxjs/operators';
import { MonoTypeOperatorFunction } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';
import { orderBy, OrderByDirection, OrderByType } from 'st-utils';

/**
 * @description OrderBy rxjs operator, uses a map with the {@link orderBy} function
 * @param {OrderByType<T>} keyOrCommand
 * @param {OrderByDirection} order
 * @returns {MonoTypeOperatorFunction<T[]>}
 */
export function orderByOperator<T>(
  keyOrCommand?: OrderByType<T>,
  order: OrderByDirection = 'asc'
): MonoTypeOperatorFunction<T[]> {
  return map(array => orderBy(array, keyOrCommand, order));
}

@Pipe({ name: 'orderBy' })
export class OrderByPipe implements PipeTransform {
  /**
   * @description OrderBy pipe, uses the {@link orderBy} function
   * @param {T[]} value
   * @param {OrderByType<T>} keyOrCommand
   * @param {OrderByDirection} order
   * @returns {T[]}
   */
  transform<T = any, K extends keyof T = keyof T>(
    value: T[],
    keyOrCommand?: OrderByType<T>,
    order: OrderByDirection = 'asc'
  ): T[] {
    return orderBy(value, keyOrCommand, order);
  }
}
