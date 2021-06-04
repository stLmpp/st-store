import { Pipe, PipeTransform } from '@angular/core';
import { groupBy, GroupedTuple } from 'st-utils';

@Pipe({ name: 'groupBy' })
export class GroupByPipe implements PipeTransform {
  /**
   * @description Groups an array into a tuple {@link groupBy}
   * @param {T[]} value
   * @param {K} key
   * @returns {GroupedTuple<T, K>}
   */
  transform<T = any, K extends keyof T = keyof T>(value: T[], key: K): GroupedTuple<T, K> {
    return groupBy(value, key);
  }
}
