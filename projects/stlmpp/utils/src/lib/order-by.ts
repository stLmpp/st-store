import {
  isArray,
  isDate,
  isFunction,
  isNullOrUndefined,
  isNumber,
} from 'is-what';
import { getDeep } from './get-deep';
import { map } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';

export type OrderByType<T> =
  | (keyof T)[]
  | keyof T
  | string
  | string[]
  | ((valueA: T, valueB: T) => number);

export type OrderByDirection = 'asc' | 'desc';

export function compareValues<T>(valueA: T, valueB: T): number {
  if (isNullOrUndefined(valueA)) return 1;
  if (isNullOrUndefined(valueB)) return -1;
  if (
    (isNumber(valueA) && isNumber(valueB)) ||
    (isDate(valueA) && isDate(valueB))
  ) {
    // @ts-ignore
    return valueA - valueB;
  } else {
    return valueA.toString().localeCompare(valueB.toString());
  }
}

export function compareValuesKey<T>(
  valueA: T,
  valueB: T,
  key: keyof T | string
): number {
  return compareValues(
    getDeep(valueA, key as string),
    getDeep(valueB, key as string)
  );
}

export function compareValuesMultipleKeys<T, K extends keyof T = keyof T>(
  valueA: T,
  valueB: T,
  keys: K[] | string[]
): number {
  let result: number;
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
    if (getDeep(valueA, key as string) !== getDeep(valueB, key as string)) {
      result = compareValuesKey<T>(valueA, valueB, key);
      break;
    }
  }
  return result;
}

export function orderBy<T>(
  array: T[],
  key?: keyof T,
  order?: OrderByDirection
): T[];
export function orderBy<T>(
  array: T[],
  keys?: (keyof T)[],
  order?: OrderByDirection
): T[];
export function orderBy<T>(
  array: T[],
  deepKey?: string,
  order?: OrderByDirection
): T[];
export function orderBy<T>(
  array: T[],
  deepKeys?: string[],
  order?: OrderByDirection
): T[];
export function orderBy<T>(
  array: T[],
  comparator?: (valueA: T, valueB: T) => number
): T[];
export function orderBy<T>(
  values: T[],
  keyOrCommand?: OrderByType<T>,
  order?: OrderByDirection
): T[];
export function orderBy<T>(
  values: T[],
  keyOrCommand?: OrderByType<T>,
  order: OrderByDirection = 'asc'
): T[] {
  if (!values?.length) return values;
  if (!order) return values;
  if (!keyOrCommand) {
    return values.sort((valueA, valueB) => compareValues(valueA, valueB));
  } else if (isFunction(keyOrCommand)) {
    return [...values].sort(keyOrCommand);
  } else {
    return [...values].sort((valueA, valueB) => {
      if (order === 'asc') {
        return isArray(keyOrCommand)
          ? compareValuesMultipleKeys(valueA, valueB, keyOrCommand)
          : compareValuesKey(valueA, valueB, keyOrCommand);
      } else {
        return isArray(keyOrCommand)
          ? compareValuesMultipleKeys(valueB, valueA, keyOrCommand)
          : compareValuesKey(valueB, valueA, keyOrCommand);
      }
    });
  }
}

export function orderByOperator<T>(
  key?: keyof T,
  order?: OrderByDirection
): OperatorFunction<T[], T[]>;
export function orderByOperator<T>(
  keys?: (keyof T)[],
  order?: OrderByDirection
): OperatorFunction<T[], T[]>;
export function orderByOperator<T>(
  deepKey?: string,
  order?: OrderByDirection
): OperatorFunction<T[], T[]>;
export function orderByOperator<T>(
  deepKeys?: string[],
  order?: OrderByDirection
): OperatorFunction<T[], T[]>;
export function orderByOperator<T>(
  comparator?: (valueA: T, valueB: T) => number
): OperatorFunction<T[], T[]>;
export function orderByOperator<T>(
  keyOrCommand?: OrderByType<T>,
  order: OrderByDirection = 'asc'
): OperatorFunction<T[], T[]> {
  return map(array => orderBy(array, keyOrCommand, order));
}

@Pipe({ name: 'stOrderBy' })
export class OrderByPipe implements PipeTransform {
  transform<T>(value: T[], key?: keyof T, order?: OrderByDirection): T[];
  transform<T>(value: T[], keys?: (keyof T)[], order?: OrderByDirection): T[];
  transform<T>(
    value: T[],
    deepKey?: string | string[],
    order?: OrderByDirection
  ): T[];
  transform<T>(value: T[], deepKeys?: string[], order?: OrderByDirection): T[];
  transform<T>(value: T[], comparator?: (valueA: T, valueB: T) => number): T[];
  transform<T = any>(
    value: T[],
    keyOrCommand?: OrderByType<T>,
    order: OrderByDirection = 'asc'
  ): T[] {
    return orderBy(value, keyOrCommand, order);
  }
}
