import { Pipe, PipeTransform } from '@angular/core';
import { map, OperatorFunction } from 'rxjs';
import { sum, sumBy } from 'st-utils';
import { ConditionalKeys } from 'type-fest';

/**
 * @description Sum rxjs operator, returns the sum of the array {@link sum}
 * @returns {OperatorFunction<number[], number>}
 */
export const sumOperator = (): OperatorFunction<number[], number> => map<number[], number>(sum);
/**
 * @description SumBy rxjs operator, return the sum of an array of objects based on a key {@link sumBy}
 * @template T
 * @template K
 * @param {K} key
 * @returns {OperatorFunction<T[], number>}
 */
export const sumByOperator = <T extends Record<any, any>, K extends ConditionalKeys<T, number | null | undefined>>(
  key: K
): OperatorFunction<T[], number> => map<T[], number>(values => sumBy<T, K>(values, key));

@Pipe({ name: 'sum' })
export class SumPipe implements PipeTransform {
  /**
   * @description Sum pipe, returns the sum of the array {@link sum}
   * @param {number[]} value
   * @returns {number}
   */
  transform(value: number[]): number {
    return sum(value);
  }
}

@Pipe({ name: 'sumBy' })
export class SumByPipe implements PipeTransform {
  /**
   * @description SumBy pipe, return the sum of an array of objects based on a key {@link sumBy}
   * @param {T[]} value
   * @param {K} key
   * @returns {number}
   */
  transform<T extends Record<any, any>, K extends ConditionalKeys<T, number | null | undefined>>(
    value: T[],
    key: K
  ): number {
    return sumBy<T, K>(value, key);
  }
}
