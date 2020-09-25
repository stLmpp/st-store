import { isArray, isFunction, isObject, isString } from 'lodash-es';
import { getDeep } from './get-deep';
import { map } from 'rxjs/operators';
import { MonoTypeOperatorFunction } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';
import sort from 'fast-sort';

export type OrderByType<T, K extends keyof T = keyof T> =
  | K[]
  | K
  | string
  | string[]
  | ((valueA: T, valueB: T) => number)
  | Record<K, OrderByDirection>;

export type OrderByDirection = 'asc' | 'desc';

export function orderBy<T>(array: T[], key?: keyof T, order?: OrderByDirection): T[];
export function orderBy<T>(array: T[], keys?: (keyof T)[], order?: OrderByDirection): T[];
export function orderBy<T>(array: T[], deepKey?: string, order?: OrderByDirection): T[];
export function orderBy<T>(array: T[], deepKeys?: string[], order?: OrderByDirection): T[];
export function orderBy<T>(array: T[], comparator?: (valueA: T, valueB: T) => number): T[];
export function orderBy<T, K extends keyof T>(values: T[], commands: Record<K, OrderByDirection>): T[];
export function orderBy<T>(values: T[], keyOrCommand?: OrderByType<T>, order?: OrderByDirection): T[];
export function orderBy<T, K extends keyof T>(
  values: T[],
  keyOrCommand?: OrderByType<T>,
  order: OrderByDirection = 'asc'
): T[] {
  if (!values?.length) return values;
  if (!order && !keyOrCommand) return values;
  values = [...values];
  if (!keyOrCommand) {
    return sort(values).asc();
  } else if (isFunction(keyOrCommand)) {
    return values.sort(keyOrCommand);
  } else if (isString(keyOrCommand)) {
    const getter = keyOrCommand.includes('.') ? getDeep : (value: T) => (value as any)[keyOrCommand];
    return sort(values)[order](entity => getter(entity, keyOrCommand));
  } else if (isArray(keyOrCommand)) {
    const getter = keyOrCommand.some((key: any) => key.includes('.')) ? getDeep : (value: T, key: K) => value[key];
    return sort(values)[order]((keyOrCommand as string[]).map(key => entity => getter(entity, key as any)));
  } else if (isObject(keyOrCommand)) {
    return sort(values).by(
      Object.entries<OrderByDirection>(keyOrCommand).map(([key, value]) => ({ [value]: key })) as any
    );
  } else {
    return values;
  }
}

export function orderByOperator<T>(key?: keyof T, order?: OrderByDirection): MonoTypeOperatorFunction<T[]>;
export function orderByOperator<T>(keys?: (keyof T)[], order?: OrderByDirection): MonoTypeOperatorFunction<T[]>;
export function orderByOperator<T>(deepKey?: string, order?: OrderByDirection): MonoTypeOperatorFunction<T[]>;
export function orderByOperator<T>(deepKeys?: string[], order?: OrderByDirection): MonoTypeOperatorFunction<T[]>;
export function orderByOperator<T>(comparator?: (valueA: T, valueB: T) => number): MonoTypeOperatorFunction<T[]>;
export function orderByOperator<T, K extends keyof T>(
  commands?: Record<K, OrderByDirection>
): MonoTypeOperatorFunction<T[]>;
export function orderByOperator<T>(
  keyOrCommand?: OrderByType<T>,
  order: OrderByDirection = 'asc'
): MonoTypeOperatorFunction<T[]> {
  return map(array => orderBy(array, keyOrCommand, order));
}

@Pipe({ name: 'stOrderBy' })
export class OrderByPipe implements PipeTransform {
  transform<T>(value: T[], key?: keyof T, order?: OrderByDirection): T[];
  transform<T>(value: T[], keys?: (keyof T)[], order?: OrderByDirection): T[];
  transform<T>(value: T[], deepKey?: string | string[], order?: OrderByDirection): T[];
  transform<T>(value: T[], deepKeys?: string[], order?: OrderByDirection): T[];
  transform<T>(value: T[], comparator?: (valueA: T, valueB: T) => number): T[];
  transform<T, K extends keyof T>(value: T[], commands?: Record<K, OrderByDirection>): T[];
  transform<T = any>(value: T[], keyOrCommand?: OrderByType<T>, order: OrderByDirection = 'asc'): T[] {
    return orderBy(value, keyOrCommand, order);
  }
}
